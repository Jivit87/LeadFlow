import axios from 'axios';

const api = axios.create({
  baseURL: 'https://leadflow-backend-la39.onrender.com/api', 
});

export default api;
