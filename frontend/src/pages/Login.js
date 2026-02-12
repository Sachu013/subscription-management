import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(formData);
            navigate('/');
        } catch (error) {
            console.error(error);
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            setError(message || 'Login failed. Please check your credentials.');
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
            setError('Google login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.');
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
                        Welcome Back
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: 'var(--text-secondary)',
                        margin: 0
                    }}>
                        Sign in to your subscription dashboard
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

                {/* Login Form */}
                <form onSubmit={onSubmit}>
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
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                                style={{
                                    paddingLeft: '45px'
                                }}
                            />
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="togglePassword"
                                checked={showPassword}
                                onChange={() => setShowPassword((prev) => !prev)}
                                disabled={isLoading}
                                style={{ width: 'auto', marginBottom: 0 }}
                            />
                            <label htmlFor="togglePassword" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 0, cursor: 'pointer' }}>
                                Show password
                            </label>
                        </div>
                    </div>

                    {/* Login Button */}
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
                                Signing in...
                            </>
                        ) : (
                            <>
                                <FaSignInAlt />
                                Sign In
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

                {/* Register Link */}
                <div style={{ marginTop: '35px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            style={{
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            Sign up
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

export default Login;
