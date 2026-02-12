import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaArrowLeft, FaChartPie, FaChartLine, FaTrophy, FaChartBar } from 'react-icons/fa';
import FilterBar from '../components/FilterBar';

const Analytics = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    const [globalStatus, setGlobalStatus] = useState('All');
    const [globalCategory, setGlobalCategory] = useState('All');

    const [metrics, setMetrics] = useState(null);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [topSubscriptions, setTopSubscriptions] = useState([]);

    const [breakdownFilter, setBreakdownFilter] = useState('all_time');
    const [topSubFilter, setTopSubFilter] = useState('allTime');

    const categories = [
        'Entertainment', 'Music', 'OTT / Streaming', 'Gaming', 'Education',
        'Productivity', 'Cloud Services', 'Developer Tools', 'Design Tools',
        'Finance', 'Health & Fitness', 'Food & Delivery', 'News & Media',
        'Shopping', 'Utilities', 'Travel', 'Storage', 'Communication',
        'Security', 'AI Tools', 'Other'
    ];

    const resetFilters = () => {
        setGlobalStatus('All');
        setGlobalCategory('All');
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            const fetchAnalyticsData = async () => {
                try {
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    const token = storedUser ? storedUser.token : null;

                    if (token) {
                        const globalFilters = {
                            status: globalStatus,
                            category: globalCategory
                        };

                        const [summary, trend, breakdown, top] = await Promise.all([
                            analyticsService.getAnalyticsSummary(token, globalFilters),
                            analyticsService.getMonthlyExpenses(token, globalFilters),
                            analyticsService.getCategoryBreakdown(token, breakdownFilter, globalFilters),
                            analyticsService.getTopSubscriptions(token, 5, topSubFilter, globalFilters)
                        ]);

                        setMetrics(summary);
                        setMonthlyTrend(trend);
                        setCategoryData(breakdown);
                        setTopSubscriptions(top);
                    }
                } catch (error) {
                    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                    toast.error(message);
                } finally {
                    setIsLoading(false);
                }
            }
            fetchAnalyticsData();
        }
    }, [user, navigate, globalStatus, globalCategory, breakdownFilter, topSubFilter]);

    // Use theme-aware colors for charts
    // Use theme-aware colors for charts
    const COLORS = ['#AD7D56', '#CDB49E', '#AD7D56', '#CDB49E', '#AD7D56', '#CDB49E', '#AD7D56', '#CDB49E'];

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <section className="dashboard">
            <header className="header-responsive">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn"
                        style={{
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            background: 'var(--background)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', color: 'var(--primary)' }}>Analytics</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/category-comparison')} className="btn btn-secondary nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaChartBar /> Comparison
                    </button>
                    <button onClick={logout} className="btn nav-desktop">Logout</button>
                </div>
            </header>

            <FilterBar
                status={globalStatus}
                setStatus={setGlobalStatus}
                category={globalCategory}
                setCategory={setGlobalCategory}
                categories={categories}
                onReset={resetFilters}
                showAdvanced={false}
            />

            {/* Metrics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '25px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow)'
                }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>All Time Spent</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>₹{metrics?.allTimeTotal || 0}</p>
                </div>
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '25px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow)'
                }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Current Month</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>₹{metrics?.monthlyTotal || 0}</p>
                </div>
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '25px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow)'
                }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Active</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>{metrics?.activeCount || 0}</p>
                </div>
            </div>

            {/* Monthly Trend Chart */}
            <div style={{
                background: 'var(--card-bg)',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                marginBottom: '30px',
                boxShadow: 'var(--shadow)'
            }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', fontSize: '20px', color: 'var(--primary)' }}>
                    <FaChartLine /> Monthly Spending Trend
                </h2>
                {monthlyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickMargin={10} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--card-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Legend />
                            <Line type="smooth" dataKey="amount" stroke="var(--primary)" strokeWidth={3} name="Spending (₹)" dot={{ fill: 'var(--primary)', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>No trend data available</div>
                )}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 100%, 400px), 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* Category Pie Chart */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '30px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', margin: 0, color: 'var(--primary)' }}>
                            <FaChartPie /> Category Breakdown
                        </h2>
                        <select
                            value={breakdownFilter}
                            onChange={(e) => setBreakdownFilter(e.target.value)}
                            style={{
                                background: 'var(--background)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                padding: '6px 12px',
                                fontSize: '13px'
                            }}
                        >
                            <option value="all_time">All Time</option>
                            <option value="active_only">Active Only</option>
                            <option value="current_month">Current Month</option>
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
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>No category data available</div>
                    )}
                </div>

                {/* Top 5 Subscriptions */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '30px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', margin: 0, color: 'var(--primary)' }}>
                            <FaTrophy /> Top 5
                        </h2>
                        <div style={{ display: 'flex', background: 'var(--background)', borderRadius: '10px', padding: '3px', border: '1px solid var(--border-color)' }}>
                            {['allTime', 'activeOnly', 'expiredOnly'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setTopSubFilter(filter)}
                                    style={{
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '6px 12px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        background: topSubFilter === filter ? 'var(--primary)' : 'transparent',
                                        color: topSubFilter === filter ? '#fff' : 'var(--text-secondary)',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    {filter === 'allTime' ? 'All Time' : filter === 'activeOnly' ? 'Active' : 'Expired'}
                                </button>
                            ))}
                        </div>
                    </div>
                    {topSubscriptions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {topSubscriptions.map((sub, index) => (
                                <div key={sub._id} style={{
                                    background: 'var(--background)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    padding: '12px 15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: COLORS[index % COLORS.length],
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#fff'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '15px', margin: 0, color: 'var(--text-primary)' }}>{sub.name}</h3>
                                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>{sub.category}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>₹{sub.totalAmountSpent}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>No data available</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Analytics;
