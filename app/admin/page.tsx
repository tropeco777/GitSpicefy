"use client";
import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface DashboardStats {
  users: {
    total: number;
    new: number;
    byPlan: Record<string, number>;
  };
  generations: {
    total: number;
    recent: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    averageTime: number;
  };
  revenue: {
    total: number;
    byPlan: Record<string, number>;
  };
  timeline: Array<{
    date: string;
    users: number;
    generations: number;
    revenue: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadDashboardData();
    // Set up real-time refresh
    const interval = setInterval(loadDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}&metric=overview`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Set fallback data
        setStats({
          users: { total: 0, new: 0, byPlan: {} },
          generations: { total: 0, recent: 0, byType: {}, byStatus: {}, averageTime: 0 },
          revenue: { total: 0, byPlan: {} },
          timeline: [],
        });
      }
    } catch (error) {
      // Set fallback data
      setStats({
        users: { total: 0, new: 0, byPlan: {} },
        generations: { total: 0, recent: 0, byType: {}, byStatus: {}, averageTime: 0 },
        revenue: { total: 0, byPlan: {} },
        timeline: [],
      });
    } finally {
      setLoading(false);
    }
  };





  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.users.total || 0,
      change: `+${stats?.users.new || 0} this period`,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Total Generations',
      value: stats?.generations.total || 0,
      change: `+${stats?.generations.recent || 0} this period`,
      icon: FileText,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      name: 'Revenue (Simulated)',
      value: `$${(stats?.revenue.total || 0).toFixed(2)}`,
      change: 'Based on plan selections',
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      name: 'Avg Generation Time',
      value: `${stats?.generations.averageTime || 0}ms`,
      change: 'Performance metric',
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const planData = Object.entries(stats?.users.byPlan || {}).map(([plan, count]) => ({
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    value: count,
  }));

  const generationTypeData = Object.entries(stats?.generations.byType || {}).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  const statusData = Object.entries(stats?.generations.byStatus || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-gray-400">Monitor your GitSpicefy platform performance</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm flex items-center"
            >
              <Activity className="mr-2 h-4 w-4" />
              Refresh
            </button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Timeline Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="generations" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Plans Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">User Plans Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Generation Types */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Generation Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generationTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-gray-300">API Status</span>
              </div>
              <span className="text-green-400 text-sm font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-gray-300">Database</span>
              </div>
              <span className="text-green-400 text-sm font-medium">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-gray-300">Generation Success Rate</span>
              </div>
              <span className="text-blue-400 text-sm font-medium">
                {stats?.generations.byStatus.completed && stats?.generations.total
                  ? `${((stats.generations.byStatus.completed / stats.generations.total) * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-400 mr-2" />
                <span className="text-gray-300">Active Users</span>
              </div>
              <span className="text-purple-400 text-sm font-medium">{stats?.users.new || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="flex items-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Users className="h-6 w-6 text-white mr-3" />
            <span className="text-white font-medium">Manage Users</span>
          </a>
          <a
            href="/admin/generations"
            className="flex items-center p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <FileText className="h-6 w-6 text-white mr-3" />
            <span className="text-white font-medium">View Generations</span>
          </a>
          <a
            href="/admin/analytics"
            className="flex items-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <TrendingUp className="h-6 w-6 text-white mr-3" />
            <span className="text-white font-medium">Analytics</span>
          </a>
          <a
            href="/admin/system"
            className="flex items-center p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
          >
            <Activity className="h-6 w-6 text-white mr-3" />
            <span className="text-white font-medium">System Health</span>
          </a>
        </div>
      </div>
    </div>
  );
}
