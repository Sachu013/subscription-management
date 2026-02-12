import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import subscriptionService from '../services/subscriptionService';
import analyticsService from '../services/analyticsService';
import budgetService from '../services/budgetService';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import {
    FaPlus,
    FaChartLine,
    FaSort,
    FaBell,
    FaCalendarAlt,
    FaFileAlt,
    FaUserCircle,
    FaWallet,
    FaCheckCircle,
    FaMoon,
    FaSun
} from 'react-icons/fa';
import SubscriptionItem from '../components/SubscriptionItem';
import SubscriptionForm from '../components/SubscriptionForm';
import FilterBar from '../components/FilterBar';
import AddPaymentModal from '../components/AddPaymentModal';
import useDebounce from '../hooks/useDebounce';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const [subscriptions, setSubscriptions] = useState([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
    const [analyticsSummary, setAnalyticsSummary] = useState({
        activeCount: 0,
        expiredCount: 0,
        upcomingCount: 0,
        monthlyTotal: 0,
        allTimeTotal: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [showPayModal, setShowPayModal] = useState(false);
    const [subForPayment, setSubForPayment] = useState(null);

    // Controls State
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [billingCycle, setBillingCycle] = useState('All');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('date-asc');

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [budgetData, setBudgetData] = useState({
        budget: { monthlyLimit: 0 },
        monthlySpending: 0,
        categorySpending: {}
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            const fetchDashboardData = async () => {
                try {
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    const token = storedUser ? storedUser.token : null;

                    if (token) {
                        const params = {
                            search: debouncedSearch,
                            status: filterStatus,
                            category: filterCategory,
                            billingCycle: billingCycle,
                            minPrice: minPrice,
                            maxPrice: maxPrice
                        };

                        const [subs, summary, budget] = await Promise.all([
                            subscriptionService.getSubscriptions(token, params),
                            analyticsService.getAnalyticsSummary(token, params),
                            budgetService.getBudget(token)
                        ]);

                        setSubscriptions(subs);
                        setFilteredSubscriptions(subs);
                        setAnalyticsSummary(summary);
                        setBudgetData(budget);
                    }
                } catch (error) {
                    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                    toast.error(message);
                } finally {
                    setIsLoading(false);
                }
            }
            fetchDashboardData();
        }
    }, [user, navigate, debouncedSearch, filterStatus, filterCategory, billingCycle, minPrice, maxPrice]);

    const handleBudgetUpdate = async (newLimit) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const updated = await budgetService.updateBudget({ monthlyLimit: Number(newLimit) }, storedUser.token);
            setBudgetData({ ...budgetData, budget: updated });
            toast.success('Budget Updated');
        } catch (error) {
            toast.error('Failed to update budget');
        }
    };

    // Handle Sort
    useEffect(() => {
        let result = [...subscriptions];

        result.sort((a, b) => {
            if (sortBy === 'date-asc') {
                const dateA = a.nextRenewalDate ? new Date(a.nextRenewalDate) : new Date(8640000000000000);
                const dateB = b.nextRenewalDate ? new Date(b.nextRenewalDate) : new Date(8640000000000000);
                return dateA - dateB;
            } else if (sortBy === 'date-desc') {
                const dateA = a.nextRenewalDate ? new Date(a.nextRenewalDate) : new Date(0);
                const dateB = b.nextRenewalDate ? new Date(b.nextRenewalDate) : new Date(0);
                return dateB - dateA;
            } else if (sortBy === 'cost-desc') {
                return b.price - a.price;
            } else if (sortBy === 'cost-asc') {
                return a.price - b.price;
            }
            return 0;
        });

        setFilteredSubscriptions(result);
    }, [subscriptions, sortBy]);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handlePayClick = (subscription) => {
        setSubForPayment(subscription);
        setShowPayModal(true);
    };

    const confirmPayment = async (id, paymentData) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser.token;
            const updatedSub = await subscriptionService.paySubscription(id, token, paymentData);

            setSubscriptions(subscriptions.map(sub => (sub._id === id ? updatedSub : sub)));

            const summary = await analyticsService.getAnalyticsSummary(token);
            setAnalyticsSummary(summary);
            toast.success('Payment added successfully!');
        } catch (error) {
            toast.error('Error adding payment');
        }
    };

    const togglePauseSubscription = async (subscription) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser.token;
            const newStatus = subscription.status === 'Paused' ? 'Active' : 'Paused';

            const updateData = { status: newStatus };
            if (newStatus === 'Active') {
                updateData.startDate = new Date();
            }

            const updatedSub = await subscriptionService.updateSubscription(subscription._id, updateData, token);
            setSubscriptions(subscriptions.map(sub => (sub._id === subscription._id ? updatedSub : sub)));

            toast.success(`Subscription ${newStatus === 'Paused' ? 'Paused' : 'Resumed'}`);
        } catch (error) {
            toast.error('Error updating status');
        }
    };

    const createSubscription = async (formData) => {
        setIsLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser.token;
            const newSub = await subscriptionService.createSubscription(formData, token);
            setSubscriptions([...subscriptions, newSub]);
            const summary = await analyticsService.getAnalyticsSummary(token);
            setAnalyticsSummary(summary);
            toast.success('Subscription Added!');
            setShowForm(false);
        } catch (error) {
            toast.error('Error creating subscription');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSubscription = async (id) => {
        if (window.confirm('Are you sure you want to delete this subscription?')) {
            setIsLoading(true);
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const token = storedUser.token;
                await subscriptionService.deleteSubscription(id, token);
                setSubscriptions(subscriptions.filter((sub) => sub._id !== id));
                const summary = await analyticsService.getAnalyticsSummary(token);
                setAnalyticsSummary(summary);
                toast.success('Subscription Deleted');
            } catch (error) {
                toast.error('Error deleting subscription');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const startEdit = (subscription) => {
        setIsEditing(true);
        setCurrentSubscription(subscription);
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const updateSubscription = async (formData) => {
        setIsLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser.token;
            const updatedSub = await subscriptionService.updateSubscription(currentSubscription._id, formData, token);

            setSubscriptions(subscriptions.map(sub => (sub._id === currentSubscription._id ? updatedSub : sub)));

            const summary = await analyticsService.getAnalyticsSummary(token);
            setAnalyticsSummary(summary);

            setIsEditing(false);
            setCurrentSubscription(null);
            setShowForm(false);
            toast.success('Subscription Updated!');
        } catch (error) {
            toast.error('Error updating subscription');
        } finally {
            setIsLoading(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setCurrentSubscription(null);
        setShowForm(false);
    }

    const resetFilters = () => {
        setSearchTerm('');
        setFilterCategory('All');
        setFilterStatus('All');
        setBillingCycle('All');
        setMinPrice('');
        setMaxPrice('');
    };

    const categories = [
        'All',
        'Entertainment',
        'Music',
        'OTT / Streaming',
        'Gaming',
        'Education',
        'Productivity',
        'Cloud Services',
        'Developer Tools',
        'Design Tools',
        'Finance',
        'Health & Fitness',
        'Food & Delivery',
        'News & Media',
        'Shopping',
        'Utilities',
        'Travel',
        'Storage',
        'Communication',
        'Security',
        'AI Tools',
        'Other'
    ];

    const upcomingPayments = subscriptions.map(sub => {
        const nextDue = new Date(sub.nextRenewalDate);
        const diffTime = nextDue - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...sub, daysUntilRenewal: diffDays };
    }).filter(sub => sub.status === 'Upcoming' || (sub.daysUntilRenewal >= 0 && sub.daysUntilRenewal <= 7)).sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

    const { theme, toggleTheme } = useContext(ThemeContext);

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <section className="dashboard">
            <header>
                <div>
                    <h1 style={{ fontSize: '1.6rem' }}>Welcome, {user && user.username}</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Here's your subscription overview</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={toggleTheme}
                        className="btn"
                        style={{
                            background: 'var(--background)',
                            color: 'var(--primary)',
                            borderRadius: '50%',
                            padding: '12px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'none'
                        }}
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>
                    <button onClick={() => navigate('/analytics')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaChartLine /> Analytics
                    </button>
                    <button onClick={() => navigate('/calendar')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCalendarAlt /> Calendar
                    </button>
                    <button onClick={() => navigate('/reports')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaFileAlt /> Reports
                    </button>

                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px',
                                borderRadius: '50%',
                                background: 'var(--background)',
                                border: '1px solid var(--border-color)',
                                position: 'relative',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <FaBell />
                            {upcomingPayments.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    background: 'var(--danger)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    padding: '2px 6px',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    transform: 'translate(25%, -25%)',
                                    border: '2px solid var(--card-bg)'
                                }}>
                                    {upcomingPayments.length}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div style={{
                                position: 'absolute',
                                top: '55px',
                                right: '0',
                                width: '340px',
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '20px',
                                zIndex: 1000,
                                boxShadow: 'var(--shadow)',
                                animation: 'fadeIn 0.2s ease-out'
                            }}>
                                <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--primary)', fontSize: '1rem' }}>
                                    Upcoming Renewals
                                </h4>
                                {upcomingPayments.length === 0 ? (
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>No payments due soon</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                                        {upcomingPayments.map(sub => (
                                            <div key={sub._id} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 12px',
                                                borderRadius: '12px',
                                                background: 'var(--background)',
                                                border: '1px solid var(--border-color)'
                                            }}>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{sub.name}</p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: sub.daysUntilRenewal <= 1 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                                        {sub.daysUntilRenewal === 0 ? 'Due Today' :
                                                            sub.daysUntilRenewal === 1 ? 'Due Tomorrow' : `In ${sub.daysUntilRenewal} days`}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary)', fontSize: '14px' }}>₹{sub.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button onClick={() => navigate('/profile')} className="btn" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        borderRadius: '50%',
                        padding: '12px',
                        background: 'var(--background)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <FaUserCircle />
                    </button>
                    <button onClick={handleLogout} className="btn" style={{ background: 'var(--danger)', color: '#fff' }}>Logout</button>
                </div>
            </header>

            {/* Upcoming Payment Alerts */}
            {!showForm && upcomingPayments.length > 0 && (
                <div style={{
                    background: 'var(--background)',
                    padding: '25px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '30px'
                }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', fontSize: '1.2rem', color: 'var(--primary)' }}>
                        <FaBell /> Priorities
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {upcomingPayments.slice(0, 3).map((payment) => {
                            const isUrgent = payment.daysUntilRenewal <= 2;
                            return (
                                <div
                                    key={payment._id}
                                    style={{
                                        background: 'var(--card-bg)',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: isUrgent ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                                        boxShadow: 'var(--shadow)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>{payment.name}</h3>
                                        <span style={{
                                            background: isUrgent ? 'var(--danger)' : 'var(--background)',
                                            color: isUrgent ? '#fff' : 'var(--text-primary)',
                                            padding: '4px 10px',
                                            borderRadius: '10px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            border: isUrgent ? 'none' : '1px solid var(--border-color)'
                                        }}>
                                            {payment.daysUntilRenewal === 0 ? 'TODAY' : `${payment.daysUntilRenewal}d`}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', margin: '0 0 10px 0' }}>
                                        ₹{payment.price}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{payment.category}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.7 }}>
                                            {new Date(payment.nextRenewalDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            {!showForm && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        padding: '25px',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <FaCheckCircle style={{ fontSize: '28px', color: 'var(--primary)' }} />
                        </div>
                        <h3 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Active</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>{analyticsSummary.activeCount}</p>
                    </div>

                    <div style={{
                        background: 'var(--card-bg)',
                        padding: '25px',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <FaWallet style={{ fontSize: '28px', color: 'var(--primary)' }} />
                        </div>
                        <h3 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Total</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>₹{analyticsSummary.monthlyTotal}</p>
                    </div>

                    <div style={{
                        background: 'var(--card-bg)',
                        padding: '25px',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <FaBell style={{ fontSize: '28px', color: 'var(--primary)' }} />
                        </div>
                        <h3 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Upcoming</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>{analyticsSummary.upcomingCount || 0}</p>
                    </div>

                    <div style={{
                        background: 'var(--card-bg)',
                        padding: '25px',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <FaFileAlt style={{ fontSize: '28px', color: 'var(--danger)' }} />
                        </div>
                        <h3 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Expired</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--danger)', margin: 0 }}>{analyticsSummary.expiredCount || 0}</p>
                    </div>
                </div>
            )}

            {/* Budget Tracker */}
            {!showForm && (
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '30px',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '40px',
                    boxShadow: 'var(--shadow)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '20px' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Monthly Budget Tracker</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Limit: ₹</span>
                            <input
                                type="number"
                                defaultValue={budgetData.budget?.monthlyLimit || 0}
                                onBlur={(e) => handleBudgetUpdate(e.target.value)}
                                style={{
                                    background: 'var(--background)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    padding: '10px 15px',
                                    borderRadius: '12px',
                                    width: '140px',
                                    fontWeight: 'bold'
                                }}
                            />
                        </div>
                    </div>

                    {budgetData.budget?.monthlyLimit > 0 ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Utilization: {((budgetData.monthlySpending / budgetData.budget.monthlyLimit) * 100).toFixed(1)}%</span>
                                <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 'bold' }}>₹{budgetData.monthlySpending.toFixed(2)} / ₹{budgetData.budget.monthlyLimit}</span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '12px',
                                background: 'var(--background)',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: '1px solid var(--border-color)'
                            }}>
                                <div style={{
                                    width: `${Math.min((budgetData.monthlySpending / budgetData.budget.monthlyLimit) * 100, 100)}%`,
                                    height: '100%',
                                    background: budgetData.monthlySpending > budgetData.budget.monthlyLimit ? 'var(--danger)' : 'var(--primary)',
                                    transition: 'width 0.8s ease-in-out'
                                }}></div>
                            </div>
                            {budgetData.monthlySpending > budgetData.budget.monthlyLimit && (
                                <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '12px', fontWeight: 'bold' }}>
                                    ⚠️ Attention: Monthly limit exceeded.
                                </p>
                            )}
                        </div>
                    ) : (
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '14px' }}>Set a monthly limit to visualize your spending habits.</p>
                    )}
                </div>
            )}

            {/* Controls Area */}
            {!showForm && (
                <>
                    <FilterBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        status={filterStatus}
                        setStatus={setFilterStatus}
                        category={filterCategory}
                        setCategory={setFilterCategory}
                        categories={categories.filter(c => c !== 'All')}
                        billingCycle={billingCycle}
                        setBillingCycle={setBillingCycle}
                        minPrice={minPrice}
                        setMinPrice={setMinPrice}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
                        onReset={resetFilters}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', marginTop: '10px', flexWrap: 'wrap', gap: '15px' }}>
                        <div className="form-group" style={{
                            marginBottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'var(--card-bg)',
                            padding: '5px 15px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <FaSort style={{ color: 'var(--text-secondary)', fontSize: '14px' }} />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer', outline: 'none' }}>
                                <option value="date-asc">Due Soon</option>
                                <option value="date-desc">Latest First</option>
                                <option value="cost-desc">High Cost</option>
                                <option value="cost-asc">Low Cost</option>
                            </select>
                        </div>
                        <button className="btn" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 25px', borderRadius: '14px' }}>
                            <FaPlus /> New Subscription
                        </button>
                    </div>
                </>
            )}

            <div className="content">
                {showForm && (
                    <SubscriptionForm
                        onFormSubmit={isEditing ? updateSubscription : createSubscription}
                        initialData={currentSubscription}
                        isEditMode={isEditing}
                        onCancel={cancelEdit}
                    />
                )}

                <section>
                    {filteredSubscriptions.length > 0 ? (
                        <div className="subscriptions">
                            {filteredSubscriptions.map((sub) => (
                                <SubscriptionItem
                                    key={sub._id}
                                    subscription={sub}
                                    onDelete={deleteSubscription}
                                    onEdit={startEdit}
                                    onPay={() => handlePayClick(sub)}
                                    onPause={togglePauseSubscription}
                                />
                            ))}
                        </div>
                    ) : (
                        !showForm && (
                            <div style={{
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '20px',
                                padding: '60px 40px',
                                textAlign: 'center',
                                color: 'var(--text-secondary)',
                                boxShadow: 'var(--shadow)'
                            }}>
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>Everything looks clear!</h3>
                                <p style={{ marginBottom: '30px', fontSize: '15px' }}>
                                    No subscriptions match your current filters. Clear them or add a new one.
                                </p>
                                <button className="btn" onClick={() => setShowForm(true)}>Add First Subscription</button>
                            </div>
                        )
                    )}
                </section>
            </div>

            {showPayModal && subForPayment && (
                <AddPaymentModal
                    subscription={subForPayment}
                    onClose={() => {
                        setShowPayModal(false);
                        setSubForPayment(null);
                    }}
                    onConfirm={confirmPayment}
                />
            )}
        </section>
    );
};

export default Dashboard;
