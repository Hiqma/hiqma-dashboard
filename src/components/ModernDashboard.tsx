'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { analyticsController, DashboardStats } from '@/controllers/analyticsController';

export function ModernDashboard() {
  const router = useRouter();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: analyticsController.getEngagement,
  });

  console.log('Dashboard stats:', stats);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  const statsArray = stats ? [
    {
      name: 'Total Content',
      value: stats.totalContent?.toLocaleString() || '0',
      change: stats.totalContent > 0 ? '+12%' : '+0%',
      changeType: 'positive',
      icon: DocumentTextIcon,
    },
    {
      name: 'Active Users',
      value: stats.activeUsers?.toLocaleString() || '0',
      change: stats.activeUsers > 0 ? '+8%' : '+0%',
      changeType: 'positive',
      icon: UsersIcon,
    },
    {
      name: 'Edge Hubs',
      value: stats.edgeHubs?.toLocaleString() || '0',
      change: stats.edgeHubs > 0 ? '+5%' : '+0%',
      changeType: 'positive',
      icon: GlobeAltIcon,
    },
    {
      name: 'Completion Rate',
      value: `${stats.completionRate?.toFixed(1) || '0'}%`,
      change: stats.completionRate > 0 ? '+3%' : '+0%',
      changeType: 'positive',
      icon: CheckCircleIcon,
    },
  ] : [];

  const recentActivity = [
    { id: 1, title: 'New content submitted for review', time: '2 minutes ago', status: 'pending' },
    { id: 2, title: 'Content approved and published', time: '1 hour ago', status: 'success' },
    { id: 3, title: 'New contributor application', time: '3 hours ago', status: 'review' },
    { id: 4, title: 'Weekly analytics report generated', time: '1 day ago', status: 'completed' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with Hiqma today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsArray.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-black mt-1">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-black rounded-lg">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">
              Recent Activity
            </h2>
            <button className="text-sm text-blue-600 hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-black">
                      {activity.title}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {activity.time}
                    </div>
                  </div>
                </div>
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${activity.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                  ${activity.status === 'review' ? 'bg-blue-100 text-blue-800' : ''}
                  ${activity.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
                `}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-black mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/content')}
              className="w-full p-4 text-left bg-black text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Review Content</p>
                  <p className="text-sm opacity-90">{stats?.totalContent || 0} total content</p>
                </div>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/contributors')}
              className="w-full p-4 text-left bg-gray-800 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Manage Contributors</p>
                  <p className="text-sm opacity-90">{stats?.activeUsers || 0} active users</p>
                </div>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/analytics')}
              className="w-full p-4 text-left bg-gray-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm opacity-90">{stats?.completionRate?.toFixed(1) || 0}% completion rate</p>
                </div>
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/edge-hubs')}
              className="w-full p-4 text-left bg-gray-500 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <GlobeAltIcon className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Manage Edge Hubs</p>
                  <p className="text-sm opacity-90">{stats?.edgeHubs || 0} registered hubs</p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}