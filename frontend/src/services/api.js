import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('[API Request Setup Error]', error);
  return Promise.reject(error);
});

// Response Interceptor for Console Debugging
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.group('🚨 [API RESPONSE ERROR INTERCEPTOR]');
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method?.toUpperCase());
    console.error('Status:', error.response?.status);
    console.error('Error Detail:', error.response?.data?.detail || error.message);
    console.error('Full Error Object:', error);
    console.groupEnd();
    return Promise.reject(error);
  }
);

export const api = {
  getProviderStatus: async () => {
    const res = await client.get('/providers/status');
    return res.data;
  },

  sendMessage: async (payload) => {
    const res = await client.post('/chat', payload);
    return res.data;
  },

  getConversations: async () => {
    const res = await client.get('/conversations');
    return res.data;
  },

  getMessages: async (convId) => {
    const res = await client.get(`/conversations/${convId}/messages`);
    return res.data;
  }
};

export default client;
