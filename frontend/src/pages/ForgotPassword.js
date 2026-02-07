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
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '50px 40px',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Forgot Password?
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: 0,
                        lineHeight: '1.5'
                    }}>
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>
                </div>

                {/* Success Message */}
                {message && (
                    <div style={{
                        background: 'rgba(76, 175, 80, 0.1)',
                        border: '1px solid rgba(76, 175, 80, 0.5)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '25px',
                        color: '#4CAF50',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid rgba(244, 67, 54, 0.5)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '25px',
                        color: '#f44336',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={onSubmit}>
                    {/* Email Field */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '8px'
                        }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(255, 255, 255, 0.5)',
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
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 45px',
                                    fontSize: '16px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#fff',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.border = '1px solid rgba(102, 126, 234, 0.6)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            borderRadius: '10px',
                            border: 'none',
                            background: loading
                                ? 'rgba(102, 126, 234, 0.5)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px 0 rgba(102, 126, 234, 0.6)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px 0 rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={{
                                    width: '16px',
                                    height: '16px',
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
                                Send Reset Link
                            </>
                        )}
                    </button>
                </form>

                {/* Back to Login Link */}
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <Link
                        to="/login"
                        style={{
                            color: '#667eea',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                        onMouseLeave={(e) => e.target.style.color = '#667eea'}
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
