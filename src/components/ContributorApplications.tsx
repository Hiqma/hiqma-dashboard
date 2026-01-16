'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, User, Search, GraduationCap } from 'lucide-react';
import { contributorsController, Application } from '@/controllers/contributorsController';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export function ContributorApplications() {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { showToast } = useToast();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['contributor-applications'],
    queryFn: contributorsController.getApplications,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      contributorsController.reviewApplication(id, status, null),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['contributor-applications'] });
      setSelectedApp(null);
      showToast('success', 'Application Reviewed', `Application ${status} successfully!`);
    },
    onError: () => {
      showToast('error', 'Review Failed', 'Failed to review application');
    },
  });

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.expertise.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const handleReview = (id: string, status: 'approved' | 'rejected') => {
    reviewMutation.mutate({ id, status });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-end gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-end gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                Pending: {applications.filter(a => a.status === 'pending').length}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Approved: {applications.filter(a => a.status === 'approved').length}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-800 dark:text-red-200">
                Rejected: {applications.filter(a => a.status === 'rejected').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredApplications?.map((app) => (
                <div
                  key={app.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02] border ${
                    selectedApp?.id === app.id 
                      ? 'bg-accent border-primary' 
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{app.name}</h4>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{app.institution}</p>
                    <p className="text-sm text-muted-foreground truncate">{app.expertise}</p>
                    <p className="text-xs text-muted-foreground">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {filteredApplications?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No applications found</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">Try adjusting your search terms</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Details */}
        <Card>
          <CardContent className="p-6">
            {selectedApp ? (
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selectedApp.name}</h2>
                    <p className="text-muted-foreground text-lg">{selectedApp.email}</p>
                    <Badge variant={getStatusVariant(selectedApp.status)} className="mt-2">
                      {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Institution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p>{selectedApp.institution}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Areas of Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p>{selectedApp.expertise}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Motivation</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="leading-relaxed">{selectedApp.motivation}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Application Date
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p>{new Date(selectedApp.appliedAt).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>

                {selectedApp.status === 'pending' && (
                  <div className="flex gap-3 mt-8 pt-6 border-t">
                    <Button
                      onClick={() => handleReview(selectedApp.id, 'approved')}
                      disabled={reviewMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {reviewMutation.isPending ? 'Processing...' : 'Approve Application'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReview(selectedApp.id, 'rejected')}
                      disabled={reviewMutation.isPending}
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {reviewMutation.isPending ? 'Processing...' : 'Reject Application'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Application Selected</h3>
                <p>Choose an application from the list to view detailed information</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}