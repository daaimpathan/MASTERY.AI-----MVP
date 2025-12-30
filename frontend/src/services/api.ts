import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Robust check for login endpoint to prevent refresh loops
        const requestUrl = originalRequest.url || '';
        if (requestUrl.toLowerCase().includes('login')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');

                // If no refresh token, fail immediately - DO NOT call refresh endpoint
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await axios.post('http://localhost:8000/api/v1/auth/refresh', { refresh_token: refreshToken });
                const { access_token } = response.data;
                localStorage.setItem('access_token', access_token);
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (err) {
                localStorage.clear();
                // Only redirect to login if we aren't already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

// Assignment endpoints
// Assignment endpoints
// Using intersection type to satisfy TS while keeping the axios instance behavior
const extendedApi = api as typeof api & {
    createAssignment: (data: any) => Promise<any>;
    getClasses: () => Promise<any>;
    syncAttendance: (data: any) => Promise<any>;
    generateAIQuiz: (data: { topic: string, count: number, difficulty: string }) => Promise<any>;
    chatWithTutor: (data: { message: string, history: any[] }) => Promise<any>;
    getDailyChallengeStatus: () => Promise<any>;
    submitDailyChallenge: (data: { score: number, game_type: string } | number) => Promise<any>;
};

extendedApi.createAssignment = (data: any) => api.post('/assignments/', data).then(res => res.data);
extendedApi.getClasses = () => api.get('/classes/').then(res => res.data);
extendedApi.syncAttendance = (data: any) => api.post('/attendance/sync', data).then(res => res.data);
extendedApi.generateAIQuiz = (data: any) => api.post('/quiz/generate-ai', data).then(res => res.data);
extendedApi.chatWithTutor = (data: any) => api.post('/chat/tutor', data).then(res => res.data);
extendedApi.getDailyChallengeStatus = () => api.get('/daily-challenge/status').then(res => res.data);
extendedApi.submitDailyChallenge = (data: any) => {
    // Handle both old (number) and new (object) format for backward compatibility
    const payload = typeof data === 'number' ? { score: data, game_type: 'neural_pattern' } : data;
    return api.post('/daily-challenge/complete', payload).then(res => res.data);
};

export default extendedApi;
