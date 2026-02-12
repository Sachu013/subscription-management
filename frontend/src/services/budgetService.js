import http from './http';

const API_URL = '/api/budget/';

const getBudget = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await http.get(API_URL, config);
    return response.data;
};

const updateBudget = async (budgetData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await http.put(API_URL, budgetData, config);
    return response.data;
};

const budgetService = {
    getBudget,
    updateBudget
};

export default budgetService;
