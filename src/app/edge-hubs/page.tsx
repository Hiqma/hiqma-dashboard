'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Globe, 
  Key,
  Trash2,
  Eye,
  MoreHorizontal,
  MapPin
} from 'lucide-react';
import { LocationSelector } from '@/components/LocationSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EdgeHub {
  id: number;
  hubId: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  encryptionKey: string;
  status: string;
  description?: string;
  createdAt: string;
  lastSyncAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export default function EdgeHubsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    description: ''
  });

  const queryClient = useQueryClient();

  const { data: hubs = [], isLoading } = useQuery({
    queryKey: ['edge-hubs'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/edge-hubs`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch edge hubs');
      }
      return response.json();
    }
  });

  const createHubMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${API_BASE}/edge-hubs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edge-hubs'] });
      setShowAddForm(false);
      setFormData({ name: '', address: '', latitude: null, longitude: null, description: '' });
    }
  });

  const toggleHubStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await fetch(`${API_BASE}/edge-hubs/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edge-hubs'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createHubMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edge Hubs</h1>
          <p className="text-muted-foreground">Manage distributed content delivery hubs</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hub
        </Button>
      </div>

      {/* Add Hub Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Edge Hub</DialogTitle>
            <DialogDescription>
              Create a new edge hub to distribute content to remote locations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hub Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <LocationSelector
                value={{
                  address: formData.address,
                  latitude: formData.latitude,
                  longitude: formData.longitude
                }}
                onChange={(location) => setFormData({
                  ...formData,
                  address: location.address,
                  latitude: location.latitude,
                  longitude: location.longitude
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createHubMutation.isPending}
              >
                {createHubMutation.isPending ? 'Creating...' : 'Create Hub'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hub</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hub ID</TableHead>
              <TableHead>Last Sync</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(hubs) && hubs.map((hub: EdgeHub) => (
              <TableRow key={hub.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{hub.name}</div>
                      {hub.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {hub.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-xs">{hub.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={hub.status === 'active' ? 'default' : 'secondary'}>
                    {hub.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    {hub.hubId}
                  </code>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {hub.lastSyncAt ? new Date(hub.lastSyncAt).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.location.href = `/edge-hubs/${hub.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleHubStatusMutation.mutate({ 
                          id: hub.id, 
                          status: hub.status === 'active' ? 'inactive' : 'active' 
                        })}
                        className={hub.status === 'active' ? 'text-red-600' : 'text-green-600'}
                      >
                        {hub.status === 'active' ? 'Suspend' : 'Activate'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {hubs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No edge hubs registered yet. Add your first hub to get started.
          </div>
        )}
      </Card>
    </div>
  );
}