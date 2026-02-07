import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data);
        return data;
    };

    const login = async (userData) => {
        const data = await authService.login(userData);
        setUser(data);
        return data;
    };

    const googleLogin = async (credential) => {
        const data = await authService.googleLogin(credential);
        setUser(data);
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, register, login, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
