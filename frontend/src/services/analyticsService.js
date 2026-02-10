import http from './http';

const API_URL = '/api/analytics/';

// Get analytics summary
const getAnalyticsSummary = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await http.get(API_URL + 'summary', config);
    return response.data;
};

// Get category breakdown
const getCategoryBreakdown = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await http.get(API_URL + 'category-breakdown', config);
    return response.data;
};

// Get monthly trend
const getMonthlyTrend = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await http.get(API_URL + 'monthly-trend', config);
    return response.data;
};

// Get top subscriptions
const getTopSubscriptions = async (token, limit = 5) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await http.get(API_URL + `top-subscriptions?limit=${limit}`, config);
    return response.data;
};

const analyticsService = {
    getAnalyticsSummary,
    getCategoryBreakdown,
    getMonthlyTrend,
    getTopSubscriptions
};

export default analyticsService;
