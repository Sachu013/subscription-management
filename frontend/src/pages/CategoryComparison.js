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

    useEffect(() => {
        if (selectedCategory) {
            fetchComparisonData();
        }
    }, [selectedCategory, fetchComparisonData]);

    const COLORS = ['#789A99', '#FFD2C2', '#9eb5b4', '#f7c0af', '#b8c9c8', '#ffe1d6', '#cbd7d6', '#fff1ec'];

    return (
        <section className="dashboard">
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '20px',
                marginBottom: '30px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => navigate('/analytics')}
                        className="btn"
                        style={{
                            borderRadius: '50%',
                            padding: '10px',
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
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>Category Comparison</h1>
                </div>
                <button onClick={logout} className="btn">Logout</button>
            </header>

            {/* Category Selector */}
            <div style={{
                background: 'var(--card-bg)',
                padding: '25px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                marginBottom: '30px',
                boxShadow: 'var(--shadow)'
            }}>
                <label style={{ display: 'block', marginBottom: '15px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Select Category:
                </label>
                <div className="form-group" style={{ maxWidth: '400px', marginBottom: 0 }}>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.length > 0 ? (
                            categories.map((cat, index) => (
                                <option key={index} value={cat}>
                                    {cat}
                                </option>
                            ))
                        ) : (
                            <option value="">No categories available</option>
                        )}
                    </select>
                </div>
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
                                background: 'var(--card-bg)',
                                padding: '30px',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                marginBottom: '30px',
                                boxShadow: 'var(--shadow)'
                            }}>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', fontSize: '20px', color: 'var(--primary)' }}>
                                    <FaChartBar /> {selectedCategory} Comparison
                                </h2>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={comparisonData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickMargin={10} />
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
                                        <Bar dataKey="monthlyCost" fill="var(--primary)" name="Monthly Equivalent (₹)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Comparison Table */}
                            <div style={{
                                background: 'var(--card-bg)',
                                padding: '25px',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow)'
                            }}>
                                <h2 style={{ marginBottom: '25px', fontSize: '1.1rem', color: 'var(--primary)' }}>Breakdown</h2>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--secondary)', color: '#2c2c2c' }}>
                                                <th style={{ padding: '15px' }}>Rank</th>
                                                <th style={{ padding: '15px' }}>Subscription</th>
                                                <th style={{ padding: '15px' }}>Billing Cycle</th>
                                                <th style={{ padding: '15px', textAlign: 'right' }}>Price</th>
                                                <th style={{ padding: '15px', textAlign: 'right' }}>Monthly</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonData.map((sub, index) => (
                                                <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '15px' }}>
                                                        <div style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '50%',
                                                            background: COLORS[index % COLORS.length],
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '13px',
                                                            fontWeight: 'bold',
                                                            color: '#fff'
                                                        }}>
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{sub.name}</td>
                                                    <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>{sub.billingCycle}</td>
                                                    <td style={{ padding: '15px', textAlign: 'right', color: 'var(--text-secondary)' }}>₹{sub.price}</td>
                                                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>₹{sub.monthlyCost}</td>
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
                            padding: '60px 30px',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            color: 'var(--text-secondary)'
                        }}>
                            <h3 style={{ marginBottom: '10px' }}>No entries found</h3>
                            <p>Add subscriptions to the "{selectedCategory}" category to see comparisons.</p>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default CategoryComparison;
