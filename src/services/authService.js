import http from './http';

const API_URL = '/api/auth/';

// Register user
const register = async (userData) => {
    const response = await http.post(API_URL + 'register', userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await http.post(API_URL + 'login', userData);

    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem('user');
};

// Google Login
const googleLogin = async (credential) => {
    const response = await http.post(API_URL + 'google', { credential });
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    googleLogin,
};

export default authService;
