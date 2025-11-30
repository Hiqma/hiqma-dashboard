'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AcademicCapIcon, GlobeAltIcon, UserGroupIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { ContributorApplicationForm } from './ContributorApplicationForm';

export function LandingPage() {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f7' }}>
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/assets/logo.png" alt="Hiqma Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-black">Hiqma</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Login
            </Link>
            <button
              onClick={() => setShowApplicationForm(true)}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
            >
              Join as Contributor
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-black mb-6">
            Learning Built by Communities,
            <br />For Communities
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            HIQMA is an open-source platform where African educators, medical practitioners, and local experts 
            collaborate to create, curate, and share culturally relevant educational content—accessible offline, 
            powered by AI, owned by the community.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <GlobeAltIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">
                Decentralized Learning
              </h3>
              <p className="text-gray-600 text-sm">
                Edge hub servers for offline content distribution in remote areas
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <BookOpenIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">
                Local Content
              </h3>
              <p className="text-gray-600 text-sm">
                Culturally relevant educational materials created by local contributors
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <UserGroupIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">
                Community Owned
              </h3>
              <p className="text-gray-600 text-sm">
                Local educators and experts create, review, and curate content together
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <AcademicCapIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">
                AI-Gamified
              </h3>
              <p className="text-gray-600 text-sm">
                Engaging learning experiences with AI assistance and gamification
              </p>
            </div>
          </div>

          {/* Mobile App Showcase */}
          <div className="bg-white rounded-2xl p-12 mb-16 shadow-lg">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-bold text-black mb-6">
                  Engaging Learning Experience
                </h3>
                <p className="text-gray-600 mb-6">
                  Our mobile app brings learning to life with a colorful, child-friendly interface 
                  designed for tablets and iPads. Perfect for classrooms and home learning.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-black">Gamified Progress Tracking</span>
                      <p className="text-gray-600 text-sm">Stories completed, day streaks, and badges to motivate learners</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-black">Age-Appropriate Content</span>
                      <p className="text-gray-600 text-sm">Curated stories and lessons for different age groups (5-8, 6-9 years, etc.)</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-black">Offline Sync</span>
                      <p className="text-gray-600 text-sm">Download content from Edge Hubs and learn without internet</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-black">Multi-Subject Categories</span>
                      <p className="text-gray-600 text-sm">Stories, Science, Numbers, Poetry, History, and more</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <img 
                  src="/assets/mobile-app.png" 
                  alt="Hiqma Learning App on Tablet" 
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* How It Works - Community Focus */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-12 mb-16">
            <h3 className="text-3xl font-bold text-black mb-8 text-center">
              How Our Community Works
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  1
                </div>
                <h4 className="font-semibold text-black mb-2">Create & Contribute</h4>
                <p className="text-gray-600 text-sm">
                  Local educators and experts submit culturally relevant content in their native languages
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  2
                </div>
                <h4 className="font-semibold text-black mb-2">Review Together</h4>
                <p className="text-gray-600 text-sm">
                  Community moderators verify quality and cultural appropriateness collaboratively
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  3
                </div>
                <h4 className="font-semibold text-black mb-2">Share Offline</h4>
                <p className="text-gray-600 text-sm">
                  Content syncs to local Edge Hubs, accessible to students and practitioners without internet
                </p>
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">100%</div>
              <div className="text-gray-600">Open Source</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">Offline</div>
              <div className="text-gray-600">First Design</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">Community</div>
              <div className="text-gray-600">Governed</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto shadow-sm">
            <h3 className="text-2xl font-bold text-black mb-4">
              Join the Movement
            </h3>
            <p className="text-gray-600 mb-6">
              Whether you're an educator, medical practitioner, or community leader—your knowledge matters. 
              Help us build a learning platform that truly serves African communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowApplicationForm(true)}
                className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
              >
                Become a Contributor
              </button>
              <Link
                href="/login"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <ContributorApplicationForm 
        isOpen={showApplicationForm} 
        onClose={() => setShowApplicationForm(false)} 
      />

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            © 2025 African Edge-Learning Hub. Open source for educational impact.
          </p>
        </div>
      </footer>
    </div>
  );
}