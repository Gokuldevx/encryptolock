import React from 'react';

const HomePage = ({ connectWallet, isConnected, error }) => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <h1 className="text-4xl font-bold mb-4">Welcome to EncryptoLock</h1>
      <p className="text-xl mb-6">
        Secure your sensitive information with blockchain-powered encryption
      </p>
      
      {!isConnected ? (
        <button 
          onClick={connectWallet}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          Connect Wallet to Get Started
        </button>
      ) : (
        <p className="text-green-600">Wallet Connected</p>
      )}
    </div>
  );
};

export default HomePage;