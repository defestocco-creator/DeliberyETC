
import React, { useMemo } from 'react';
import { MetricsData } from '../types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface MetricsDashboardProps {
  metrics: MetricsData;
}

const COLORS_PIE = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];
const COLORS_STATUS = { '2xx': '#22c55e', '4xx': '#f97316', '5xx': '#ef4444' };


const ChartCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            {children}
        </div>
    </div>
);

const StatCard: React.FC<{ title: string, value: string | number, subtext?: string }> = ({ title, value, subtext }) => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-100">{value}</p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
);


const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  const processedData = useMemo(() => {
    const metricsArray = Object.values(metrics);
    if (metricsArray.length === 0) return null;

    // K-V stats
    const totalRequests = metricsArray.length;
    const avgResponseTime = metricsArray.reduce((acc, m) => acc + m.responseTimeMs, 0) / totalRequests;
    const errorCount = metricsArray.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100;

    // Endpoint distribution
    const endpointCounts = metricsArray.reduce((acc, metric) => {
        const endpoint = metric.endpoint || "N/A";
        acc[endpoint] = (acc[endpoint] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const endpointData = Object.entries(endpointCounts).map(([name, value]) => ({ name, value }));

    // Status code distribution
    const statusCounts = metricsArray.reduce((acc, metric) => {
        const statusGroup = metric.statusCode ? `${Math.floor(metric.statusCode / 100)}xx` : 'N/A';
        acc[statusGroup] = (acc[statusGroup] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    
    // Average response time per endpoint
    const responseTimesByEndpoint = metricsArray.reduce((acc, metric) => {
        const endpoint = metric.endpoint || "N/A";
        if (!acc[endpoint]) {
            acc[endpoint] = { total: 0, count: 0 };
        }
        acc[endpoint].total += metric.responseTimeMs;
        acc[endpoint].count += 1;
        return acc;
    }, {} as Record<string, { total: number, count: number }>);

    const avgResponseTimeData = Object.entries(responseTimesByEndpoint).map(([name, data]) => ({
      name,
      'Tempo Médio (ms)': parseFloat((data.total / data.count).toFixed(2)),
    }));

    // Requests over time
    const callsByDay = metricsArray.reduce((acc, metric) => {
        const day = metric.dayBucket || metric.timestampISO?.slice(0, 10);
        if(day) {
            acc[day] = (acc[day] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    const timeData = Object.entries(callsByDay)
      .map(([name, requisicoes]) => ({ name, requisicoes }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());


    return {
        totalRequests,
        avgResponseTime,
        errorRate,
        endpointData,
        statusData,
        avgResponseTimeData,
        timeData,
    };
  }, [metrics]);

  if (!processedData) {
    return null;
  }

  const { totalRequests, avgResponseTime, errorRate, endpointData, statusData, avgResponseTimeData, timeData } = processedData;

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Painel de Métricas</h2>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard title="Total de Requisições" value={totalRequests} />
        <StatCard title="Tempo Médio de Resposta" value={`${avgResponseTime.toFixed(2)} ms`} />
        <StatCard title="Taxa de Erros" value={`${errorRate.toFixed(2)}%`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <ChartCard title="Requisições por Endpoint">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={endpointData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {endpointData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Distribuição de Status HTTP">
            <ResponsiveContainer>
              <PieChart>
                 <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_STATUS[entry.name as keyof typeof COLORS_STATUS] || COLORS_PIE[index % COLORS_PIE.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tempo Médio de Resposta por Endpoint">
             <ResponsiveContainer>
                <BarChart data={avgResponseTimeData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" stroke="#a0a0a0" />
                    <YAxis dataKey="name" type="category" stroke="#a0a0a0" width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #444' }} />
                    <Legend />
                    <Bar dataKey="Tempo Médio (ms)" fill="#6366f1" />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
       
        <ChartCard title="Requisições ao Longo do Tempo">
            <ResponsiveContainer>
                <LineChart data={timeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#a0a0a0" />
                    <YAxis stroke="#a0a0a0" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #444' }}/>
                    <Legend />
                    <Line type="monotone" dataKey="requisicoes" stroke="#818cf8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
};

export default React.memo(MetricsDashboard);
