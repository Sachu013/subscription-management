const axios = require('axios');
const API_URL_BASE = process.env.API_URL_BASE;
if (!API_URL_BASE) {
    console.error('Please set API_URL_BASE environment variable');
    process.exit(1);
}
const API_URL = `${API_URL_BASE}/api/auth/`;

const testLogin = async () => {
    try {
        // 1. Register a test user (in case not exists)
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        console.log(`Attempting to register: ${email}`);
        try {
            await axios.post(API_URL + 'register', {
                username: 'TestUser',
                email,
                password
            });
            console.log('Registration successful');
        } catch (err) {
            console.log('Registration failed (might already exist or other error):', err.response?.data?.message || err.message);
        }

        // 2. Login
        console.log('Attempting to login...');
        const loginRes = await axios.post(API_URL + 'login', {
            email,
            password
        });

        console.log('Login successful!');
        console.log('Token received:', !!loginRes.data.token);

    } catch (error) {
        console.error('Login Process Failed:', error.response?.data?.message || error.message);
    }
};

testLogin();
