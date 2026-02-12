import http from './http';

const API_URL = '/api/analytics/';

// Get analytics summary
const getAnalyticsSummary = async (token, globalFilters = {}) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: globalFilters
    };
    const response = await http.get(API_URL + 'summary', config);
    return response.data;
};

// Get category breakdown
const getCategoryBreakdown = async (token, filter = 'all_time', globalFilters = {}) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: { ...globalFilters, filter }
    };
    const response = await http.get(API_URL + 'category-breakdown', config);
    return response.data;
};

// Get monthly expenses
const getMonthlyExpenses = async (token, globalFilters = {}) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: globalFilters
    };
    const response = await http.get(API_URL + 'monthly-expenses', config);
    return response.data;
};

// Get top subscriptions
const getTopSubscriptions = async (token, limit = 5, filter = 'allTime', globalFilters = {}) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: { ...globalFilters, limit, filter }
    };
    const response = await http.get(API_URL + 'top-subscriptions', config);
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
    getMonthlyExpenses,
    getTopSubscriptions,
    getCategoryComparison
};

export default analyticsService;
