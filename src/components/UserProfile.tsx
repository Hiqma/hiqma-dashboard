'use client';

import { useQuery } from '@tanstack/react-query';
import { UserIcon, AcademicCapIcon, BookOpenIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { usersController } from '@/controllers/usersController';

export function UserProfile() {
  // Get user ID from localStorage or use a demo UUID
  const userId = typeof window !== 'undefined' ? (localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000') : '550e8400-e29b-41d4-a716-446655440000';
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => usersController.getUserProfile(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Profile not found or user not authenticated</p>
      </div>
    );
  }

  const { user, isAuthor, author, authoredContent } = profile;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="glass rounded-xl p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-12 w-12 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">{user.name}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
            <div className="flex flex-wrap gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                user.role === 'moderator' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' :
                'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              }`}>
                {user.role}
              </span>
              {isAuthor && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                  Author
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
            <UserIcon className="h-6 w-6" />
            Profile Information
          </h2>
          <div className="space-y-4">
            {user.institution && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Institution</label>
                <p className="text-black dark:text-white">{user.institution}</p>
              </div>
            )}
            {user.expertise && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Expertise</label>
                <p className="text-black dark:text-white">{user.expertise}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
              <p className="text-black dark:text-white">{user.country}, {user.continent}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</label>
              <p className="text-black dark:text-white flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {isAuthor && (
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
              <AcademicCapIcon className="h-6 w-6" />
              Author Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Author Name</label>
                <p className="text-black dark:text-white">{author.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Content Published</label>
                <p className="text-black dark:text-white">{authoredContent.length} items</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Authored Content */}
      {isAuthor && authoredContent.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
            <BookOpenIcon className="h-6 w-6" />
            Published Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {authoredContent.map((content: any) => (
              <div key={content.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-black dark:text-white mb-2">{content.title}</h3>
                {content.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {content.description}
                  </p>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                  <span>{content.language} • {content.category}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    content.status === 'verified' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                    content.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                    'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}>
                    {content.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(content.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}