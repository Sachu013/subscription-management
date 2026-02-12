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
                        Create Account
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: 'var(--text-secondary)',
                        margin: 0
                    }}>
                        Start managing your subscriptions today
                    </p>
                </div>

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

                {/* Register Form */}
                <form onSubmit={onSubmit}>
                    {/* Username Field */}
                    <div className="form-group">
                        <label>Username</label>
                        <div style={{ position: 'relative' }}>
                            <FaUser style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-secondary)',
                                opacity: 0.5,
                                fontSize: '16px'
                            }} />
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={onChange}
                                placeholder="Choose a username"
                                required
                                disabled={isLoading}
                                style={{
                                    paddingLeft: '45px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="form-group">
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
                                onChange={onChange}
                                placeholder="name@example.com"
                                required
                                disabled={isLoading}
                                style={{
                                    paddingLeft: '45px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-secondary)',
                                opacity: 0.5,
                                fontSize: '16px'
                            }} />
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Min. 8 characters"
                                required
                                disabled={isLoading}
                                style={{
                                    paddingLeft: '45px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-block"
                        style={{
                            padding: '16px',
                            marginTop: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-small" style={{
                                    width: '18px',
                                    height: '18px',
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
                                Sign Up
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
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                </div>

                {/* Google Login */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme={document.body.getAttribute('data-theme') === 'dark' ? 'filled_black' : 'outline'}
                    />
                </div>

                {/* Login Link */}
                <div style={{ marginTop: '35px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* CSS for spinner animation if not in global CSS */}
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
