import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import subscriptionService from '../services/subscriptionService';
import SubscriptionForm from '../components/SubscriptionForm';
import SubscriptionItem from '../components/SubscriptionItem';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { FaPlus, FaFilter, FaSort, FaSearch, FaBell, FaChartLine, FaFileAlt, FaUserCircle, FaCheckCircle, FaWallet } from 'react-icons/fa';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const [subscriptions, setSubscriptions] = useState([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Controls State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('date-asc'); // date-asc, date-desc, cost-asc, cost-desc

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            const fetchSubscriptions = async () => {
                try {
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    const token = storedUser ? storedUser.token : null;

                    if (token) {
                        const subs = await subscriptionService.getSubscriptions(token);
                        setSubscriptions(subs);
                        setFilteredSubscriptions(subs);
                    }
                } catch (error) {
                    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                    toast.error(message);
                } finally {
                    setIsLoading(false);
                }
            }
            fetchSubscriptions();
        }
    }, [user, navigate]);

    // Handle Search, Filter, Sort
    useEffect(() => {
        let result = [...subscriptions];

        // Filter by Category
        if (filterCategory !== 'All') {
            result = result.filter(sub =>
                sub.category && sub.category.toLowerCase() === filterCategory.toLowerCase()
            );
        }

        // Search by Name
        if (searchTerm) {
            result = result.filter(sub =>
                sub.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'date-asc') {
                return new Date(a.nextBillingDate) - new Date(b.nextBillingDate);
            } else if (sortBy === 'date-desc') {
                return new Date(b.nextBillingDate) - new Date(a.nextBillingDate);
            } else if (sortBy === 'cost-asc') {
                return a.cost - b.cost;
            } else if (sortBy === 'cost-desc') {
                return b.cost - a.cost;
            }
            return 0;
        });

        setFilteredSubscriptions(result);
    }, [subscriptions, searchTerm, filterCategory, sortBy]);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const createSubscription = async (formData) => {
        setIsLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser.token;
            const newSub = await subscriptionService.createSubscription(formData, token);
            setSubscriptions([...subscriptions, newSub]); // This triggers the useEffect above
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

    // Predefined categories for filter
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

    // Get expiring subscriptions
    const getExpiringSoon = () => {
        const today = new Date();
        return subscriptions.filter(sub => {
            if (!sub.reminderEnabled || !sub.nextBillingDate) return false;
            const nextBilling = new Date(sub.nextBillingDate);
            const daysUntilRenewal = Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24));
            return daysUntilRenewal <= sub.reminderDays && daysUntilRenewal >= 0;
        });
    };

    const expiringSoon = getExpiringSoon();

    // Calculate summary metrics
    const calculateSummaryMetrics = () => {
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active');
        let monthlyTotal = 0;

        activeSubscriptions.forEach(sub => {
            if (sub.billingCycle === 'Monthly') {
                monthlyTotal += sub.cost;
            } else if (sub.billingCycle === 'Yearly') {
                monthlyTotal += sub.cost / 12;
            } else if (sub.billingCycle === 'Weekly') {
                monthlyTotal += sub.cost * 4;
            }
        });

        return {
            activeCount: activeSubscriptions.length,
            monthlyTotal: monthlyTotal.toFixed(2),
            expiringCount: expiringSoon.length
        };
    };

    const summaryMetrics = calculateSummaryMetrics();

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

            {/* Summary Cards */}
            {!showForm && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
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
                        <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>Active Subscriptions</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', margin: 0 }}>{summaryMetrics.activeCount}</p>
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
                        <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>Monthly Cost</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#43e97b', margin: 0 }}>₹{summaryMetrics.monthlyTotal}</p>
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
                        <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>Expiring Soon</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>{summaryMetrics.expiringCount}</p>
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
                                <SubscriptionItem key={sub._id} subscription={sub} onDelete={deleteSubscription} onEdit={startEdit} />
                            ))}
                        </div>
                    </section>
                )}

                <section className="content">
                    {filteredSubscriptions.length > 0 ? (
                        <div className="subscriptions">
                            {filteredSubscriptions.map((sub) => (
                                <SubscriptionItem key={sub._id} subscription={sub} onDelete={deleteSubscription} onEdit={startEdit} />
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
        </section>
    );
};

export default Dashboard;
