import React, { useMemo, useState } from 'react';
import { Metric, MetricsData } from '../types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, TooltipProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface MetricsDashboardProps {
  metrics: MetricsData;
}

const COLORS_PIE = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];
const COLORS_STATUS: Record<string, string> = { '2xx': '#22c55e', '4xx': '#f97316', '5xx': '#ef4444' };

type SortKey = keyof Metric | '';
type SortDirection = 'asc' | 'desc';

// Helper components
const ChartCard: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className = "" }) => (
    <div className={`bg-gray-800 p-4 rounded-lg border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            {children}
        </div>
    </div>
);

const StatCard: React.FC<{ title: string, value: string | number, subtext?: string }> = ({ title, value, subtext }) => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center md:text-left">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-100">{value}</p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
);

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 border border-gray-700 p-3 rounded-md shadow-lg">
                <p className="label text-gray-300">{`${label}`}</p>
                {payload.map((pld, index) => (
                     <p key={index} style={{ color: pld.color }} className="intro">{`${pld.name} : ${pld.value}`}</p>
                ))}
            </div>
        );
    }
    return null;
};

const getStatusColor = (status: number) => {
    if (status >= 500) return 'text-red-500 bg-red-500/10';
    if (status >= 400) return 'text-orange-400 bg-orange-400/10';
    if (status >= 200) return 'text-green-400 bg-green-400/10';
    return 'text-gray-400 bg-gray-400/10';
}

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKey;
    currentSortKey: SortKey;
    direction: SortDirection;
    onSort: (key: SortKey) => void;
}> = ({ label, sortKey, currentSortKey, direction, onSort }) => (
    <th onClick={() => onSort(sortKey)} className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700">
        {label} {currentSortKey === sortKey && (direction === 'asc' ? '▲' : '▼')}
    </th>
);


const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  const [sortKey, setSortKey] = useState<SortKey>('timestampISO');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const processedData = useMemo(() => {
    const metricsArray = Object.values(metrics);
    if (metricsArray.length === 0) return null;

    // K-V stats
    const totalRequests = metricsArray.length;
    const avgResponseTime = metricsArray.reduce((acc, m) => acc + m.responseTimeMs, 0) / totalRequests;
    const errorCount = metricsArray.filter(m => m.statusCode >= 400).length;
    const errorRate = (totalRequests > 0) ? (errorCount / totalRequests) * 100 : 0;

    // Chart data processing
    const endpointCounts = metricsArray.reduce((acc, { endpoint = "N/A" }) => ({ ...acc, [endpoint]: (acc[endpoint] || 0) + 1 }), {} as Record<string, number>);
    const endpointData = Object.entries(endpointCounts).map(([name, value]) => ({ name, value }));

    const statusCounts = metricsArray.reduce((acc, { statusCode }) => {
        const group = statusCode ? `${Math.floor(statusCode / 100)}xx` : 'N/A';
        return { ...acc, [group]: (acc[group] || 0) + 1 };
    }, {} as Record<string, number>);
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    
    const responseTimesByEndpoint = metricsArray.reduce((acc, { endpoint = "N/A", responseTimeMs }) => {
        if (!acc[endpoint]) acc[endpoint] = { total: 0, count: 0 };
        acc[endpoint].total += responseTimeMs;
        acc[endpoint].count++;
        return acc;
    }, {} as Record<string, { total: number, count: number }>);
    const avgResponseTimeData = Object.entries(responseTimesByEndpoint).map(([name, data]) => ({
      name,
      'Tempo Médio (ms)': parseFloat((data.total / data.count).toFixed(2)),
    }));

    const callsByDay = metricsArray.reduce((acc, { dayBucket, timestampISO }) => {
        const day = dayBucket || timestampISO?.slice(0, 10);
        if(day) acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const timeData = Object.entries(callsByDay)
      .map(([name, requisicoes]) => ({ name, requisicoes }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    return { totalRequests, avgResponseTime, errorRate, endpointData, statusData, avgResponseTimeData, timeData, requestsList: metricsArray };
  }, [metrics]);

  const sortedRequests = useMemo(() => {
    if (!processedData?.requestsList) return [];
    return [...processedData.requestsList].sort((a, b) => {
        if (!sortKey) return 0;
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
  }, [processedData?.requestsList, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };
  
  if (!processedData) return null;

  const { totalRequests, avgResponseTime, errorRate, endpointData, statusData, avgResponseTimeData, timeData } = processedData;

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Dashboard de Métricas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard title="Total de Requisições" value={totalRequests} />
        <StatCard title="Tempo Médio de Resposta" value={`${avgResponseTime.toFixed(2)} ms`} />
        <StatCard title="Taxa de Erros" value={`${errorRate.toFixed(2)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Requisições ao Longo do Tempo" className="col-span-1">
            <ResponsiveContainer>
                <LineChart data={timeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#a0a0a0" fontSize={12} />
                    <YAxis stroke="#a0a0a0" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="requisicoes" name="Requisições" stroke="#818cf8" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <ChartCard title="Requisições por Endpoint">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={endpointData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {endpointData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Distribuição de Status HTTP">
            <ResponsiveContainer>
              <PieChart>
                 <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_STATUS[entry.name] || COLORS_PIE[index % COLORS_PIE.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tempo Médio de Resposta por Endpoint" className="lg:col-span-2">
             <ResponsiveContainer>
                <BarChart data={avgResponseTimeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" stroke="#a0a0a0" />
                    <YAxis dataKey="name" type="category" stroke="#a0a0a0" width={120} fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Tempo Médio (ms)" fill="#6366f1" />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-gray-100">Requisições Recentes</h3>
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                    <tr>
                        <SortableHeader label="Data/Hora" sortKey="timestampISO" currentSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                        <SortableHeader label="Método" sortKey="method" currentSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                        <SortableHeader label="Endpoint" sortKey="endpoint" currentSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                        <SortableHeader label="Status" sortKey="statusCode" currentSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                        <SortableHeader label="Duração (ms)" sortKey="responseTimeMs" currentSortKey={sortKey} direction={sortDirection} onSort={handleSort} />
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {sortedRequests.map((req, index) => (
                        <tr key={index} className="hover:bg-gray-700/50">
                            <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{new Date(req.timestampISO).toLocaleString()}</td>
                            <td className="p-3 text-sm text-gray-300 whitespace-nowrap font-mono">{req.method}</td>
                            <td className="p-3 text-sm text-gray-300 whitespace-nowrap font-mono">{req.endpoint}</td>
                            <td className="p-3 text-sm whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.statusCode)}`}>
                                    {req.statusCode}
                                </span>
                            </td>
                            <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{req.responseTimeMs.toFixed(2)} ms</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MetricsDashboard);