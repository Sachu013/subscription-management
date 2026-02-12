import http from './http';

const API_URL = '/api/subscriptions/';

// Create new subscription
const createSubscription = async (subscriptionData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await http.post(API_URL, subscriptionData, config);
    return response.data;
};

// Get user subscriptions with optional filters
const getSubscriptions = async (token, params = {}) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: params
    };

    const response = await http.get(API_URL, config);
    return response.data;
};

// Delete subscription
const deleteSubscription = async (subscriptionId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await http.delete(API_URL + subscriptionId, config);
    return response.data;
};

// Update subscription
const updateSubscription = async (subscriptionId, subscriptionData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await http.put(API_URL + subscriptionId, subscriptionData, config);
    return response.data;
};

// Pay for a subscription (add payment)
const paySubscription = async (subscriptionId, token, paymentData = {}) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await http.post(`${API_URL}${subscriptionId}/pay`, paymentData, config);
    return response.data;
};

const subscriptionService = {
    createSubscription,
    getSubscriptions,
    deleteSubscription,
    updateSubscription,
    paySubscription
};

export default subscriptionService;
