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
        className="relative bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-black">
            {editingAuthor ? 'Edit Author' : 'Add New Author'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter author name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Nationality
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter nationality"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Birth Year
            </label>
            <input
              type="number"
              value={formData.birthYear}
              onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter birth year"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Biography
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter author biography..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              {isLoading ? 'Saving...' : (editingAuthor ? 'Update Author' : 'Create Author')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}