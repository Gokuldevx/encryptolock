import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data.user);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Ethereum Address
          </label>
          <p className="text-gray-600 break-all">{profile.ethereumAddress}</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Last Login
          </label>
          <p className="text-gray-600">
            {new Date(profile.lastLogin).toLocaleString()}
          </p>
        </div>
        
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Account Status
          </label>
          <p className="text-green-600 font-semibold">
            Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;