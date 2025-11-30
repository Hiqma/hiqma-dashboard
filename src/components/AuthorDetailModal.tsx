'use client';

import { motion } from 'framer-motion';
import { XMarkIcon, BookOpenIcon, CalendarIcon, GlobeAltIcon, UserIcon } from '@heroicons/react/24/outline';
import { Author } from '@/controllers/authorsController';
import { useQuery } from '@tanstack/react-query';
import { authorsController } from '@/controllers/authorsController';

interface AuthorDetailModalProps {
  author: Author;
  onClose: () => void;
}

export function AuthorDetailModal({ author, onClose }: AuthorDetailModalProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['author-stats', author.id],
    queryFn: () => authorsController.getStats(author.id),
  });

  const defaultStats = {
    totalBooks: 0,
    publishedWorks: 0,
    yearsActive: author.birthYear ? new Date().getFullYear() - author.birthYear - 20 : 0
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative glass rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-4">
              <UserIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {author.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {author.nationality || 'Unknown nationality'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-lg p-4 text-center">
            <BookOpenIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading ? '...' : displayStats.totalBooks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Books
            </div>
          </div>
          
          <div className="glass rounded-lg p-4 text-center">
            <GlobeAltIcon className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading ? '...' : displayStats.publishedWorks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Published Works
            </div>
          </div>
          
          <div className="glass rounded-lg p-4 text-center">
            <CalendarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading ? '...' : displayStats.yearsActive}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Years Active
            </div>
          </div>

        </div>

        {/* Biography */}
        <div className="glass rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Biography
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {author.bio || 'No biography available for this author.'}
          </p>
        </div>

        {/* Details */}
        <div className="glass rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Birth Year:</span>
              <span className="text-gray-900 dark:text-white">
                {author.birthYear || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                author.isContributor 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {author.isContributor ? 'Contributor' : 'Author'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Added:</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(author.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}