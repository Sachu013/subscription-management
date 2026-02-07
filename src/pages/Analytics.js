import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import subscriptionService from '../services/subscriptionService';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaArrowLeft, FaChartBar, FaChartPie } from 'react-icons/fa';

const Analytics = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    // Calculate metrics
    const calculateMetrics = () => {
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active');

        let monthlyTotal = 0;
        let yearlyTotal = 0;

        activeSubscriptions.forEach(sub => {
            if (sub.billingCycle === 'Monthly') {
                monthlyTotal += sub.cost;
                yearlyTotal += sub.cost * 12;
            } else if (sub.billingCycle === 'Yearly') {
                yearlyTotal += sub.cost;
                monthlyTotal += sub.cost / 12;
            } else if (sub.billingCycle === 'Weekly') {
                monthlyTotal += sub.cost * 4;
                yearlyTotal += sub.cost * 52;
            }
        });

        return {
            activeCount: activeSubscriptions.length,
            monthlyTotal: monthlyTotal.toFixed(2),
            yearlyTotal: yearlyTotal.toFixed(2)
        };
    };

    // Prepare category-wise data for pie chart
    const getCategoryData = () => {
        const categoryMap = {};

        subscriptions.filter(sub => sub.status === 'Active').forEach(sub => {
            const category = sub.category || 'Other';
            let monthlyCost = 0;

            if (sub.billingCycle === 'Monthly') {
                monthlyCost = sub.cost;
            } else if (sub.billingCycle === 'Yearly') {
                monthlyCost = sub.cost / 12;
            } else if (sub.billingCycle === 'Weekly') {
                monthlyCost = sub.cost * 4;
            }

            if (categoryMap[category]) {
                categoryMap[category] += monthlyCost;
            } else {
                categoryMap[category] = monthlyCost;
            }
        });

        return Object.keys(categoryMap).map(category => ({
            name: category,
            value: parseFloat(categoryMap[category].toFixed(2))
        }));
    };

    // Prepare monthly spending data for bar chart
    const getMonthlySpendingData = () => {
        return subscriptions.filter(sub => sub.status === 'Active').map(sub => {
            let monthlyCost = 0;
            if (sub.billingCycle === 'Monthly') {
                monthlyCost = sub.cost;
            } else if (sub.billingCycle === 'Yearly') {
                monthlyCost = sub.cost / 12;
            } else if (sub.billingCycle === 'Weekly') {
                monthlyCost = sub.cost * 4;
            }

            return {
                name: sub.name,
                amount: parseFloat(monthlyCost.toFixed(2))
            };
        }).sort((a, b) => b.amount - a.amount);
    };

    const metrics = calculateMetrics();
    const categoryData = getCategoryData();
    const monthlySpendingData = getMonthlySpendingData();

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
                <button onClick={logout} className="btn">Logout</button>
            </header>

            {/* Metrics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                    <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>Active Subscriptions</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{metrics.activeCount}</p>
                </div>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>Monthly Spending</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#43e97b' }}>₹{metrics.monthlyTotal}</p>
                </div>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>Yearly Spending</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#fa709a' }}>₹{metrics.yearlyTotal}</p>
                </div>
            </div>

            {/* Charts */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* Bar Chart */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '20px' }}>
                        <FaChartBar /> Monthly Spending by Subscription
                    </h2>
                    {monthlySpendingData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlySpendingData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" angle={-45} textAnchor="end" height={100} />
                                <YAxis stroke="rgba(255,255,255,0.7)" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(0,0,0,0.8)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="amount" fill="#667eea" name="Monthly Cost (₹)" />
                            </BarChart>
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
                            <p>Add or activate subscriptions to view monthly spending analytics.</p>
                        </div>
                    )}
                </div>

                {/* Pie Chart */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '20px' }}>
                        <FaChartPie /> Category-wise Spending
                    </h2>
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
                            <p>Add or activate subscriptions to view category-wise analytics.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Analytics;
