'use client';

import { useState, useEffect } from 'react';
import { Activity, Server, Database, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SystemStatus {
  api: 'operational' | 'degraded' | 'down';
  database: 'healthy' | 'slow' | 'down';
  generation: 'operational' | 'degraded' | 'down';
  uptime: string;
  responseTime: number;
  errorRate: number;
}

export default function AdminSystem() {
  const [status, setStatus] = useState<SystemStatus>({
    api: 'operational',
    database: 'healthy',
    generation: 'operational',
    uptime: '99.9%',
    responseTime: 245,
    errorRate: 0.1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    try {
      setLoading(true);
      // Simulate system status check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you'd fetch this from your monitoring system
      setStatus({
        api: 'operational',
        database: 'healthy',
        generation: 'operational',
        uptime: '99.9%',
        responseTime: Math.floor(Math.random() * 100) + 200,
        errorRate: Math.random() * 0.5,
      });
    } catch (error) {
      console.error('Error loading system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'degraded':
      case 'slow':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'down':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return 'text-green-400';
      case 'degraded':
      case 'slow':
        return 'text-yellow-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Activity className="mr-3 h-8 w-8" />
              System Health
            </h1>
            <p className="text-gray-400">Monitor system status and performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSystemStatus}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Activity className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Overall System Status</h2>
            <p className="text-gray-400">All systems operational</p>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-400 mr-2" />
            <span className="text-green-400 font-semibold">Operational</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Uptime</p>
              <p className="text-2xl font-bold text-white">{status.uptime}</p>
              <p className="text-xs text-green-400">Last 30 days</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Response Time</p>
              <p className="text-2xl font-bold text-white">{status.responseTime}ms</p>
              <p className="text-xs text-gray-400">Average</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Error Rate</p>
              <p className="text-2xl font-bold text-white">{status.errorRate.toFixed(2)}%</p>
              <p className="text-xs text-gray-400">Last 24 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-white mb-6">Service Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center">
              <Server className="h-6 w-6 text-blue-400 mr-3" />
              <div>
                <p className="text-white font-medium">API Server</p>
                <p className="text-gray-400 text-sm">Core application programming interface</p>
              </div>
            </div>
            <div className="flex items-center">
              {getStatusIcon(status.api)}
              <span className={`ml-2 font-medium capitalize ${getStatusColor(status.api)}`}>
                {status.api}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center">
              <Database className="h-6 w-6 text-green-400 mr-3" />
              <div>
                <p className="text-white font-medium">Database</p>
                <p className="text-gray-400 text-sm">Supabase PostgreSQL database</p>
              </div>
            </div>
            <div className="flex items-center">
              {getStatusIcon(status.database)}
              <span className={`ml-2 font-medium capitalize ${getStatusColor(status.database)}`}>
                {status.database}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-purple-400 mr-3" />
              <div>
                <p className="text-white font-medium">README Generation</p>
                <p className="text-gray-400 text-sm">AI-powered README generation service</p>
              </div>
            </div>
            <div className="flex items-center">
              {getStatusIcon(status.generation)}
              <span className={`ml-2 font-medium capitalize ${getStatusColor(status.generation)}`}>
                {status.generation}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Incidents</h3>
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <p className="text-gray-400">No recent incidents</p>
          <p className="text-gray-500 text-sm">All systems have been running smoothly</p>
        </div>
      </div>
    </div>
  );
}
