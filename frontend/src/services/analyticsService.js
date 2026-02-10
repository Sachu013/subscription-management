import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/analytics';

// Get analytics summary
const getAnalyticsSummary = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/summary`, config);
    return response.data;
};

// Get category breakdown
const getCategoryBreakdown = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/category-breakdown`, config);
    return response.data;
};

// Get monthly trend
const getMonthlyTrend = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/monthly-trend`, config);
    return response.data;
};

// Get top subscriptions
const getTopSubscriptions = async (token, limit = 5) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/top-subscriptions?limit=${limit}`, config);
    return response.data;
};

const analyticsService = {
    getAnalyticsSummary,
    getCategoryBreakdown,
    getMonthlyTrend,
    getTopSubscriptions
};

export default analyticsService;
