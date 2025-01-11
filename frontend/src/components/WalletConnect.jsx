// src/components/WalletConnect.jsx
import React, { useState } from 'react';
import { BrowserProvider } from 'ethers';

const WalletConnect = ({ onConnect }) => {
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      // Check if Ethereum provider is available
      if (window.ethereum) {
        // Create provider using BrowserProvider
        const provider = new BrowserProvider(window.ethereum);
        
        // Request account access
        const accounts = await provider.send('eth_requestAccounts', []);
        
        // Get the signer
        const signer = await provider.getSigner();
        
        // Create message for signature
        const message = "Sign in to EncryptoLock";
        
        // Sign the message
        const signature = await signer.signMessage(message);
        
        // Send authentication request to backend
        const response = await fetch('/api/auth/authenticate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            message, 
            signature,
            address: accounts[0]
          })
        });

        const data = await response.json();

        if (data.success) {
          // Store token
          localStorage.setItem('token', data.token);
          
          // Call onConnect callback
          onConnect(data.token);
        } else {
          setError(data.message || 'Authentication failed');
        }
      } else {
        setError('Please install MetaMask');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    }
  };

  return (
    <div>
      <button 
        onClick={connectWallet}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Connect Wallet
      </button>
      
      {error && (
        <div className="text-red-500 mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;