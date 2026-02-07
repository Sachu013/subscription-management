import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL = process.env.REACT_APP_API_URL || '';

const http = axios.create({
  baseURL,
  withCredentials: false,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      (error?.response?.data && error.response.data.message) ||
      error.message ||
      'Request failed';

    if (status === 401) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('user');
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default http;
