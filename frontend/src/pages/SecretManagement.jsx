// src/pages/SecretManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SecretManagement = () => {
  const [secrets, setSecrets] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        const response = await fetch('/api/secrets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setSecrets(data);
      } catch (error) {
        console.error('Failed to fetch secrets', error);
      }
    };

    fetchSecrets();
  }, [token]);

  return (
    <div>
      <h2>My Secrets</h2>
      {secrets.map(secret => (
        <div key={secret.id}>
          {secret.name}
        </div>
      ))}
    </div>
  );
};

export default SecretManagement;