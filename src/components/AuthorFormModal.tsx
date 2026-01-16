'use client';

import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Author, CreateAuthorData } from '@/controllers/authorsController';

interface AuthorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAuthorData) => void;
  editingAuthor: Author | null;
  formData: {
    name: string;
    bio: string;
    nationality: string;
    birthYear: string;
  };
  setFormData: (data: any) => void;
  isLoading?: boolean;
}

export function AuthorFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingAuthor,
  formData,
  setFormData,
  isLoading = false
}: AuthorFormModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateAuthorData = {
      ...formData,
      birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
    };
    onSubmit(payload);
  };

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
        <div className="flex items-center justify-between mb-6 p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">
            {editingAuthor ? 'Edit Author' : 'Add New Author'}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Enter author name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Nationality
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Enter nationality"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Birth Year
            </label>
            <input
              type="number"
              value={formData.birthYear}
              onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Enter birth year"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Biography
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              placeholder="Enter author biography..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              {isLoading ? 'Saving...' : (editingAuthor ? 'Update Author' : 'Create Author')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-muted text-foreground px-6 py-2 rounded-lg font-medium hover:bg-muted/80 flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}