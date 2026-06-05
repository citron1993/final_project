import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const apiClient = {
    // דיירים
    getClients: () => axios.get(`${API_URL}/clients`),
    addClient: (data) => axios.post(`${API_URL}/clients`, data),
    deleteClient: (id) => axios.delete(`${API_URL}/clients/${id}`),
    
    // מערכת
    getStats: () => axios.get(`${API_URL}/stats`),
    login: (credentials) => axios.post(`${API_URL}/login`, credentials)
};