import http from './http';

const API_URL = '/api/payments/';

const getPaymentsBySubscription = async (subscriptionId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await http.get(`${API_URL}subscription/${subscriptionId}`, config);
    return response.data;
};

const addPayment = async (paymentData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await http.post(API_URL, paymentData, config);
    return response.data;
};

const updatePayment = async (paymentId, paymentData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await http.put(`${API_URL}${paymentId}`, paymentData, config);
    return response.data;
};

const deletePayment = async (paymentId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await http.delete(`${API_URL}${paymentId}`, config);
    return response.data;
};

const exportPaymentsCSV = async (subscriptionId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        responseType: 'blob'
    };

    const response = await http.get(`${API_URL}subscription/${subscriptionId}/export`, config);
    return response.data;
};

const paymentService = {
    getPaymentsBySubscription,
    addPayment,
    updatePayment,
    deletePayment,
    exportPaymentsCSV
};

export default paymentService;
