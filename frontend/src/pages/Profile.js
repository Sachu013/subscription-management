import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUser, FaCog, FaSave } from 'react-icons/fa';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    // Settings state
    const [currency, setCurrency] = useState('INR');
    const [defaultReminderDays, setDefaultReminderDays] = useState(7);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            // Load settings from localStorage
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                setCurrency(settings.currency || 'INR');
                setDefaultReminderDays(settings.defaultReminderDays || 7);
            }
        }
    }, [user, navigate]);

    const handleSaveSettings = () => {
        const settings = {
            currency,
            defaultReminderDays
        };
        localStorage.setItem('userSettings', JSON.stringify(settings));
        toast.success('Settings saved successfully!');
    };

    if (!user) {
        return null;
    }

    return (
        <section className="dashboard">
            <header style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaArrowLeft /> Back
                    </button>
                    <h1>Profile & Settings</h1>
                </div>
                <button onClick={logout} className="btn">Logout</button>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* User Information Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '30px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', fontSize: '22px' }}>
                        <FaUser /> User Information
                    </h2>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '8px'
                        }}>
                            Name
                        </label>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '12px 15px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '16px'
                        }}>
                            {user.username}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '8px'
                        }}>
                            Email
                        </label>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '12px 15px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '16px'
                        }}>
                            {user.email}
                        </div>
                    </div>

                    <div style={{
                        marginTop: '25px',
                        padding: '15px',
                        background: 'rgba(102, 126, 234, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(102, 126, 234, 0.3)'
                    }}>
                        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                            💡 To update your name or email, please contact support.
                        </p>
                    </div>
                </div>

                {/* Settings Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '30px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', fontSize: '22px' }}>
                        <FaCog /> Preferences
                    </h2>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '8px'
                        }}>
                            Preferred Currency
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="INR" style={{ background: '#2a2a2a' }}>INR (₹)</option>
                            <option value="USD" style={{ background: '#2a2a2a' }}>USD ($)</option>
                            <option value="EUR" style={{ background: '#2a2a2a' }}>EUR (€)</option>
                            <option value="GBP" style={{ background: '#2a2a2a' }}>GBP (£)</option>
                        </select>
                        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
                            This will be used as the default currency for new subscriptions
                        </p>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '8px'
                        }}>
                            Default Reminder Time
                        </label>
                        <select
                            value={defaultReminderDays}
                            onChange={(e) => setDefaultReminderDays(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            <option value={3} style={{ background: '#2a2a2a' }}>3 days before renewal</option>
                            <option value={7} style={{ background: '#2a2a2a' }}>7 days before renewal</option>
                            <option value={14} style={{ background: '#2a2a2a' }}>14 days before renewal</option>
                        </select>
                        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
                            This will be pre-selected when creating new subscriptions
                        </p>
                    </div>

                    <button
                        onClick={handleSaveSettings}
                        className="btn btn-block"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '30px'
                        }}
                    >
                        <FaSave /> Save Settings
                    </button>
                </div>
            </div>

            {/* Additional Info Section */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '25px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>About Your Account</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                }}>
                    <div>
                        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '5px' }}>
                            Account Type
                        </p>
                        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            {user.googleId ? 'Google Account' : 'Email Account'}
                        </p>
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '5px' }}>
                            Member Since
                        </p>
                        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;
