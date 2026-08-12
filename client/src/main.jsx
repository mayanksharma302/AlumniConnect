import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { toast } from 'sonner';
import App from './App.jsx';
import './index.css';

let isRedirectingToSignIn = false;

const clearAuthSession = () => {
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
};

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthFailure = status === 401 || status === 403;

    if (isAuthFailure && !isRedirectingToSignIn) {
      isRedirectingToSignIn = true;
      clearAuthSession();
      toast.warning('Your session has expired. Please sign in again.');
      window.location.assign('/signin');
    }

    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
