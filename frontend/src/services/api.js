import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const podApi = {
  getAllPods: () => api.get('/api/pods'),
  getPodsByNamespace: (namespace) => api.get(`/api/pods/${namespace}`),
  getPodDetail: (namespace, podName) =>
    api.get(`/api/pods/${namespace}/${podName}`),
  getPodLogs: (namespace, podName, container, tailLines = 500) =>
    api.get(`/api/pods/${namespace}/${podName}/logs`, {
      params: { container, tailLines },
    }),
};

export const namespaceApi = {
  getNamespaces: () => api.get('/api/namespaces'),
};

export default api;
