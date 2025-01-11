import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BrowserProvider } from 'ethers';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import WalletConnect from './components/WalletConnect';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SecretsPage from './pages/SecretsPage';
import ProfilePage from './pages/ProfilePage';
import AuditTrail from './pages/AuditTrail';

// Styles
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Unexpected response: ${text}`);
          }


          const data = await response.json();

          if (data.success) {
            setIsAuthenticated(true);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setError(data.error?.message || 'Authentication failed');
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication verification failed', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsLoading(false);
        setError(error.message);
      }
    };

    checkAuthentication();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-100">
        <div className="bg-red-500 text-white p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  const [web3Provider, setWeb3Provider] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    setError(null);
    try {
      if (window.ethereum) {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Create provider
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        // Create message for signature
        const message = `Sign in to EncryptoLock\n\nWallet Address: ${address}`;
        const signature = await signer.signMessage(message);

        // Log request details for debugging
        console.log('Authentication Request:', {
          message,
          signature,
          address
        });

        // Send authentication request to backend
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/authenticate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message,
            signature,
            address
          })
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Unexpected response: ${text}`);
        }

        const data = await response.json();

        if (data.success) {
          // Store token and user info
          localStorage.setItem('token', data.token);
          setWeb3Provider(provider);
        } else {
          const errorMessage = data.error?.message || 'Authentication failed';
          setError(errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        throw new Error('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Wallet connection failed', error);
      setError(error.message || 'Wallet connection failed');
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Server responded with:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error setting up request:', error.message);
      }
      // Optional: Show error to user
      alert(error.message);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('token');
    setWeb3Provider(null);
    setError(null);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-100">
          <Navbar
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
            isConnected={!!web3Provider}
            error={error}
          />

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              {error}
            </div>
          )}

          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <HomePage
                  connectWallet={connectWallet}
                  isConnected={!!web3Provider}
                  error={error}
                />
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/secrets"
              element={
                <ProtectedRoute>
                  <SecretsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit-trail"
              element={
                <ProtectedRoute>
                  <AuditTrail />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={<Navigate to="/" />}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;