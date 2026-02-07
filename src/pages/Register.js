import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const { username, email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
        if (error) setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await register(formData);
            navigate('/');
        } catch (error) {
            console.error(error);
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            setError(message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError('');

        try {
            await googleLogin(credentialResponse.credential);
            navigate('/');
        } catch (error) {
            console.error(error);
            setError('Google sign up failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google sign up failed. Please try again.');
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
                        Create Account
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: 0
                    }}>
                        Sign up to start managing subscriptions
                    </p>
                </div>

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

                {/* Register Form */}
                <form onSubmit={onSubmit}>
                    {/* Username Field */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '8px'
                        }}>
                            Username
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FaUser style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '16px'
                            }} />
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={onChange}
                                placeholder="Enter your username"
                                required
                                disabled={isLoading}
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

                    {/* Email Field */}
                    <div style={{ marginBottom: '20px' }}>
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
                                onChange={onChange}
                                placeholder="Enter your email"
                                required
                                disabled={isLoading}
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

                    {/* Password Field */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '8px'
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '16px'
                            }} />
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Create a password"
                                required
                                disabled={isLoading}
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

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '16px',
                            fontWeight: '600',
                            borderRadius: '10px',
                            border: 'none',
                            background: isLoading
                                ? 'rgba(102, 126, 234, 0.5)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px 0 rgba(102, 126, 234, 0.6)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px 0 rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '2px solid #fff',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                                Creating account...
                            </>
                        ) : (
                            <>
                                <FaUserPlus />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '30px 0',
                    gap: '15px'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
                </div>

                {/* Google Login */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                </div>

                {/* Login Link */}
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: 0 }}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontWeight: '600',
                                transition: 'color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                            onMouseLeave={(e) => e.target.style.color = '#667eea'}
                        >
                            Sign in
                        </Link>
                    </p>
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

export default Register;
