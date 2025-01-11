import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SecretList = () => {
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        const response = await fetch('/api/secrets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch secrets');
        }

        const data = await response.json();
        setSecrets(data.secrets);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSecrets();
  }, [token]);

  if (loading) {
    return <div>Loading secrets...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">My Secrets</h2>
      {secrets.length === 0 ? (
        <p>No secrets found. Create your first secret!</p>
      ) : (
        <div className="grid gap-4">
          {secrets.map(secret => (
            <div 
              key={secret.id} 
              className="bg-white shadow-md rounded-lg p-4"
            >
              <h3 className="font-semibold">{secret.name}</h3>
              <p className="text-gray-600">Category: {secret.category}</p>
              <p className="text-sm text-gray-500">
                Created: {new Date(secret.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecretList;