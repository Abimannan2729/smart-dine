import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthDebug: React.FC = () => {
  const { state } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <div>
        <strong>Loading:</strong> {state.loading ? 'true' : 'false'}
      </div>
      <div>
        <strong>Is Authenticated:</strong> {state.isAuthenticated ? 'true' : 'false'}
      </div>
      <div>
        <strong>User:</strong> {state.user ? state.user.email : 'null'}
      </div>
      <div>
        <strong>Token:</strong> {state.token ? 'Present' : 'null'}
      </div>
      <div>
        <strong>LocalStorage Token:</strong> {localStorage.getItem('token') ? 'Present' : 'null'}
      </div>
      <div>
        <strong>LocalStorage User:</strong> {localStorage.getItem('user') ? 'Present' : 'null'}
      </div>
    </div>
  );
};

export default AuthDebug;