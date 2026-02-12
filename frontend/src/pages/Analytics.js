import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaArrowLeft, FaChartPie, FaChartLine, FaTrophy, FaChartBar } from 'react-icons/fa';

const Analytics = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    // Analytics data from backend
    const [metrics, setMetrics] = useState(null);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [topSubscriptions, setTopSubscriptions] = useState([]);

    // Filter states
    const [categoryFilter, setCategoryFilter] = useState('all_time');
    const [topSubFilter, setTopSubFilter] = useState('allTime');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            const fetchAnalytics = async () => {
                try {
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    const token = storedUser ? storedUser.token : null;

                    if (token) {
                        // Fetch metrics and trend once (not affected by current filters)
                        const [summary, trend] = await Promise.all([
                            analyticsService.getAnalyticsSummary(token),
                            analyticsService.getMonthlyTrend(token)
                        ]);
                        setMetrics(summary);
                        setMonthlyTrend(trend);
                    }
                } catch (error) {
                    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                    toast.error(message);
                } finally {
                    setIsLoading(false);
                }
            }
            fetchAnalytics();
        }
    }, [user, navigate]);

    // Refetch Category Breakdown when filter changes
    useEffect(() => {
        const fetchCategoryData = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser?.token;
            if (token) {
                const data = await analyticsService.getCategoryBreakdown(token, categoryFilter);
                setCategoryData(data);
            }
        };
        fetchCategoryData();
    }, [categoryFilter]);

    // Refetch Top Subscriptions when filter changes
    useEffect(() => {
        const fetchTopSubs = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser?.token;
            if (token) {
                const data = await analyticsService.getTopSubscriptions(token, 5, topSubFilter);
                setTopSubscriptions(data);
            }
        };
        fetchTopSubs();
    }, [topSubFilter]);

    const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <section className="dashboard">
            <header style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaArrowLeft /> Back
                    </button>
                    <h1>Analytics Dashboard</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/category-comparison')} className="btn" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <FaChartBar style={{ marginRight: '5px' }} /> Category Comparison
                    </button>
                    <button onClick={logout} className="btn">Logout</button>
                </div>
            </header>

            {/* Metrics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>All Time Spent</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>₹{metrics?.allTimeTotal || 0}</p>
                </div>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>Current Month Spending</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#43e97b' }}>₹{metrics?.monthlyTotal || 0}</p>
                </div>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>Active Subscriptions</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#fa709a' }}>{metrics?.activeCount || 0}</p>
                </div>
            </div>

            {/* Monthly Trend Line Chart - NEW */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '30px'
            }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '20px' }}>
                    <FaChartLine /> Monthly Spending Trend (Last 12 Months)
                </h2>
                {monthlyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" angle={-45} textAnchor="end" height={80} />
                            <YAxis stroke="rgba(255,255,255,0.7)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(0,0,0,0.8)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="amount" stroke="#43e97b" strokeWidth={3} name="Monthly Spending (₹)" dot={{ fill: '#43e97b', r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.8)',
                        padding: '30px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px'
                    }}>
                        <h3 style={{ marginBottom: '8px' }}>Insufficient data</h3>
                        <p>Add subscriptions to view monthly spending trends.</p>
                    </div>
                )}
            </div>

            {/* Charts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* Category Pie Chart */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', margin: 0 }}>
                            <FaChartPie /> Category-wise Spending
                        </h2>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: '#fff',
                                padding: '5px 10px',
                                outline: 'none'
                            }}
                        >
                            <option value="all_time" style={{ background: '#333' }}>All Time</option>
                            <option value="active_only" style={{ background: '#333' }}>Current Active Only</option>
                            <option value="current_month" style={{ background: '#333' }}>Current Month Only</option>
                        </select>
                    </div>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(0,0,0,0.8)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.8)',
                            padding: '30px',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px'
                        }}>
                            <h3 style={{ marginBottom: '8px' }}>Insufficient data</h3>
                            <p>Add subscriptions to view category-wise analytics.</p>
                        </div>
                    )}
                </div>

                {/* Top 5 Subscriptions - NEW */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', margin: 0 }}>
                            <FaTrophy /> Top 5 Subscriptions
                        </h2>
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2px' }}>
                            <button
                                onClick={() => setTopSubFilter('allTime')}
                                style={{
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    background: topSubFilter === 'allTime' ? '#667eea' : 'transparent',
                                    color: '#fff',
                                    marginRight: '2px'
                                }}
                            >
                                All Time
                            </button>
                            <button
                                onClick={() => setTopSubFilter('activeOnly')}
                                style={{
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    background: topSubFilter === 'activeOnly' ? '#667eea' : 'transparent',
                                    color: '#fff',
                                    marginRight: '2px'
                                }}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setTopSubFilter('expiredOnly')}
                                style={{
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    background: topSubFilter === 'expiredOnly' ? '#667eea' : 'transparent',
                                    color: '#fff'
                                }}
                            >
                                Expired
                            </button>
                        </div>
                    </div>
                    {topSubscriptions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {topSubscriptions.map((sub, index) => (
                                <div key={sub._id} style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '10px',
                                    padding: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: COLORS[index % COLORS.length],
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#fff'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '16px', marginBottom: '5px', color: '#fff' }}>{sub.name}</h3>
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{sub.category}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#43e97b', margin: 0 }}>₹{sub.totalAmountSpent}</p>
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Total Spent</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.8)',
                            padding: '30px',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px'
                        }}>
                            <h3 style={{ marginBottom: '8px' }}>Insufficient data</h3>
                            <p>Add subscriptions to view top subscriptions.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Analytics;
