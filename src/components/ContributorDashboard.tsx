'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { contentApi } from '@/lib/api';

interface Content {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'verified' | 'rejected';
  category: string;
  language: string;
  ageGroup: string;
  createdAt: string;
  author: {
    name: string;
  };
}

export function ContributorDashboard() {
  const [myContent, setMyContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchMyContent();
  }, []);

  const fetchMyContent = async () => {
    try {
      const response = await contentApi.getMyContent();
      setMyContent(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      // Mock data for demo
      setMyContent([
        {
          id: '1',
          title: 'The Wise Tortoise',
          description: 'A traditional African folktale about wisdom and patience',
          status: 'verified',
          category: 'folktales',
          language: 'English',
          ageGroup: '5-8',
          createdAt: '2024-10-10T10:00:00Z',
          author: { name: 'Traditional' },
        },
        {
          id: '2',
          title: 'Anansi and the Wisdom Pot',
          description: 'A story about sharing knowledge',
          status: 'pending',
          category: 'folktales',
          language: 'English',
          ageGroup: '9-12',
          createdAt: '2024-10-12T14:00:00Z',
          author: { name: 'West African Traditional' },
        },
        {
          id: '3',
          title: 'The Lion and the Hare',
          description: 'A tale of cleverness over strength',
          status: 'rejected',
          category: 'folktales',
          language: 'Swahili',
          ageGroup: '5-8',
          createdAt: '2024-10-08T09:00:00Z',
          author: { name: 'East African Traditional' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContent = myContent.filter(content => {
    if (activeTab === 'all') return true;
    return content.status === activeTab;
  });

  const stats = {
    total: myContent.length,
    verified: myContent.filter(c => c.status === 'verified').length,
    pending: myContent.filter(c => c.status === 'pending').length,
    rejected: myContent.filter(c => c.status === 'rejected').length,
  };

  if (loading) {
    return <div className="text-center py-8">Loading your content...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Content</h1>
          <p className="text-gray-600">Manage your contributed educational content</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Content
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Content</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Edit className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Needs Revision</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Content', count: stats.total },
              { key: 'verified', label: 'Published', count: stats.verified },
              { key: 'pending', label: 'Under Review', count: stats.pending },
              { key: 'rejected', label: 'Needs Revision', count: stats.rejected },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Content List */}
        <div className="p-6">
          {filteredContent.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Edit className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No content found for this filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((content) => (
                <div key={content.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(content.status)}
                        <h3 className="font-semibold text-lg">{content.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                          {content.status}
                        </span>
                      </div>
                      
                      {content.description && (
                        <p className="text-gray-600 mb-3">{content.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Author: {content.author.name}</span>
                        <span>Category: {content.category}</span>
                        <span>Language: {content.language}</span>
                        <span>Age: {content.ageGroup}</span>
                        <span>Created: {new Date(content.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}