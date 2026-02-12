import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import subscriptionService from '../services/subscriptionService';
import analyticsService from '../services/analyticsService';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import {
    FaChartLine,
    FaFileAlt,
    FaUserCircle,
    FaBell,
    FaCheckCircle,
    FaWallet,
    FaSearch,
    FaFilter,
    FaSort,
    FaPlus
} from 'react-icons/fa';
import SubscriptionForm from '../components/SubscriptionForm';
import SubscriptionItem from '../components/SubscriptionItem';
import AddPaymentModal from '../components/AddPaymentModal';

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
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('date-asc');

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            const fetchDashboardData = async () => {
                try {
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    const token = storedUser ? storedUser.token : null;

                    if (token) {
                        const [subs, summary] = await Promise.all([
                            subscriptionService.getSubscriptions(token),
                            analyticsService.getAnalyticsSummary(token)
                        ]);

                        setSubscriptions(subs);
                        setFilteredSubscriptions(subs);
                        setAnalyticsSummary(summary);
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
    }, [user, navigate]);

    // Handle Search, Filter, Sort
    useEffect(() => {
        let result = [...subscriptions];

        if (filterCategory !== 'All') {
            result = result.filter(sub =>
                sub.category && sub.category.toLowerCase() === filterCategory.toLowerCase()
            );
        }

        if (searchTerm) {
            result = result.filter(sub =>
                sub.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        result.sort((a, b) => {
            if (sortBy === 'date-asc') {
                const dateA = a.nextRenewalDate ? new Date(a.nextRenewalDate) : new Date(8640000000000000);
                const dateB = b.nextRenewalDate ? new Date(b.nextRenewalDate) : new Date(8640000000000000);
                return dateA - dateB;
            } else if (sortBy === 'date-desc') {
                const dateA = a.nextRenewalDate ? new Date(a.nextRenewalDate) : new Date(0);
                const dateB = b.nextRenewalDate ? new Date(b.nextRenewalDate) : new Date(0);
                return dateB - dateA;
            } else if (sortBy === 'cost-asc') {
                return a.price - b.price;
            } else if (sortBy === 'cost-desc') {
                return b.price - a.price;
            }
            return 0;
        });

        setFilteredSubscriptions(result);
    }, [subscriptions, searchTerm, filterCategory, sortBy]);


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
    }).filter(sub => sub.status === 'Upcoming' || (sub.daysUntilRenewal >= 0 && sub.daysUntilRenewal <= 7));

    const expiringSoon = upcomingPayments;

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <section className="dashboard">
            <header>
                <h1>Welcome {user && user.username}</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/analytics')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaChartLine /> Analytics
                    </button>
                    <button onClick={() => navigate('/reports')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaFileAlt /> Reports
                    </button>
                    <button onClick={() => navigate('/profile')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaUserCircle /> Profile
                    </button>
                    <button onClick={handleLogout} className="btn">Logout</button>
                </div>
            </header>

            {/* Upcoming Payment Alerts */}
            {!showForm && upcomingPayments.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)',
                    backdropFilter: 'blur(10px)',
                    padding: '20px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                    marginBottom: '30px'
                }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontSize: '20px', color: '#ff6b6b' }}>
                        <FaBell /> Upcoming Payments ({upcomingPayments.length})
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                        {upcomingPayments.map((payment) => {
                            const isUrgent = payment.daysUntilRenewal <= 2;
                            return (
                                <div
                                    key={payment._id}
                                    style={{
                                        background: isUrgent
                                            ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 68, 68, 0.2) 100%)'
                                            : 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        border: isUrgent
                                            ? '1px solid rgba(255, 107, 107, 0.5)'
                                            : '1px solid rgba(255, 193, 7, 0.5)',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{payment.name}</h3>
                                        <span style={{
                                            background: isUrgent ? '#ff6b6b' : '#ffc107',
                                            color: '#000',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {payment.daysUntilRenewal === 0 ? 'TODAY' : `${payment.daysUntilRenewal}d`}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '5px 0' }}>
                                        {payment.category}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#43e97b', margin: '5px 0' }}>
                                            ₹{payment.price}
                                        </p>
                                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                                            {payment.billingCycle}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px', marginBottom: 0 }}>
                                        Due: {new Date(payment.nextRenewalDate).toLocaleDateString()}
                                    </p>
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                        backdropFilter: 'blur(10px)',
                        padding: '20px',
                        borderRadius: '15px',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <FaCheckCircle style={{ fontSize: '32px', color: '#667eea' }} />
                        </div>
                        <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>Active</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', margin: 0 }}>{analyticsSummary.activeCount}</p>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.2) 0%, rgba(56, 239, 125, 0.2) 100%)',
                        backdropFilter: 'blur(10px)',
                        padding: '20px',
                        borderRadius: '15px',
                        border: '1px solid rgba(67, 233, 123, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <FaWallet style={{ fontSize: '32px', color: '#43e97b' }} />
                        </div>
                        <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>Current Month Spending</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#43e97b', margin: '0 0 5px 0' }}>₹{analyticsSummary.monthlyTotal}</p>
                        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
                            Dynamic Calculation
                        </span>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 193, 7, 0.2) 100%)',
                        backdropFilter: 'blur(10px)',
                        padding: '20px',
                        borderRadius: '15px',
                        border: '1px solid rgba(255, 152, 0, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <FaBell style={{ fontSize: '32px', color: '#ff9800' }} />
                        </div>
                        <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>Upcoming</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>{analyticsSummary.upcomingCount}</p>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)',
                        backdropFilter: 'blur(10px)',
                        padding: '20px',
                        borderRadius: '15px',
                        border: '1px solid rgba(255, 193, 7, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <FaWallet style={{ fontSize: '32px', color: '#ff9800' }} />
                        </div>
                        <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>All Time Spent</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>₹{analyticsSummary.allTimeTotal || 0}</p>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 68, 68, 0.2) 100%)',
                        backdropFilter: 'blur(10px)',
                        padding: '20px',
                        borderRadius: '15px',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <FaFileAlt style={{ fontSize: '32px', color: '#ff6b6b' }} />
                        </div>
                        <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>Expired</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6b6b', margin: 0 }}>{analyticsSummary.expiredCount}</p>
                    </div>
                </div>
            )}

            {/* Controls Area */}
            {!showForm && (
                <div className="controls">
                    <div className="control-group">
                        <div style={{ position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', top: '12px', left: '10px', color: '#999' }} />
                            <input
                                type="text"
                                placeholder="Search subscriptions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '35px' }}
                            />
                        </div>
                    </div>
                    <div className="control-group">
                        <FaFilter style={{ marginRight: '5px', color: '#666' }} />
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            {categories.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="control-group">
                        <FaSort style={{ marginRight: '5px', color: '#666' }} />
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="date-asc">Renewal: Soonest First</option>
                            <option value="date-desc">Renewal: Latest First</option>
                            <option value="cost-desc">Cost: High to Low</option>
                            <option value="cost-asc">Cost: Low to High</option>
                        </select>
                    </div>
                    <button className="btn" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaPlus /> Add New
                    </button>
                </div>
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

                {/* Expiring Soon Section */}
                {!showForm && expiringSoon.length > 0 && (
                    <section style={{
                        background: 'rgba(255, 152, 0, 0.1)',
                        border: '2px solid rgba(255, 152, 0, 0.5)',
                        borderRadius: '15px',
                        padding: '20px',
                        marginBottom: '30px'
                    }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <FaBell style={{ color: '#ff9800' }} />
                            Expiring Soon ({expiringSoon.length})
                        </h2>
                        <div className="subscriptions">
                            {expiringSoon.map((sub) => (
                                <SubscriptionItem key={sub._id} subscription={sub} onDelete={deleteSubscription} onEdit={startEdit} onPay={() => handlePayClick(sub)} />
                            ))}
                        </div>
                    </section>
                )}

                <section className="content">
                    {filteredSubscriptions.length > 0 ? (
                        <div className="subscriptions">
                            {filteredSubscriptions.map((sub) => (
                                <SubscriptionItem
                                    key={sub._id}
                                    subscription={sub}
                                    onDelete={deleteSubscription}
                                    onEdit={startEdit}
                                    onPay={() => handlePayClick(sub)}
                                />
                            ))}
                        </div>
                    ) : (
                        !showForm && (
                            <div style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: '30px',
                                textAlign: 'center',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                <h3 style={{ marginBottom: '10px' }}>No subscriptions yet</h3>
                                <p style={{ marginBottom: '20px' }}>
                                    Start by adding your first subscription to track renewals and spending.
                                </p>
                                <button className="btn" onClick={() => setShowForm(true)}>Add Subscription</button>
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
