'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, DocumentTextIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
import { contentController } from '@/controllers/contentController';

export function ContributorContentManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: myContent = [], isLoading } = useQuery({
    queryKey: ['my-content'],
    queryFn: contentController.getMyContent,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search your content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
          />
        </div>
        <a
          href="/add-content"
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2 ml-4"
        >
          <PlusIcon className="h-5 w-5" />
          Add Content
        </a>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Cover</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myContent.filter((content: any) => 
                content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                content.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                content.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((content: any) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {content.coverImageUrl ? (
                      <img
                        src={content.coverImageUrl}
                        alt={`Cover for ${content.title}`}
                        className="w-12 h-16 object-cover rounded shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-black">{content.title}</div>
                      {content.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {content.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black">{content.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-black">{content.language}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      content.status === 'verified' ? 'bg-green-100 text-green-800' :
                      content.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {content.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(content.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/review-content/${content.id}`}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        Preview
                      </a>
                      {content.status === 'pending' && (
                        <a
                          href={`/add-content?id=${content.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2"
                        >
                          Edit
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myContent.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No content submitted yet</p>
              <a
                href="/add-content"
                className="mt-2 text-blue-600 hover:underline"
              >
                Submit your first content
              </a>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}