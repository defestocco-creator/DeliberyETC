
import React, { useState, useCallback, useEffect } from 'react';
import Login from './components/Login';
import ApiTester from './components/ApiTester';
import { AuthData } from './types';

const App: React.FC = () => {
  const [authData, setAuthData] = useState<AuthData | null>(null);

  useEffect(() => {
    const storedAuthData = localStorage.getItem('authData');
    if (storedAuthData) {
      setAuthData(JSON.parse(storedAuthData));
    }
  }, []);

  const handleLogin = useCallback((data: AuthData) => {
    localStorage.setItem('authData', JSON.stringify(data));
    setAuthData(data);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authData');
    setAuthData(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <h1 className="text-2xl font-bold tracking-tighter">Ambiente de Testes da API Delibery</h1>
        </div>
        {authData && (
          <div className="flex items-center space-x-4">
             <div className="text-right">
                <p className="text-sm text-gray-400">{authData.email}</p>
                <p className="text-xs text-gray-500">ID do Cliente: {authData.clientId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold transition-colors text-sm"
            >
              Sair
            </button>
          </div>
        )}
      </header>

      <main className="p-4 md:p-8">
        {!authData ? (
          <Login onLogin={handleLogin} />
        ) : (
          <ApiTester token={authData.token} />
        )}
      </main>
    </div>
  );
};

export default App;