
import React, { useState } from 'react';
import CreateOrder from './CreateOrder';
import GetOrders from './GetOrders';
import GetMetrics from './GetMetrics';
import DebugCredentials from './DebugCredentials';

interface ApiTesterProps {
  token: string;
}

type Tab = 'create-order' | 'get-orders' | 'get-metrics' | 'debug-credentials';

const ApiTester: React.FC<ApiTesterProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<Tab>('create-order');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'create-order', label: 'Create Order' },
    { id: 'get-orders', label: 'Get Orders' },
    { id: 'get-metrics', label: 'Get Metrics' },
    { id: 'debug-credentials', label: 'Debug Credentials' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'create-order':
        return <CreateOrder token={token} />;
      case 'get-orders':
        return <GetOrders token={token} />;
      case 'get-metrics':
        return <GetMetrics token={token} />;
      case 'debug-credentials':
        return <DebugCredentials token={token} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

export default ApiTester;
