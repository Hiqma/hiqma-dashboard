'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { categoriesController } from '@/controllers/categoriesController';
import { authorsController } from '@/controllers/authorsController';
import { SearchableMultiSelect } from './SearchableMultiSelect';
import { AIContentHelper } from './AIContentHelper';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { TipTapEditor } from './TipTapEditor';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ComprehensionQuestion {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_blank';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface MultiStepContentFormProps {
  contentId?: string;
  isEdit?: boolean;
}

export function MultiStepContentForm({ contentId, isEdit = false }: MultiStepContentFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  
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
    comprehensionQuestions: [] as ComprehensionQuestion[],
    coverImageUrl: '',
  });
  
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);

  // Fetch data
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoriesController.search({ search: '', page: 1, limit: 100 })
  });

  const { data: authorsData } = useQuery({
    queryKey: ['authors-all'],
    queryFn: () => authorsController.search({ search: '', page: 1, limit: 100 })
  });

  const { data: ageGroups } = useQuery({
    queryKey: ['age-groups'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/age-groups`);
      return response.json();
    }
  });

  // Fetch existing content for editing
  const { data: existingContent } = useQuery({
    queryKey: ['content', contentId],
    queryFn: async () => {
      if (!contentId) return null;
      const response = await fetch(`${API_BASE}/content/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      return response.json();
    },
    enabled: !!contentId && isEdit,
  });

  // Update form data when existing content is loaded
  useEffect(() => {
    if (existingContent && isEdit) {
      console.log('Existing content:', existingContent);
      console.log('Comprehension questions raw:', existingContent.comprehensionQuestions);
      
      const processedQuestions = (() => {
        if (!existingContent.comprehensionQuestions) return [];
        try {
          let parsed = existingContent.comprehensionQuestions;
          // Handle double-encoded JSON strings
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
            // If still a string, parse again (double-encoded)
            if (typeof parsed === 'string') {
              parsed = JSON.parse(parsed);
            }
          }
          console.log('Parsed questions:', parsed);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error('Error parsing questions:', e);
          return [];
        }
      })();
      
      console.log('Final processed questions:', processedQuestions);
      
      setFormData({
        title: existingContent.title || '',
        description: existingContent.description || '',
        htmlContent: existingContent.htmlContent || '',
        authorId: existingContent.authorId || [],
        language: existingContent.language || 'English',
        originalLanguage: existingContent.originalLanguage || 'English',
        categoryId: existingContent.categoryId || [],
        targetCountries: existingContent.targetCountries ? JSON.parse(existingContent.targetCountries) : [''],
        ageGroupId: existingContent.ageGroupId || '',
        comprehensionQuestions: processedQuestions,
        coverImageUrl: existingContent.coverImageUrl || '',
      });
      
      if (existingContent.coverImageUrl) {
        setCoverImagePreview(existingContent.coverImageUrl);
      }
      setInitialLoading(false);
    }
  }, [existingContent, isEdit]);

  const categories = categoriesData?.data || [];
  const authors = authorsData?.data || [];

  const steps = [
    { id: 1, name: 'Metadata', description: isEdit ? 'Update information' : 'Basic information' },
    { id: 2, name: 'Content', description: isEdit ? 'Edit your content' : 'Write your content' },
    { id: 3, name: 'Questions', description: isEdit ? 'Update questions' : 'Add comprehension questions' }
  ];

  const addQuestion = () => {
    const newQuestion: ComprehensionQuestion = {
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      difficulty: 'medium',
      points: 1
    };
    setFormData({
      ...formData,
      comprehensionQuestions: [...formData.comprehensionQuestions, newQuestion]
    });
  };

  const updateQuestion = (index: number, field: keyof ComprehensionQuestion, value: any) => {
    const updatedQuestions = [...formData.comprehensionQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData({ ...formData, comprehensionQuestions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = formData.comprehensionQuestions.filter((_, i) => i !== index);
    setFormData({ ...formData, comprehensionQuestions: updatedQuestions });
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid File', 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Please select an image smaller than 5MB');
      return;
    }

    setCoverImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    await uploadCoverImage(file);
  };

  const uploadCoverImage = async (file: File) => {
    setUploadingCoverImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, coverImageUrl: result.url }));
        showToast('success', 'Image Uploaded', 'Cover image uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      showToast('error', 'Upload Failed', 'Failed to upload cover image');
      setCoverImageFile(null);
      setCoverImagePreview('');
    } finally {
      setUploadingCoverImage(false);
    }
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview('');
    setFormData(prev => ({ ...prev, coverImageUrl: '' }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return !!(formData.title && formData.categoryId.length > 0 && formData.language && formData.ageGroupId && formData.authorId.length > 0);
    }
    if (step === 2) {
      return !!formData.htmlContent;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        comprehensionQuestions: formData.comprehensionQuestions.length > 0 
          ? formData.comprehensionQuestions 
          : undefined
      };

      const url = isEdit ? `${API_BASE}/content/${contentId}` : `${API_BASE}/content/submit`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const message = isEdit ? 'Your changes have been saved successfully!' : 'Your content has been submitted for review';
        showToast('success', isEdit ? 'Changes Saved' : 'Content Submitted', message);
        router.push('/content');
      } else {
        const error = await response.json();
        showToast('error', 'Operation Failed', error.message || 'Failed to save content');
      }
    } catch (error) {
      showToast('error', 'Operation Failed', 'Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const renderBreadcrumbs = () => (
    <nav className="mb-8">
      <ol className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            <div className={`flex items-center ${index < steps.length - 1 ? 'pr-4' : ''}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step.id === currentStep 
                  ? 'bg-black text-white' 
                  : step.id < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id < currentStep ? '✓' : step.id}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${step.id === currentStep ? 'text-black' : 'text-gray-500'}`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="h-px w-8 bg-gray-300 ml-4" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );

  const renderStep1 = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-black mb-6">{isEdit ? 'Update Metadata' : 'Content Metadata'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">Title *</label>
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
          <label className="block text-sm font-medium text-black mb-2">Language *</label>
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
          <label className="block text-sm font-medium text-black mb-2">Age Group *</label>
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

        <div className="md:col-span-2">
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
        <label className="block text-sm font-medium text-black mb-2">Description</label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief description of the content"
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-black mb-2">Cover Image</label>
        <div className="flex justify-center">
          <div className="w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 shadow-lg relative" style={{ aspectRatio: '3/4' }}>
            {coverImagePreview ? (
              <>
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md z-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <label htmlFor="cover-image" className="absolute inset-0 cursor-pointer bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <span className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-gray-800 opacity-0 hover:opacity-100 transition-opacity">
                    Change Image
                  </span>
                </label>
                <input
                  id="cover-image"
                  name="cover-image"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  disabled={uploadingCoverImage}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <svg className="w-12 h-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <label htmlFor="cover-image" className="cursor-pointer">
                  <span className="block text-sm font-medium text-gray-900 mb-1">
                    {uploadingCoverImage ? 'Uploading...' : 'Upload Cover'}
                  </span>
                  <span className="block text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </span>
                </label>
                <input
                  id="cover-image"
                  name="cover-image"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  disabled={uploadingCoverImage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    // Calculate approximate page count (assuming ~500 words per page)
    const wordCount = formData.htmlContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
    const pageCount = Math.max(1, Math.ceil(wordCount / 500));
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">{isEdit ? 'Update Your Content!' : 'Confidently Write!'}</h2>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {wordCount} words • ~{pageCount} page{pageCount !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor - Takes 3 columns */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
            <TipTapEditor
              key={contentId || 'new'}
              content={formData.htmlContent}
              onChange={(html) => {
                setFormData({ ...formData, htmlContent: html });
              }}
              placeholder="Start writing your content..."
              className="min-h-[500px]"
            />
          </div>
          
          {/* AI Helper - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-semibold text-black">AI Writing Assistant</h3>
              </div>
              <AIContentHelper 
                content={formData.htmlContent}
                title={formData.title}
                step={2}
                onApplySuggestion={(suggestion) => {
                  console.log('Suggestion:', suggestion);
                }}
                onInsertContent={(newContent) => {
                  const combined = formData.htmlContent + '\n\n' + newContent;
                  setFormData({ ...formData, htmlContent: combined });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">{isEdit ? 'Update Questions' : 'Comprehension Questions'}</h2>
        <button
          type="button"
          onClick={addQuestion}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add Question
        </button>
      </div>

      {(!Array.isArray(formData.comprehensionQuestions) || formData.comprehensionQuestions.length === 0) ? (
        <div className="text-center py-8 text-gray-500">
          <p>No questions added yet. Questions are optional but help assess learning.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(formData.comprehensionQuestions) && formData.comprehensionQuestions.map((question, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-black">Question {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">Question *</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                    placeholder="Enter your question"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Type</label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="fill_blank">Fill in the Blank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Difficulty</label>
                  <select
                    value={question.difficulty}
                    onChange={(e) => updateQuestion(index, 'difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {question.type === 'multiple_choice' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">Options</label>
                    {question.options?.map((option, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[optIndex] = e.target.value;
                          updateQuestion(index, 'options', newOptions);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black mb-2"
                        placeholder={`Option ${optIndex + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Correct Answer</label>
                  {question.type === 'multiple_choice' ? (
                    <select
                      value={question.correctAnswer as string}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                    >
                      <option value="">Select correct option</option>
                      {question.options?.map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option || `Option ${optIndex + 1}`}
                        </option>
                      ))}
                    </select>
                  ) : question.type === 'true_false' ? (
                    <select
                      value={question.correctAnswer as string}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                    >
                      <option value="">Select answer</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={question.correctAnswer as string}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                      placeholder="Enter correct answer"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Points</label>
                  <input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">Explanation (Optional)</label>
                  <textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black"
                    placeholder="Explain why this is the correct answer"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      
      {/* AI Helper for Questions */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm p-4">
          {/* <h3 className="text-sm font-semibold text-black mb-4">AI Writing Assistant</h3> */}
          <AIContentHelper 
          content={formData.htmlContent}
          title={formData.title}
          step={3}
          onGenerateQuestions={(questionsText) => {
            console.log('Generated questions:', questionsText);
            // Parse and add questions - simplified for now
            alert('Questions generated! You can manually add them below.');
          }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-6">
      {initialLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading content...</div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            {isEdit && (
              <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">Editing Mode</span>
                </div>
              </div>
            )}
            <h1 className="text-3xl font-bold text-black">
              {isEdit ? 'Update Content' : 'Add New Content'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Make changes to your educational content and save updates.' : 'Create and submit new educational content for review.'}
            </p>
          </div>

          {renderBreadcrumbs()}

          <div className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/content')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isEdit ? 'Discard Changes' : 'Cancel'}
              </button>
              
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isEdit ? 'Continue' : 'Next'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !validateStep(1) || !validateStep(2)}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (isEdit ? 'Saving Changes...' : 'Submitting...') : (isEdit ? 'Save Changes' : 'Submit Content')}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}