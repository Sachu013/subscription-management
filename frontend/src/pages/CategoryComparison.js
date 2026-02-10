import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaArrowLeft, FaChartBar } from 'react-icons/fa';

const CategoryComparison = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [comparisonData, setComparisonData] = useState([]);
    const [categories, setCategories] = useState([]);


    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            // Fetch category breakdown to get available categories
            const fetchCategories = async () => {
                try {
                    const storedUser = JSON.parse(localStorage.getItem('user'));
                    const token = storedUser ? storedUser.token : null;

                    if (token) {
                        const categoryData = await analyticsService.getCategoryBreakdown(token);
                        const availableCategories = categoryData.map(cat => cat.name);
                        setCategories(availableCategories);

                        // Set first category as default
                        if (availableCategories.length > 0) {
                            setSelectedCategory(availableCategories[0]);
                        }
                    }
                } catch (error) {
                    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                    toast.error(message);
                }
            };
            fetchCategories();
        }
    }, [user, navigate]);

    useEffect(() => {
        if (selectedCategory) {
            fetchComparisonData();
        }
    }, [selectedCategory, fetchComparisonData]);

    const fetchComparisonData = useCallback(async () => {
        setIsLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser ? storedUser.token : null;

            if (token) {
                const data = await analyticsService.getCategoryComparison(token, selectedCategory);
                setComparisonData(data);
            }
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory]);

    const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

    return (
        <section className="dashboard">
            <header style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/analytics')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaArrowLeft /> Back to Analytics
                    </button>
                    <h1>Category Comparison</h1>
                </div>
                <button onClick={logout} className="btn">Logout</button>
            </header>

            {/* Category Selector */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '30px'
            }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
                    Select Category to Compare:
                </label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '12px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff'
                    }}
                >
                    {categories.length > 0 ? (
                        categories.map((cat, index) => (
                            <option key={index} value={cat} style={{ background: '#1a1a2e', color: '#fff' }}>
                                {cat}
                            </option>
                        ))
                    ) : (
                        <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>No categories available</option>
                    )}
                </select>
            </div>

            {/* Comparison Chart */}
            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    {comparisonData.length > 0 ? (
                        <>
                            {/* Bar Chart */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                padding: '25px',
                                borderRadius: '15px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                marginBottom: '30px'
                            }}>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '20px' }}>
                                    <FaChartBar /> {selectedCategory} - Monthly Cost Comparison
                                </h2>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={comparisonData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" angle={-45} textAnchor="end" height={120} />
                                        <YAxis stroke="rgba(255,255,255,0.7)" />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(0,0,0,0.8)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="monthlyCost" fill="#667eea" name="Monthly Cost (₹)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Comparison Table */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                padding: '25px',
                                borderRadius: '15px',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Detailed Comparison</h2>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.8)' }}>Rank</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.8)' }}>Subscription</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255,255,255,0.8)' }}>Billing Cycle</th>
                                                <th style={{ padding: '12px', textAlign: 'right', color: 'rgba(255,255,255,0.8)' }}>Actual Cost</th>
                                                <th style={{ padding: '12px', textAlign: 'right', color: 'rgba(255,255,255,0.8)' }}>Monthly Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonData.map((sub, index) => (
                                                <tr key={sub._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <td style={{ padding: '12px' }}>
                                                        <div style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '50%',
                                                            background: COLORS[index % COLORS.length],
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '14px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{sub.name}</td>
                                                    <td style={{ padding: '12px', color: 'rgba(255,255,255,0.7)' }}>{sub.billingCycle}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>₹{sub.cost}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#43e97b' }}>₹{sub.monthlyCost}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.8)',
                            padding: '60px 30px',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px'
                        }}>
                            <h3 style={{ marginBottom: '10px' }}>No subscriptions in this category</h3>
                            <p>Add subscriptions to the "{selectedCategory}" category to see comparisons.</p>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default CategoryComparison;
