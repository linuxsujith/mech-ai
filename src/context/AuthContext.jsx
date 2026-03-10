import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(null);
const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : 'http://localhost:8000/api';


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    useEffect(() => {
        const token = localStorage.getItem('mechai_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const storedUser = localStorage.getItem('mechai_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects 'username'
            formData.append('password', password);

            const res = await axios.post(`${API}/auth/login`, formData);
            const { access_token, user: userData } = res.data;

            localStorage.setItem('mechai_token', access_token);
            localStorage.setItem('mechai_user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            setUser(userData);
            toast.success('System access granted');
            return true;
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Authentication failed');
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await axios.post(`${API}/auth/register`, {
                name,
                email,
                password
            });
            const { access_token, user: userData } = res.data;

            localStorage.setItem('mechai_token', access_token);
            localStorage.setItem('mechai_user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            setUser(userData);
            toast.success('Registration complete. Welcome to MECHAI.');
            return true;
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('mechai_token');
        localStorage.removeItem('mechai_user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        toast.info('Disconnected from system');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
