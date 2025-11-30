'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { contentApi, countriesApi, authorsApi, categoriesApi, ageGroupsApi } from '@/lib/api';
import AdvancedQuestionBuilder from './AdvancedQuestionBuilder';

interface ContentFormData {
  title: string;
  description: string;
  htmlContent: string;
  language: string;
  originalLanguage: string;
  categoryId: string;
  authorId: string;
  targetCountries: string[];
  ageGroupId: string;
  isAuthor?: boolean;
  authorName?: string;
}





export function ContentCreator() {
  const [htmlContent, setHtmlContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ContentFormData>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [authorsRes, countriesRes, categoriesRes, ageGroupsRes] = await Promise.all([
        authorsApi.getAll(),
        countriesApi.getAll(),
        categoriesApi.getAll(),
        ageGroupsApi.getAll(),
      ]);
      
      setAuthors(authorsRes.data.map(a => ({ ...a, value: a.id, label: a.name })));
      setCountries(countriesRes.data.map(c => ({ value: c.code, label: c.name })));
      setCategories(categoriesRes.data.map(c => ({ value: c.id, label: c.name })));
      setAgeGroups(ageGroupsRes.data.map(ag => ({ value: ag.id, label: ag.name })));
      
      // Check if current user is already an author
      const userId = 'current-user-id'; // Should come from auth context
      const userAuthor = authorsRes.data.find(a => a.contributorId === userId);
      if (userAuthor) {
        setIsAuthor(true);
        setValue('authorId', userAuthor.id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const onSubmit = async (data: ContentFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        htmlContent,
        comprehensionQuestions: questions,
        contributorId: 'current-user-id', // Should come from auth context
        isAuthor,
        authorName: data.authorName,
      };
      
      await contentApi.submit(payload);
      alert('Content submitted successfully!');
      
      // Reset form
      setHtmlContent('');
      setQuestions([]);
    } catch (error) {
      console.error('Failed to submit content:', error);
      alert('Failed to submit content');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Create New Content</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Title *</label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter content title"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Category *</label>
              <select {...register('categoryId', { required: 'Category is required' })} className="w-full p-2 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent" style={{ backgroundColor: 'white', color: 'black' }}>
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-black">Description</label>
            <textarea
              {...register('description')}
              className="w-full p-2 border border-gray-300 rounded-md h-20 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the content"
              style={{ backgroundColor: 'white', color: 'black' }}
            />
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">Content</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black">HTML Content *</label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md h-64 font-mono text-sm bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="<h1>Your Story Title</h1><p>Once upon a time...</p>"
              style={{ backgroundColor: 'white', color: 'black' }}
            />
            <p className="text-sm text-gray-500 mt-1">
              Use HTML tags for formatting: &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
            </p>
          </div>

          <div className="border border-gray-300 p-4 rounded-md bg-gray-50">
            <h3 className="font-medium mb-2 text-black">Preview:</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">Metadata</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Author *</label>
              {!isAuthor ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isAuthor"
                      checked={isAuthor}
                      onChange={(e) => setIsAuthor(e.target.checked)}
                    />
                    <label htmlFor="isAuthor" className="text-sm text-black">I am the author</label>
                  </div>
                  {isAuthor ? (
                    <input
                      {...register('authorName', { required: 'Author name is required' })}
                      className="w-full p-2 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name as author"
                      style={{ backgroundColor: 'white', color: 'black' }}
                    />
                  ) : (
                    <select {...register('authorId', { required: 'Author is required' })} className="w-full p-2 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent" style={{ backgroundColor: 'white', color: 'black' }}>
                      <option value="">Select author</option>
                      {authors.map(author => (
                        <option key={author.id} value={author.id}>{author.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="p-2 bg-gray-100 rounded-md text-black">
                  You are set as the author for this content
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Age Group *</label>
                <select {...register('ageGroupId', { required: 'Age group is required' })} className="w-full p-2 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent" style={{ backgroundColor: 'white', color: 'black' }}>
                  <option value="">Select age group</option>
                  {ageGroups.map(group => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Language *</label>
                <input
                  {...register('language', { required: 'Language is required' })}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., English, Swahili"
                  style={{ backgroundColor: 'white', color: 'black' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black">Original Language</label>
              <input
                {...register('originalLanguage')}
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="If translated, original language"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-black">Target Countries *</label>
            <Select
              isMulti
              options={countries}
              onChange={(selected) => setValue('targetCountries', selected?.map(s => s.value) || [])}
              placeholder="Select countries where this content should be available"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: 'white',
                  color: 'black',
                  borderColor: '#d1d5db'
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: 'white',
                  color: 'black'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
                  color: 'black'
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#f3f4f6'
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: 'black'
                })
              }}
            />
          </div>
        </div>

        {/* Comprehension Questions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">Comprehension Questions</h2>
          <AdvancedQuestionBuilder
            questions={questions}
            onChange={setQuestions}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Content'}
          </button>
        </div>
      </form>
    </div>
  );
}