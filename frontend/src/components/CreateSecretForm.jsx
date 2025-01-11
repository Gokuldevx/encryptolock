// src/components/CreateSecretForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CreateSecretForm = () => {
  const [secretName, setSecretName] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/secrets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: secretName,
          value: secretValue,
          category
        })
      });

      const data = await response.json();

      if (data.success) {
        // Reset form and show success message
        setSecretName('');
        setSecretValue('');
        setCategory('OTHER');
        setSuccess(true);

        // Optional: Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Handle error from server
        setError(data.error?.message || 'Failed to create secret');
      }
    } catch (error) {
      console.error('Error creating secret', error);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Secret</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          Secret created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="secretName" 
            className="block text-sm font-medium text-gray-700"
          >
            Secret Name
          </label>
          <input
            id="secretName"
            type="text"
            value={secretName}
            onChange={(e) => setSecretName(e.target.value)}
            placeholder="Enter secret name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label 
            htmlFor="secretValue" 
            className="block text-sm font-medium text-gray-700"
          >
            Secret Value
          </label>
          <input
            id="secretValue"
            type="password"  // Changed to password for sensitive data
            value={secretValue}
            onChange={(e) => setSecretValue(e.target.value)}
            placeholder="Enter secret value"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label 
            htmlFor="category" 
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select 
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="OTHER">Other</option>
            <option value="PASSWORD">Password</option>
            <option value="API_KEY">API Key</option>
            <option value="NOTE">Note</option>
            <option value="CREDIT_CARD">Credit Card</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Secret
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSecretForm;