import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ connectWallet, disconnectWallet, isConnected, error}) => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          EncryptoLock
        </Link>
        
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <>
              <Link to="/dashboard" className="text-gray-800 hover:text-indigo-600">
                Dashboard
              </Link>
              <Link to="/secrets" className="text-gray-800 hover:text-indigo-600">
                Secrets
              </Link>
              <Link to="/audit-trail" className="text-gray-800 hover:text-indigo-600">
                Audit Trail
              </Link>
              <button 
                onClick={disconnectWallet}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
        </div>
      )}
    </nav>
  );
};

export default Navbar;