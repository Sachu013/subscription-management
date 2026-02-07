import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import subscriptionService from '../services/subscriptionService';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaFileDownload, FaCalendar } from 'react-icons/fa';

const Reports = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [subscriptions, setSubscriptions] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Date filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchSubscriptions();
        }
    }, [user, navigate]);

    const fetchSubscriptions = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser ? storedUser.token : null;

            if (token) {
                const subs = await subscriptionService.getSubscriptions(token);
                setSubscriptions(subs);
                // Initially show all expired/cancelled
                filterSubscriptions(subs, '', '');
            }
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const filterSubscriptions = (subs, start, end) => {
        // Filter for expired or cancelled subscriptions
        let filtered = subs.filter(sub =>
            sub.status === 'Expired' || sub.status === 'Cancelled'
        );

        // Apply date range filter if provided
        if (start && end) {
            const startDateTime = new Date(start).getTime();
            const endDateTime = new Date(end).getTime();

            filtered = filtered.filter(sub => {
                const subDate = new Date(sub.createdAt || sub.startDate).getTime();
                return subDate >= startDateTime && subDate <= endDateTime;
            });
        }

        setFilteredReports(filtered);
    };

    const handleGenerateReport = () => {
        if (startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) {
                toast.error('Start date must be before end date');
                return;
            }
        }
        filterSubscriptions(subscriptions, startDate, endDate);
        toast.success('Report generated successfully!');
    };

    const handleExportCSV = () => {
        if (filteredReports.length === 0) {
            toast.warning('No data to export');
            return;
        }

        // Create CSV content
        const headers = ['Name', 'Category', 'Cost', 'Billing Cycle', 'Start Date', 'Status', 'Created At'];
        const csvRows = [headers.join(',')];

        filteredReports.forEach(sub => {
            const row = [
                `"${sub.name}"`,
                `"${sub.category || 'N/A'}"`,
                sub.cost,
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
                <button onClick={logout} className="btn">Logout</button>
            </header>

            {/* Date Range Filter */}
            <div className="controls" style={{ marginBottom: '30px' }}>
                <div className="control-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                        <FaCalendar style={{ marginRight: '5px' }} />
                        From Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="control-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                        <FaCalendar style={{ marginRight: '5px' }} />
                        To Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <button
                    className="btn"
                    onClick={handleGenerateReport}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', alignSelf: 'flex-end' }}
                >
                    Generate Report
                </button>
                <button
                    className="btn"
                    onClick={handleExportCSV}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#43e97b', alignSelf: 'flex-end' }}
                    disabled={filteredReports.length === 0}
                >
                    <FaFileDownload /> Export CSV
                </button>
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
                    <h3 style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '5px' }}>Total Records</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{filteredReports.length}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '5px' }}>Expired</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
                        {filteredReports.filter(s => s.status === 'Expired').length}
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '5px' }}>Cancelled</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f44336' }}>
                        {filteredReports.filter(s => s.status === 'Cancelled').length}
                    </p>
                </div>
            </div>

            {/* Reports Table */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflowX: 'auto'
            }}>
                <h2 style={{ marginBottom: '20px' }}>Expired & Cancelled Subscriptions</h2>
                {filteredReports.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>Cost</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Billing Cycle</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Start Date</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((sub, index) => (
                                <tr
                                    key={sub._id}
                                    style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                        backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                                    }}
                                >
                                    <td style={{ padding: '12px' }}>{sub.name}</td>
                                    <td style={{ padding: '12px' }}>{sub.category || 'N/A'}</td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>₹{sub.cost}</td>
                                    <td style={{ padding: '12px' }}>{sub.billingCycle}</td>
                                    <td style={{ padding: '12px' }}>{new Date(sub.startDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            backgroundColor: sub.status === 'Expired' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                            color: sub.status === 'Expired' ? '#ff9800' : '#f44336'
                                        }}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>{new Date(sub.createdAt || sub.startDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: '40px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px'
                    }}>
                        <h3 style={{ marginBottom: '10px' }}>No report data</h3>
                        <p>
                            No expired or cancelled subscriptions found.
                            {startDate && endDate && ' Try adjusting the date range.'}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Reports;
