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
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', color: 'var(--primary)' }}>Profile</h1>
                </div>
                <button onClick={logout} className="btn nav-desktop">Logout</button>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 100%, 400px), 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* User Information Card */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '30px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow)'
                }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', fontSize: '1.2rem', color: 'var(--primary)' }}>
                        <FaUser /> User Information
                    </h2>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            marginBottom: '10px'
                        }}>
                            Username
                        </label>
                        <div style={{
                            background: 'var(--background)',
                            padding: '12px 15px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            fontSize: '15px',
                            color: 'var(--text-primary)'
                        }}>
                            {user.username}
                        </div>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            marginBottom: '10px'
                        }}>
                            Email Address
                        </label>
                        <div style={{
                            background: 'var(--background)',
                            padding: '12px 15px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            fontSize: '15px',
                            color: 'var(--text-primary)'
                        }}>
                            {user.email}
                        </div>
                    </div>

                    <div style={{
                        marginTop: '30px',
                        padding: '15px',
                        background: 'var(--background)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                    }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
                            💡 Account details are managed via your provider.
                        </p>
                    </div>
                </div>

                {/* Settings Card */}
                <div style={{
                    background: 'var(--card-bg)',
                    padding: '30px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow)'
                }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', fontSize: '1.2rem', color: 'var(--primary)' }}>
                        <FaCog /> Preferences
                    </h2>

                    <div className="form-group" style={{ marginBottom: '25px' }}>
                        <label>Preferred Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            Default currency for new entries.
                        </p>
                    </div>

                    <div className="form-group" style={{ marginBottom: '25px' }}>
                        <label>Default Reminder</label>
                        <select
                            value={defaultReminderDays}
                            onChange={(e) => setDefaultReminderDays(Number(e.target.value))}
                        >
                            <option value={3}>3 days before</option>
                            <option value={7}>7 days before</option>
                            <option value={14}>14 days before</option>
                        </select>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            Auto-selected for new subscriptions.
                        </p>
                    </div>

                    <button
                        onClick={handleSaveSettings}
                        className="btn btn-block"
                        style={{
                            marginTop: '30px'
                        }}
                    >
                        <FaSave /> Save Changes
                    </button>
                </div>
            </div>

            {/* Additional Info Section */}
            <div style={{
                background: 'var(--card-bg)',
                padding: '25px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow)'
            }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1rem', color: 'var(--primary)' }}>Account Statistics</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px'
                }}>
                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                            Account Type
                        </p>
                        <p style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>
                            {user.googleId ? 'Google verified' : 'Email verified'}
                        </p>
                    </div>
                    <div style={{ background: 'var(--background)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                            Member Since
                        </p>
                        <p style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>
                            {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;
