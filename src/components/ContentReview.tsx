'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, Edit, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActionDropdown } from './ActionDropdown';
import { contentController } from '@/controllers/contentController';
import { useToast } from '@/contexts/ToastContext';
import { authController } from '@/controllers/authController';
import { usersController } from '@/controllers/usersController';
import { EditContentForm } from './EditContentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function ContentReview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contributorFilter, setContributorFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Debounce search term for server-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get current user to check if super_admin
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const user = await authController.getCurrentUser();
        console.log('Current user:', user);
        setIsSuperAdmin(user.role === 'super_admin' || user.role === 'moderator');
        setAuthError(null);
      } catch (error) {
        console.error('Failed to get user role:', error);
        setIsSuperAdmin(false);
        setAuthError(error instanceof Error ? error.message : 'Failed to authenticate');
      }
    };
    checkUserRole();
  }, []);

  // Fetch contributors list
  const { data: contributors = [] } = useQuery({
    queryKey: ['contributors'],
    queryFn: () => usersController.getContributors(),
    enabled: isSuperAdmin === true,
  });

  const { data: contentData, isLoading, error } = useQuery({
    queryKey: ['admin-content', debouncedSearchTerm, statusFilter, contributorFilter, currentPage, isSuperAdmin],
    queryFn: async () => {
      try {
        // Use admin endpoint if super admin, otherwise use pending endpoint
        if (isSuperAdmin) {
          return await contentController.getAdminContent({ 
            search: debouncedSearchTerm || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            contributorId: contributorFilter !== 'all' ? contributorFilter : undefined,
            page: currentPage, 
            limit: 10 
          });
        } else {
          return await contentController.getPendingContent({ 
            search: debouncedSearchTerm || undefined, 
            page: currentPage, 
            limit: 10 
          });
        }
      } catch (error) {
        console.error('Content fetch error:', error);
        throw error;
      }
    },
    enabled: isSuperAdmin !== null, // Only run query after we know the user role
    retry: 1, // Only retry once
    retryDelay: 1000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'verified' | 'rejected' }) =>
      contentController.updateContentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      queryClient.invalidateQueries({ queryKey: ['pending-content'] });
      showToast('success', 'Status Updated', 'Content status updated successfully');
    },
    onError: () => {
      showToast('error', 'Update Failed', 'Failed to update content status');
    },
  });

  const handleStatusUpdate = (id: string, status: 'verified' | 'rejected') => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'verified':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pending Review',
      verified: 'Verified',
      rejected: 'Rejected',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const pendingContent = contentData?.data || [];
  const totalPages = contentData?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-12" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-[80px]" />
                  <Skeleton className="h-8 w-[60px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show authentication error if user is not logged in
  if (authError && authError.includes('No auth token found')) {
    return (
      <div className="space-y-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-red-800 mb-2">Authentication Required</h3>
            <p className="text-red-700 mb-4">
              You need to be logged in to view content. Please log in to continue.
            </p>
            <Button asChild>
              <a href="/login">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content by title or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          
          {isSuperAdmin && (
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>

        {/* Filter Panel */}
        {isSuperAdmin && (
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                          setStatusFilter(value);
                          handleFilterChange();
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Contributor</Label>
                      <Select
                        value={contributorFilter}
                        onValueChange={(value) => {
                          setContributorFilter(value);
                          handleFilterChange();
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Contributors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Contributors</SelectItem>
                          {contributors.map((contributor) => (
                            <SelectItem key={contributor.id} value={contributor.id}>
                              {contributor.name || contributor.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStatusFilter('all');
                          setContributorFilter('all');
                          handleFilterChange();
                        }}
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              {isSuperAdmin && <TableHead>Contributor</TableHead>}
              <TableHead>Category</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingContent.map((content) => (
              <TableRow key={content.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {content.coverImageUrl ? (
                      <div className="w-12 h-16 rounded overflow-hidden shadow-sm flex-shrink-0" style={{ aspectRatio: '3/4' }}>
                        <img
                          src={content.coverImageUrl}
                          alt={`Cover for ${content.title}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">
                        {content.title}
                      </div>
                      {content.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {content.description.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                {isSuperAdmin && (
                  <TableCell>
                    {(content as any).contributor?.name || (content as any).contributor?.email || 'N/A'}
                  </TableCell>
                )}
                <TableCell>
                  {content.category?.name || (content as any).categories?.[0]?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  {content.language}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(content.status)}>
                    {getStatusLabel(content.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/review-content/${content.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        {content.status === 'verified' ? 'View' : 'Review'}
                      </a>
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingContentId(content.id)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    )}
                    {content.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(content.id, 'verified')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(content.id, 'rejected')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {pendingContent.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            {error ? (
              <div className="space-y-2">
                <p className="text-red-600">Error loading content: {error.message}</p>
                <Button 
                  variant="outline" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-content'] })}
                >
                  Retry
                </Button>
              </div>
            ) : searchTerm ? (
              'No content found matching your search.'
            ) : (
              'No content available'
            )}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({contentData?.total} total items)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Content Modal */}
      <Dialog open={!!editingContentId} onOpenChange={(open) => !open && setEditingContentId(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Make changes to the content details and settings.
            </DialogDescription>
          </DialogHeader>
          {editingContentId && (
            <EditContentForm
              contentId={editingContentId}
              onClose={() => {
                setEditingContentId(null);
                queryClient.invalidateQueries({ queryKey: ['admin-content'] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}