import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

API.interceptors.response.use(
    (response) => response, 
    (error) => {
        console.log("INTERCEPTOR CAUGHT ERROR:", error.response?.status); // Add this!

        const isLoginRequest = error.config?.url?.includes('/users/login');

        if (error.response && error.response.status === 401 && !isLoginRequest) {
            console.log("401 detected. Redirecting...");
            localStorage.clear(); // Use clear to be safe
            window.location.href = '/login?error=expired';
        }
        return Promise.reject(error);
    }
);

export default API;
