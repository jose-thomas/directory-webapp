import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_CHURCH_API,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  export default api;