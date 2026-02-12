import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import http from '../services/http';
import { FaEnvelope, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();

        // Basic email validation
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await http.post(`/api/auth/forgot-password`, { email });

            setMessage(response.data.message || 'Password reset instructions sent to your email');
            setEmail('');
        } catch (error) {
            console.error(error);
            const errorMsg = (error.response && error.response.data && error.response.data.message)
                || 'Failed to send reset email. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'var(--background)'
        }}>
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                padding: '50px 40px',
                width: '100%',
                maxWidth: '440px',
                boxShadow: 'var(--shadow)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        color: 'var(--primary)'
                    }}>
                        Reset Password
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: '1.5'
                    }}>
                        Enter your email and we'll send you recovery instructions.
                    </p>
                </div>

                {/* Success Message */}
                {message && (
                    <div style={{
                        background: 'rgba(76, 175, 80, 0.1)',
                        border: '1px solid #4CAF50',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '25px',
                        color: '#4CAF50',
                        fontSize: '14px',
                        textAlign: 'center',
                        fontWeight: '500'
                    }}>
                        {message}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: 'rgba(229, 115, 115, 0.1)',
                        border: '1px solid var(--danger)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '25px',
                        color: 'var(--danger)',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={onSubmit}>
                    {/* Email Field */}
                    <div className="form-group" style={{ marginBottom: '25px' }}>
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-secondary)',
                                opacity: 0.5,
                                fontSize: '16px'
                            }} />
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                    if (message) setMessage('');
                                }}
                                placeholder="name@example.com"
                                required
                                disabled={loading}
                                style={{
                                    paddingLeft: '45px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-block"
                        style={{
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={{
                                    width: '18px',
                                    height: '18px',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '2px solid #fff',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                                Sending...
                            </>
                        ) : (
                            <>
                                <FaPaperPlane />
                                Send Link
                            </>
                        )}
                    </button>
                </form>

                {/* Back to Login Link */}
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <Link
                        to="/login"
                        style={{
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaArrowLeft style={{ fontSize: '12px' }} />
                        Back to Login
                    </Link>
                </div>
            </div>

            {/* CSS for spinner animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
