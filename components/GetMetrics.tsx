import React, { useState } from 'react';
import { getMetrics } from '../services/api';
import { ApiError, MetricsData } from '../types';
import ResponseDisplay from './ResponseDisplay';
import MetricsDashboard from './MetricsDashboard';

interface GetMetricsProps {
  token: string;
}

const GetMetrics: React.FC<GetMetricsProps> = ({ token }) => {
  const [response, setResponse] = useState<MetricsData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setResponse(null);
    setError(null);
    setIsLoading(true);

    try {
      const data = await getMetrics(token);
      setResponse(data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4">GET /metricas</h2>
      <p className="text-gray-400 mb-6">Busque todas as métricas de uso da API associadas à sua conta.</p>
      <button
        onClick={handleFetch}
        disabled={isLoading}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Buscando...' : 'Buscar Métricas'}
      </button>

      {response && !error && Object.keys(response).length > 0 && (
        <MetricsDashboard metrics={response} />
      )}

      <ResponseDisplay title="Dados Brutos (JSON)" data={response} error={error} isLoading={isLoading} />
    </div>
  );
};

export default GetMetrics;