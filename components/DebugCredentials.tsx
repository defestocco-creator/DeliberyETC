
import React, { useState } from 'react';
import { getDebugCredentials } from '../services/api';
import { ApiError } from '../types';
import ResponseDisplay from './ResponseDisplay';

interface DebugCredentialsProps {
  token: string;
}

const DebugCredentials: React.FC<DebugCredentialsProps> = ({ token }) => {
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setResponse(null);
    setError(null);
    setIsLoading(true);

    try {
      const data = await getDebugCredentials(token);
      setResponse(data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4">GET /debug-credenciais</h2>
      <p className="text-gray-400 mb-6">Busque as credenciais do Firebase associadas à sua conta para verificar a conexão.</p>
      <button
        onClick={handleFetch}
        disabled={isLoading}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Buscando...' : 'Buscar Credenciais'}
      </button>

      <ResponseDisplay title="Resposta da API" data={response} error={error} isLoading={isLoading} />
    </div>
  );
};

export default DebugCredentials;