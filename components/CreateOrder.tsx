
import React, { useState } from 'react';
import { createOrder } from '../services/api';
import { Order, ApiError } from '../types';
import ResponseDisplay from './ResponseDisplay';

interface CreateOrderProps {
  token: string;
}

const defaultOrder: Order = {
  cliente: "John Doe",
  endereco: {
    rua: "Main Street",
    numero: "123",
    bairro: "Downtown"
  },
  itens: {
    "Pizza Margherita": {
      "quantidade": 1,
      "preco": 35.50
    },
     "Coca-Cola 2L": {
      "quantidade": 1,
      "preco": 10.00
    }
  },
  telefone: "5511999998888",
  valor_total: 45.50,
  pagamento: "Cartão de Crédito",
};

const CreateOrder: React.FC<CreateOrderProps> = ({ token }) => {
  const [orderPayload, setOrderPayload] = useState(JSON.stringify(defaultOrder, null, 2));
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponse(null);
    setError(null);
    setIsLoading(true);

    try {
      const orderData: Order = JSON.parse(orderPayload);
      const data = await createOrder(orderData, token);
      setResponse(data);
    } catch (err: any) {
        if (err instanceof SyntaxError) {
             setError({ erro: "Invalid JSON format." });
        } else {
             setError(err as ApiError);
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4">POST /pedido</h2>
      <p className="text-gray-400 mb-6">Create a new order. The payload must be a valid JSON.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="orderPayload" className="block text-sm font-medium text-gray-400 mb-1">
            Order JSON Payload
          </label>
          <textarea
            id="orderPayload"
            value={orderPayload}
            onChange={(e) => setOrderPayload(e.target.value)}
            rows={15}
            className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-gray-100 font-mono text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Request'}
        </button>
      </form>

      <ResponseDisplay title="API Response" data={response} error={error} isLoading={isLoading} />
    </div>
  );
};

export default CreateOrder;
