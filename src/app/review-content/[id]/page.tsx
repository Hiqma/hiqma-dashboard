'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { MobileBookPreview } from '@/components/MobileBookPreview';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ReviewContentPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', params.id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/content/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      return response.json();
    }
  });

  const handleStatusUpdate = async (status: 'verified' | 'rejected', reason?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/content/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ status, reason }),
      });

      if (response.ok) {
        showToast('success', 'Status Updated', `Content ${status} successfully`);
        router.push('/content');
      } else {
        const error = await response.json();
        showToast('error', 'Update Failed', error.message || 'Failed to update status');
      }
    } catch (error) {
      showToast('error', 'Update Failed', 'Failed to update status');
    } finally {
      setLoading(false);
      setShowRejectModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-16 bg-[#f5f5f7] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">Loading content...</div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="pt-16 bg-[#f5f5f7] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">Content not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-[#f5f5f7] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            {content.status === 'verified' ? 'View Content' : 'Review Content'}
          </h1>
          <p className="text-gray-600 mt-1">
            {content.status === 'verified' 
              ? 'View approved content details.' 
              : content.status === 'rejected'
              ? 'View rejected content details.'
              : 'Review and approve or reject submitted content.'}
          </p>
          {content.status === 'verified' && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✓ Approved
            </div>
          )}
          {content.status === 'rejected' && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              ✗ Rejected
              {content.rejectionReason && (
                <span className="ml-2 text-xs">- {content.rejectionReason}</span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-4">Content Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cover Image */}
              {content.coverImageUrl && (
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-black mb-2">Cover Image</label>
                  <div className="w-48 h-64 mx-auto lg:mx-0 rounded-lg overflow-hidden shadow-lg" style={{ aspectRatio: '3/4' }}>
                    <img
                      src={content.coverImageUrl}
                      alt={`Cover for ${content.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              {/* Content Details */}
              <div className={`${content.coverImageUrl ? 'lg:col-span-2' : 'lg:col-span-3'} grid grid-cols-1 md:grid-cols-2 gap-4`}>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Title</label>
                  <p className="text-gray-800">{content.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Language</label>
                  <p className="text-gray-800">{content.language}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Age Group</label>
                  <p className="text-gray-800">{content.ageGroup?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Contributor</label>
                  <p className="text-gray-800">{content.contributor?.name}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">Description</label>
                  <p className="text-gray-800">{content.description || 'No description provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tablet Preview */}
          <MobileBookPreview content={content} />

          {(() => {
            try {
              let questions = [];
              if (content.comprehensionQuestions) {
                let parsed = JSON.parse(content.comprehensionQuestions);
                if (typeof parsed === 'string') {
                  parsed = JSON.parse(parsed);
                }
                questions = Array.isArray(parsed) ? parsed : [];
              }
              
              if (questions.length === 0) {
                return null;
              }
              
              return (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-black mb-4">Comprehension Questions</h2>
                  <div className="space-y-4">
                    {questions.map((question: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-black mb-2">Question {index + 1}</h3>
                        <p className="text-gray-800 mb-2">{question.question}</p>
                        <div className="text-sm text-gray-600">
                          <p><strong>Type:</strong> {question.type}</p>
                          <p><strong>Difficulty:</strong> {question.difficulty}</p>
                          <p><strong>Points:</strong> {question.points}</p>
                          {question.options && question.options.filter(Boolean).length > 0 && (
                            <p><strong>Options:</strong> {question.options.filter(Boolean).join(', ')}</p>
                          )}
                          <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                          {question.explanation && (
                            <p><strong>Explanation:</strong> {question.explanation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } catch (error) {
              return null;
            }
          })()}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/content')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Content
            </button>
            {content.status === 'pending' && (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('verified')}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Approving...' : 'Approve'}
                </button>
              </>
            )}
          </div>
        </div>

        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-black mb-4">Reject Content</h3>
              <p className="text-gray-600 mb-4">Please provide a reason for rejecting this content:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="Enter rejection reason..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('rejected', rejectionReason)}
                  disabled={!rejectionReason.trim() || loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}