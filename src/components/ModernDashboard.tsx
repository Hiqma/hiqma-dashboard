'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Globe,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';
import { analyticsController, DashboardStats } from '@/controllers/analyticsController';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function ModernDashboard() {
  const router = useRouter();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: analyticsController.getEngagement,
  });

  console.log('Dashboard stats:', stats);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-[60px] mb-1" />
                <Skeleton className="h-3 w-[80px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsArray = stats ? [
    {
      name: 'Total Content',
      value: stats.totalContent?.toLocaleString() || '0',
      change: stats.totalContent > 0 ? '+12%' : '+0%',
      changeType: 'positive',
      icon: FileText,
    },
    {
      name: 'Active Users',
      value: stats.activeUsers?.toLocaleString() || '0',
      change: stats.activeUsers > 0 ? '+8%' : '+0%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Edge Hubs',
      value: stats.edgeHubs?.toLocaleString() || '0',
      change: stats.edgeHubs > 0 ? '+5%' : '+0%',
      changeType: 'positive',
      icon: Globe,
    },
    {
      name: 'Completion Rate',
      value: `${stats.completionRate?.toFixed(1) || '0'}%`,
      change: stats.completionRate > 0 ? '+3%' : '+0%',
      changeType: 'positive',
      icon: CheckCircle,
    },
  ] : [];

  const recentActivity = [
    { id: 1, title: 'New content submitted for review', time: '2 minutes ago', status: 'pending' },
    { id: 2, title: 'Content approved and published', time: '1 hour ago', status: 'success' },
    { id: 3, title: 'New contributor application', time: '3 hours ago', status: 'review' },
    { id: 4, title: 'Weekly analytics report generated', time: '1 day ago', status: 'completed' },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'success':
        return 'default';
      case 'review':
        return 'outline';
      case 'completed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with Hiqma today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsArray.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-600 font-medium">
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="outline" size="sm">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.title}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/content')}
                className="w-full justify-start h-auto py-4"
                variant="default"
              >
                <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Review Content</div>
                  <div className="text-sm opacity-90 mt-0.5">{stats?.totalContent || 0} total content</div>
                </div>
              </Button>
              
              <Button
                onClick={() => router.push('/contributors')}
                className="w-full justify-start h-auto py-4"
                variant="secondary"
              >
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Manage Contributors</div>
                  <div className="text-sm opacity-90 mt-0.5">{stats?.activeUsers || 0} active users</div>
                </div>
              </Button>
              
              <Button
                onClick={() => router.push('/analytics')}
                className="w-full justify-start h-auto py-4"
                variant="outline"
              >
                <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">View Analytics</div>
                  <div className="text-sm opacity-90 mt-0.5">{stats?.completionRate?.toFixed(1) || 0}% completion rate</div>
                </div>
              </Button>
              
              <Button
                onClick={() => router.push('/edge-hubs')}
                className="w-full justify-start h-auto py-4"
                variant="outline"
              >
                <Globe className="mr-3 h-5 w-5 flex-shrink-0" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Manage Edge Hubs</div>
                  <div className="text-sm opacity-90 mt-0.5">{stats?.edgeHubs || 0} registered hubs</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}