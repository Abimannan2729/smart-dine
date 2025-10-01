import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  QrCode,
  Users,
  Star,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
} from 'lucide-react';
import Button from '../ui/Button';
import { Menu } from '../../types/menu';
import AnalyticsExportModal from './AnalyticsExportModal';
import { AnalyticsExportData } from '../../utils/analyticsExportUtils';

interface AnalyticsDashboardProps {
  menu: Menu;
  restaurantName?: string;
}

interface AnalyticsData {
  menuViews: {
    total: number;
    change: number;
    data: Array<{ date: string; views: number; scans: number }>;
  };
  qrScans: {
    total: number;
    change: number;
  };
  popularItems: Array<{
    name: string;
    views: number;
    category: string;
    change: number;
  }>;
  categoryPerformance: Array<{
    name: string;
    views: number;
    items: number;
    avgRating?: number;
  }>;
  timeDistribution: Array<{
    hour: string;
    views: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ menu, restaurantName = 'Restaurant' }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'traffic' | 'devices'>('overview');
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [menu._id, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual analytics service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API data
      setAnalytics({
        menuViews: {
          total: 1245,
          change: 12.5,
          data: Array.from({ length: 30 }, (_, i) => ({
            date: format(subDays(new Date(), 29 - i), 'MMM dd'),
            views: Math.floor(Math.random() * 100) + 20,
            scans: Math.floor(Math.random() * 50) + 10,
          })),
        },
        qrScans: {
          total: 342,
          change: 8.3,
        },
        popularItems: [
          { name: 'Grilled Salmon', views: 156, category: 'Main Course', change: 15.2 },
          { name: 'Caesar Salad', views: 134, category: 'Appetizers', change: -2.1 },
          { name: 'Chocolate Cake', views: 128, category: 'Desserts', change: 9.8 },
          { name: 'Margherita Pizza', views: 98, category: 'Main Course', change: 23.4 },
          { name: 'Iced Coffee', views: 87, category: 'Beverages', change: 5.7 },
        ],
        categoryPerformance: menu.categories.map((cat, index) => ({
          name: cat.name,
          views: Math.floor(Math.random() * 200) + 50,
          items: cat.items?.length || 0,
          avgRating: Number((Math.random() * 2 + 3).toFixed(1)),
        })),
        timeDistribution: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          views: Math.floor(Math.random() * 30) + (i >= 11 && i <= 14 ? 20 : i >= 18 && i <= 21 ? 25 : 5),
        })),
        deviceBreakdown: [
          { device: 'Mobile', count: 876, percentage: 68.2 },
          { device: 'Desktop', count: 245, percentage: 19.1 },
          { device: 'Tablet', count: 163, percentage: 12.7 },
        ],
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="ml-1">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Analytics data will appear here once your menu starts receiving views.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Track your menu performance and engagement</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Button 
            variant="outline" 
            size="sm" 
            icon={<Download size={16} />}
            onClick={() => setShowExportModal(true)}
            data-analytics-export="true"
          >
            Export
          </Button>
          
          <Button variant="outline" size="sm" icon={<RefreshCw size={16} />} onClick={loadAnalytics}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Menu Views"
          value={analytics.menuViews.total.toLocaleString()}
          change={analytics.menuViews.change}
          icon={<Eye size={24} className="text-blue-600" />}
          color="bg-blue-100"
        />
        
        <StatCard
          title="QR Scans"
          value={analytics.qrScans.total.toLocaleString()}
          change={analytics.qrScans.change}
          icon={<QrCode size={24} className="text-green-600" />}
          color="bg-green-100"
        />
        
        <StatCard
          title="Popular Items"
          value={analytics.popularItems.length}
          icon={<Star size={24} className="text-yellow-600" />}
          color="bg-yellow-100"
        />
        
        <StatCard
          title="Categories"
          value={analytics.categoryPerformance.length}
          icon={<BarChart3 size={24} className="text-purple-600" />}
          color="bg-purple-100"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'items', label: 'Popular Items', icon: Star },
            { id: 'traffic', label: 'Traffic Patterns', icon: TrendingUp },
            { id: 'devices', label: 'Devices', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views & Scans Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Views & Scans Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.menuViews.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="QR Scans"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Performance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Most Popular Items</h3>
              <div className="space-y-4">
                {analytics.popularItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">{item.views}</p>
                        <p className="text-xs text-gray-500">views</p>
                      </div>
                      <div className={`flex items-center text-sm ${
                        item.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span className="ml-1">{Math.abs(item.change)}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'traffic' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic by Time of Day</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Breakdown Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ device, percentage }) => `${device} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Device Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Statistics</h3>
              <div className="space-y-4">
                {analytics.deviceBreakdown.map((device, index) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-gray-900">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{device.count.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{device.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bottom Export Section */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Analytics Report</h3>
            <p className="text-gray-600">Download comprehensive analytics data in multiple formats</p>
          </div>
          <Button 
            variant="primary" 
            size="lg" 
            icon={<Download size={20} />}
            onClick={() => setShowExportModal(true)}
            data-analytics-export="true"
          >
            Export Analytics
          </Button>
        </div>
      </div>

      {/* Analytics Export Modal */}
      {analytics && (
        <AnalyticsExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          analyticsData={analytics}
          restaurantName={restaurantName}
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard;