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
            <header style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaArrowLeft /> Back
                    </button>
                    <h1>Subscription Reports</h1>
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
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '30px'
            }}>
                <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCalendar /> Date Range (Subscription Start)
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleGenerateReport} className="btn" style={{ height: '42px', padding: '0 25px' }}>
                            Update Report
                        </button>
                        <button onClick={handleExportCSV} className="btn" style={{
                            height: '42px',
                            padding: '0 25px',
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: '#000',
                            fontWeight: 'bold'
                        }}
                            disabled={subscriptions.length === 0}
                        >
                            <FaFileDownload style={{ marginRight: '8px' }} /> Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '30px',
                display: 'flex',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '5px' }}>Involved Subscriptions</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{subscriptions.length}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '5px' }}>Active</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#43e97b' }}>
                        {subscriptions.filter(s => s.status === 'Active').length}
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '5px' }}>Expired</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
                        {subscriptions.filter(s => s.status === 'Expired').length}
                    </p>
                </div>
            </div>

            <div className="report-content">
                {subscriptions.length > 0 ? (
                    <div className="table-responsive" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                                    <th style={{ padding: '15px' }}>Name</th>
                                    <th style={{ padding: '15px' }}>Category</th>
                                    <th style={{ padding: '15px' }}>Price</th>
                                    <th style={{ padding: '15px' }}>Status</th>
                                    <th style={{ padding: '15px' }}>Total Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map(sub => (
                                    <tr key={sub._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <td style={{ padding: '15px' }}>{sub.name}</td>
                                        <td style={{ padding: '15px' }}>{sub.category}</td>
                                        <td style={{ padding: '15px' }}>₹{sub.price}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                background: sub.status === 'Active' ? 'rgba(67, 233, 123, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                                                color: sub.status === 'Active' ? '#43e97b' : '#ff6b6b'
                                            }}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px' }}>₹{sub.totalSpent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '15px' }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No data found for the current filters.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Reports;
