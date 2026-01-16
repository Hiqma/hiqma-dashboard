'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldCheckIcon, 
  UserIcon, 
  LockClosedIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { hubsController } from '@/controllers/hubsController';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HubSettingsProps {
  hubId: string;
}

export function HubSettings({ hubId }: HubSettingsProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [allowAnonymousAccess, setAllowAnonymousAccess] = useState(true);
  const [requireStudentAuthentication, setRequireStudentAuthentication] = useState(false);
  const [authenticationMessage, setAuthenticationMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['hub-settings', hubId],
    queryFn: () => hubsController.getHubSettings(hubId),
    enabled: !!hubId
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setAllowAnonymousAccess(settings.allowAnonymousAccess ?? true);
      setRequireStudentAuthentication(settings.requireStudentAuthentication ?? false);
      setAuthenticationMessage(settings.authenticationMessage ?? '');
      setHasChanges(false);
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    if (settings) {
      const changed = 
        allowAnonymousAccess !== (settings.allowAnonymousAccess ?? true) ||
        requireStudentAuthentication !== (settings.requireStudentAuthentication ?? false) ||
        authenticationMessage !== (settings.authenticationMessage ?? '');
      setHasChanges(changed);
    }
  }, [allowAnonymousAccess, requireStudentAuthentication, authenticationMessage, settings]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (newSettings: {
      allowAnonymousAccess?: boolean;
      requireStudentAuthentication?: boolean;
      authenticationMessage?: string;
    }) => hubsController.updateHubSettings(hubId, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-settings', hubId] });
      setHasChanges(false);
      showToast('success', 'Settings Updated', 'Hub authentication settings have been updated successfully.');
    },
    onError: (error: any) => {
      showToast('error', 'Update Failed', error.message || 'Failed to update hub settings.');
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      allowAnonymousAccess,
      requireStudentAuthentication,
      authenticationMessage: authenticationMessage.trim() || undefined
    });
  };

  const handleReset = () => {
    if (settings) {
      setAllowAnonymousAccess(settings.allowAnonymousAccess ?? true);
      setRequireStudentAuthentication(settings.requireStudentAuthentication ?? false);
      setAuthenticationMessage(settings.authenticationMessage ?? '');
    }
  };

  const handleAnonymousAccessChange = (checked: boolean) => {
    setAllowAnonymousAccess(checked);
    // If enabling anonymous access, disable student authentication requirement
    if (checked && requireStudentAuthentication) {
      setRequireStudentAuthentication(false);
    }
  };

  const handleStudentAuthChange = (checked: boolean) => {
    setRequireStudentAuthentication(checked);
    // If requiring student authentication, disable anonymous access
    if (checked && allowAnonymousAccess) {
      setAllowAnonymousAccess(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Hub Settings</h2>
        <p className="text-muted-foreground">
          Configure authentication and access control settings for mobile app users.
        </p>
      </div>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5" />
            Authentication & Access Control
          </CardTitle>
          <CardDescription>
            Control how students access content through the mobile app on this hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Anonymous Access Setting */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="anonymous-access" className="text-sm font-medium">
                  Allow Anonymous Access
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Students can use the mobile app without logging in or entering a student code.
              </p>
            </div>
            <Switch
              id="anonymous-access"
              checked={allowAnonymousAccess}
              onCheckedChange={handleAnonymousAccessChange}
            />
          </div>

          {/* Student Authentication Setting */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <LockClosedIcon className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="student-auth" className="text-sm font-medium">
                  Require Student Authentication
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Students must log in with their student code before accessing content.
              </p>
            </div>
            <Switch
              id="student-auth"
              checked={requireStudentAuthentication}
              onCheckedChange={handleStudentAuthChange}
            />
          </div>

          {/* Authentication Message */}
          <div className="space-y-2">
            <Label htmlFor="auth-message" className="text-sm font-medium">
              Authentication Message (Optional)
            </Label>
            <Textarea
              id="auth-message"
              placeholder="Enter a custom message to display to students when authentication is required..."
              value={authenticationMessage}
              onChange={(e) => setAuthenticationMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This message will be shown to students on the mobile app login screen.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5" />
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                <strong>Mobile App Behavior:</strong>{' '}
                {allowAnonymousAccess && !requireStudentAuthentication && (
                  "Students can access content immediately without any authentication."
                )}
                {!allowAnonymousAccess && requireStudentAuthentication && (
                  "Students must enter their student code to access content."
                )}
                {!allowAnonymousAccess && !requireStudentAuthentication && (
                  "Students cannot access content (both anonymous access and student authentication are disabled)."
                )}
              </AlertDescription>
            </Alert>

            {!allowAnonymousAccess && !requireStudentAuthentication && (
              <Alert>
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> With both options disabled, students will not be able to access any content through the mobile app.
                </AlertDescription>
              </Alert>
            )}

            {authenticationMessage && (
              <div className="bg-muted/50 p-3 rounded-lg border border-border">
                <p className="text-sm font-medium text-foreground mb-1">Custom Authentication Message:</p>
                <p className="text-sm text-muted-foreground italic">"{authenticationMessage}"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save/Reset Actions */}
      {hasChanges && (
        <Card className="border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  You have unsaved changes
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={updateMutation.isPending}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}