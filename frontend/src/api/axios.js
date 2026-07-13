import axios from "axios";

const api = axios.create({
    baseURL: '/api/v1',  // use proxy instead of VITE_BASE_URL
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve();
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (original.url === "/auth/refresh") {  // matches your actual route
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(original))
                  .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                await api.post("/auth/refresh");  // matches your actual route
                processQueue(null);
                return api(original);
            } catch (refreshError) {
                processQueue(refreshError);
                try {
                    await api.post("/auth/logout");
                } finally {
                    localStorage.clear();
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;