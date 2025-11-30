'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { categoriesController } from '@/controllers/categoriesController';
import { authorsController } from '@/controllers/authorsController';
import { SearchableMultiSelect } from './SearchableMultiSelect';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function AddContentForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    htmlContent: '',
    authorId: [] as string[],
    language: 'English',
    originalLanguage: 'English',
    categoryId: [] as string[],
    targetCountries: [''],
    ageGroupId: '',
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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/content/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast('success', 'Content Submitted', 'Your content has been submitted for review');
        router.push('/content');
      } else {
        const error = await response.json();
        showToast('error', 'Submission Failed', error.message || 'Failed to submit content');
      }
    } catch (error) {
      showToast('error', 'Submission Failed', 'Failed to submit content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">
          Add New Content
        </h1>
        <p className="text-gray-600 mt-1">
          Create and submit new educational content for review.
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
          <h2 className="text-xl font-semibold text-black mb-6">Content Editor</h2>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Content *
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MDEditor
                value={formData.htmlContent}
                onChange={(val) => setFormData({ ...formData, htmlContent: val || '' })}
                preview="edit"
                hideToolbar={false}
                visibleDragBar={false}
                height={400}
                data-color-mode="light"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use the toolbar above to format your content. Switch to "Preview" tab to see how it looks, or "Source" to view raw HTML.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/content')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Content'}
          </button>
        </div>
      </form>
    </div>
  );
}