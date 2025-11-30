'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ApplicationFormData {
  name: string;
  email: string;
  institution: string;
  expertise: string;
  motivation: string;
}

export function ContributorApplication() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ApplicationFormData>();

  const onSubmit = async (data: ApplicationFormData) => {
    setLoading(true);
    try {
      // API call would go here
      console.log('Submitting application:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      reset();
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted!</h2>
          <p className="text-green-700 mb-4">
            Thank you for your interest in becoming a contributor. We'll review your application and get back to you within 5-7 business days.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Contributor</h1>
        <p className="text-gray-600 leading-relaxed">
          Join our community of educators and literature enthusiasts helping to create quality educational content 
          for African children. Share your expertise and help preserve our rich literary heritage.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">What we're looking for:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Educators, writers, or literature enthusiasts</li>
          <li>• Experience with African literature or children's content</li>
          <li>• Commitment to creating quality, culturally relevant material</li>
          <li>• Understanding of age-appropriate content development</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution/Organization *
              </label>
              <input
                {...register('institution', { required: 'Institution is required' })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="University, School, Organization, or 'Independent'"
              />
              {errors.institution && <p className="text-red-500 text-sm mt-1">{errors.institution.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Professional Background</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas of Expertise *
              </label>
              <textarea
                {...register('expertise', { 
                  required: 'Expertise is required',
                  minLength: {
                    value: 50,
                    message: 'Please provide at least 50 characters describing your expertise'
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                placeholder="e.g., African Literature, Children's Education, Swahili Poetry, Educational Content Development..."
              />
              {errors.expertise && <p className="text-red-500 text-sm mt-1">{errors.expertise.message}</p>}
              <p className="text-gray-500 text-sm mt-1">
                Describe your background in literature, education, or content creation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to contribute? *
              </label>
              <textarea
                {...register('motivation', { 
                  required: 'Motivation is required',
                  minLength: {
                    value: 100,
                    message: 'Please provide at least 100 characters explaining your motivation'
                  }
                })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Tell us about your passion for African literature and education, and how you'd like to contribute to this platform..."
              />
              {errors.motivation && <p className="text-red-500 text-sm mt-1">{errors.motivation.message}</p>}
              <p className="text-gray-500 text-sm mt-1">
                Share your vision for contributing to African children's education
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Next Steps</h3>
          <p className="text-gray-600 text-sm">
            After submitting your application, our team will review it within 5-7 business days. 
            If approved, you'll receive login credentials and access to our content creation tools.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}