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
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card shadow-xl overflow-y-auto border-l border-border"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6 p-6 border-b border-border">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mr-4">
              <UserIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {author.name}
              </h2>
              <p className="text-muted-foreground">
                {author.nationality || 'Unknown nationality'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 px-6">
          <div className="bg-muted/50 rounded-lg p-4 text-center border border-border">
            <BookOpenIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? '...' : displayStats.totalBooks}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Books
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 text-center border border-border">
            <GlobeAltIcon className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? '...' : displayStats.publishedWorks}
            </div>
            <div className="text-sm text-muted-foreground">
              Published Works
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 text-center border border-border">
            <CalendarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? '...' : displayStats.yearsActive}
            </div>
            <div className="text-sm text-muted-foreground">
              Years Active
            </div>
          </div>

        </div>

        {/* Biography */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 mx-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Biography
          </h3>
          <p className="text-foreground leading-relaxed">
            {author.bio || 'No biography available for this author.'}
          </p>
        </div>

        {/* Details */}
        <div className="bg-muted/50 rounded-lg p-4 mx-6 mb-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Birth Year:</span>
              <span className="text-foreground">
                {author.birthYear || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                author.isContributor 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {author.isContributor ? 'Contributor' : 'Author'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Added:</span>
              <span className="text-foreground">
                {new Date(author.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}