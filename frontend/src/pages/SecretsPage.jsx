import React from 'react';
import CreateSecretForm from '../components/CreateSecretForm';
import SecretList from '../components/SecretList';

const SecretsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Secrets</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Create New Secret</h2>
          <CreateSecretForm />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">My Secrets</h2>
          <SecretList />
        </div>
      </div>
    </div>
  );
};

export default SecretsPage;