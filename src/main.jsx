import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

// This is a super important piece of code! It runs before every single API call and adds the VIP Pass (JWT Token) to the header.
// This way, we don't have to manually add the token in every single file where we make an API call. It's like having a butler who always makes sure you have your VIP Pass when you go out!

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pirivena_token");
    if (token) {
      // The standard way to present a JWT is with the word "Bearer " in front of it
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
