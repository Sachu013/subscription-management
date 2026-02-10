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
const getCategoryBreakdown = async (token, filter = 'current') => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await http.get(API_URL + `category-breakdown?filter=${filter}`, config);
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
const getTopSubscriptions = async (token, limit = 5, filter = 'current') => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await http.get(API_URL + `top-subscriptions?limit=${limit}&filter=${filter}`, config);
    return response.data;
};

// Get category comparison
const getCategoryComparison = async (token, category) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await http.get(API_URL + `category-comparison/${encodeURIComponent(category)}`, config);
    return response.data;
};

const analyticsService = {
    getAnalyticsSummary,
    getCategoryBreakdown,
    getMonthlyTrend,
    getTopSubscriptions,
    getCategoryComparison
};

export default analyticsService;
