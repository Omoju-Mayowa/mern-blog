import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("INTERCEPTOR CAUGHT ERROR:", error.response?.status);

    const isLoginRequest = error.config?.url?.includes('/users/login');
    const isMeRequest = error.config?.url?.includes('/users/me');

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      !isMeRequest
    ) {
      localStorage.removeItem("currentUser");
      window.location.href = '/login?error=expired';
    }

    return Promise.reject(error);
  }
);

export default API;