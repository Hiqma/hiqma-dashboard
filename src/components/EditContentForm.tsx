'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { categoriesController } from '@/controllers/categoriesController';
import { authorsController } from '@/controllers/authorsController';
import { contentController } from '@/controllers/contentController';
import { SearchableMultiSelect } from './SearchableMultiSelect';
import { TipTapEditor } from './TipTapEditor';
import { CoverImageUpload } from './CoverImageUpload';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface EditContentFormProps {
  contentId: string;
  onClose?: () => void;
}

export function EditContentForm({ contentId, onClose }: EditContentFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    htmlContent: '',
    coverImageUrl: '',
    authorId: [] as string[],
    language: 'English',
    originalLanguage: 'English',
    categoryId: [] as string[],
    targetCountries: [''],
    ageGroupId: '',
  });

  // Fetch content details
  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => contentController.getById(contentId),
    enabled: !!contentId,
  });

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoriesController.search({ search: '', page: 1, limit: 100 })
  });

  // Fetch authors from API
  const { data: authorsData } = useQuery({
    queryKey: ['authors-all'],
    queryFn: () => authorsController.search({ search: '', page: 1, limit: 100 })
  });

  // Fetch age groups from API
  const { data: ageGroups } = useQuery({
    queryKey: ['age-groups'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/age-groups`);
      return response.json();
    }
  });

  const categories = categoriesData?.data || [];
  const authors = authorsData?.data || [];

  // Populate form when content data is loaded
  useEffect(() => {
    if (contentData) {
      setFormData({
        title: contentData.title || '',
        description: contentData.description || '',
        htmlContent: contentData.htmlContent || '',
        coverImageUrl: contentData.coverImageUrl || '',
        authorId: contentData.authorId || [],
        language: contentData.language || 'English',
        originalLanguage: contentData.originalLanguage || 'English',
        categoryId: contentData.categoryId || [],
        targetCountries: Array.isArray(contentData.targetCountries) 
          ? contentData.targetCountries 
          : JSON.parse(contentData.targetCountries || '[""]'),
        ageGroupId: contentData.ageGroupId || '',
      });
    }
  }, [contentData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast('success', 'Content Updated', 'Content has been successfully updated');
        if (onClose) {
          onClose();
        } else {
          router.push('/content');
        }
      } else {
        const error = await response.json();
        showToast('error', 'Update Failed', error.message || 'Failed to update content');
      }
    } catch (error) {
      showToast('error', 'Update Failed', 'Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">
          Edit Content
        </h1>
        <p className="text-gray-600 mt-1">
          Update content details and formatting.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-black mb-6">Content Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter content title"
              />
            </div>

            <div>
              <SearchableMultiSelect
                label="Categories *"
                options={categories.map((category: any) => ({ id: category.id, name: category.name }))}
                selectedValues={formData.categoryId}
                onChange={(values) => setFormData({ ...formData, categoryId: values })}
                placeholder="Search and select categories..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Language *
              </label>
              <select
                required
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="English">English</option>
                <option value="Swahili">Swahili</option>
                <option value="French">French</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Age Group *
              </label>
              <select
                required
                value={formData.ageGroupId}
                onChange={(e) => setFormData({ ...formData, ageGroupId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select age group</option>
                {ageGroups?.map((ageGroup: any) => (
                  <option key={ageGroup.id} value={ageGroup.id}>
                    {ageGroup.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <SearchableMultiSelect
                label="Authors *"
                options={authors.map((author: any) => ({ id: author.id, name: author.name }))}
                selectedValues={formData.authorId}
                onChange={(values) => setFormData({ ...formData, authorId: values })}
                placeholder="Search and select authors..."
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-black mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the content"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-black mb-6">Cover Image</h2>
          <CoverImageUpload
            currentImageUrl={formData.coverImageUrl}
            onImageChange={(imageUrl) => setFormData({ ...formData, coverImageUrl: imageUrl || '' })}
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-black mb-6">Content Editor</h2>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Content *
            </label>
            <TipTapEditor
              content={formData.htmlContent}
              onChange={(content) => setFormData({ ...formData, htmlContent: content })}
              placeholder="Start writing your content..."
              className="min-h-[400px]"
            />
            <p className="text-xs text-gray-500 mt-2">
              Use the toolbar above to format your content. You can add images inline by clicking the image button.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose || (() => router.push('/content'))}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Updating...' : 'Update Content'}
          </button>
        </div>
      </form>
    </div>
  );
}