import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import subscriptionService from '../services/subscriptionService';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaFileDownload, FaCalendar } from 'react-icons/fa';
import FilterBar from '../components/FilterBar';

const Reports = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [status, setStatus] = useState('All');
    const [category, setCategory] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const categories = [
        'Entertainment', 'Music', 'OTT / Streaming', 'Gaming', 'Education',
        'Productivity', 'Cloud Services', 'Developer Tools', 'Design Tools',
        'Finance', 'Health & Fitness', 'Food & Delivery', 'News & Media',
        'Shopping', 'Utilities', 'Travel', 'Storage', 'Communication',
        'Security', 'AI Tools', 'Other'
    ];

    const resetFilters = () => {
        setStatus('All');
        setCategory('All');
        setStartDate('');
        setEndDate('');
    };

    const fetchSubscriptions = useCallback(async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser ? storedUser.token : null;

            if (token) {
                const params = {
                    status: status,
                    category: category,
                    minDate: startDate,
                    maxDate: endDate
                };
                const subs = await subscriptionService.getSubscriptions(token, params);
                setSubscriptions(subs);
            }
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [status, category, startDate, endDate]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchSubscriptions();
        }
    }, [user, navigate, fetchSubscriptions]);

    const handleGenerateReport = () => {
        fetchSubscriptions();
        toast.success('Report updated!');
    };

    const handleExportCSV = () => {
        if (subscriptions.length === 0) {
            toast.warning('No data to export');
            return;
        }

        // Create CSV content
        const headers = ['Name', 'Category', 'Price', 'Total Spent', 'Billing Cycle', 'Start Date', 'Status'];
        const csvRows = [headers.join(',')];

        subscriptions.forEach(sub => {
            const row = [
                `"${sub.name}"`,
                `"${sub.category || 'N/A'}"`,
                sub.price,
                sub.totalSpent || 0,
                sub.billingCycle,
                new Date(sub.startDate).toLocaleDateString(),
                sub.status,
                new Date(sub.createdAt || sub.startDate).toLocaleDateString()
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `subscription-report-${new Date().toISOString().split('T')[0]}.csv`;

        // CRITICAL: Append to body before clicking
        document.body.appendChild(link);
        link.click();

        // Clean up: Remove from DOM then revoke URL
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Report exported successfully!');
    };

    if (isLoading) {
        return <Spinner />;
    }

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
                        onClick={() => navigate('/')}
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
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>Subscription Report</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={logout} className="btn">Logout</button>
                </div>
            </header>

            <FilterBar
                status={status}
                setStatus={setStatus}
                category={category}
                setCategory={setCategory}
                categories={categories}
                onReset={resetFilters}
                showAdvanced={false}
            />

            <div style={{
                background: 'var(--card-bg)',
                padding: '25px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                marginBottom: '30px',
                boxShadow: 'var(--shadow)'
            }}>
                <h2 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                    <FaCalendar /> Date Range filter
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                        <label>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleGenerateReport} className="btn" style={{ height: '42px', padding: '0 25px' }}>
                            Update
                        </button>
                        <button onClick={handleExportCSV} className="btn btn-secondary" style={{
                            height: '42px',
                            padding: '0 25px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                            disabled={subscriptions.length === 0}
                        >
                            <FaFileDownload /> Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div style={{
                background: 'var(--card-bg)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                marginBottom: '30px',
                display: 'flex',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '20px',
                boxShadow: 'var(--shadow)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Total</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>{subscriptions.length}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Active</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
                        {subscriptions.filter(s => s.status === 'Active').length}
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Expired</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--danger)', margin: 0 }}>
                        {subscriptions.filter(s => s.status === 'Expired').length}
                    </p>
                </div>
            </div>

            <div className="report-content">
                {subscriptions.length > 0 ? (
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow)'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--secondary)', color: '#2c2c2c' }}>
                                    <th style={{ padding: '15px' }}>Name</th>
                                    <th style={{ padding: '15px' }}>Category</th>
                                    <th style={{ padding: '15px' }}>Price</th>
                                    <th style={{ padding: '15px' }}>Status</th>
                                    <th style={{ padding: '15px' }}>Total Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map(sub => (
                                    <tr key={sub._id}>
                                        <td data-label="Name" style={{ padding: '15px' }}>{sub.name}</td>
                                        <td data-label="Category" style={{ padding: '15px' }}>{sub.category}</td>
                                        <td data-label="Price" style={{ padding: '15px' }}>₹{sub.price}</td>
                                        <td data-label="Status" style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                background: 'var(--background)',
                                                border: '1px solid var(--border-color)',
                                                color: sub.status === 'Active' ? 'var(--primary)' : 'var(--danger)'
                                            }}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td data-label="Total Spent" style={{ padding: '15px', fontWeight: 'bold' }}>₹{sub.totalSpent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>No records found.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Reports;
