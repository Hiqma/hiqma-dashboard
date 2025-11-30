'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { categoriesController } from '@/controllers/categoriesController';
import { authorsController } from '@/controllers/authorsController';
import { SearchableMultiSelect } from './SearchableMultiSelect';
import { AIContentHelper } from './AIContentHelper';

const Editor = dynamic(() => import('@/components/NovelEditor'), {
  ssr: false,
});

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
  });

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
      });
      setInitialLoading(false);
    }
  }, [existingContent, isEdit]);

  const categories = categoriesData?.data || [];
  const authors = authorsData?.data || [];

  const steps = [
    { id: 1, name: 'Metadata', description: 'Basic information' },
    { id: 2, name: 'Content', description: 'Write your content' },
    { id: 3, name: 'Questions', description: 'Add comprehension questions' }
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
        const message = isEdit ? 'Content updated successfully' : 'Your content has been submitted for review';
        showToast('success', isEdit ? 'Content Updated' : 'Content Submitted', message);
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
      <h2 className="text-xl font-semibold text-black mb-6">Content Metadata</h2>
      
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
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold text-black mb-6">Confidently Write!</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <Editor
            key={contentId || 'new'}
            defaultValue={formData.htmlContent}
            onUpdate={(html) => {
              setFormData({ ...formData, htmlContent: html });
            }}
          />
        </div>
        
        {/* AI Helper - Takes 1 column */}
        <div className="lg:col-span-1">
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
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Comprehension Questions</h2>
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
            <h1 className="text-3xl font-bold text-black">
              {isEdit ? 'Edit Content' : 'Add New Content'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Update your educational content.' : 'Create and submit new educational content for review.'}
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
                Cancel
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
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !validateStep(1) || !validateStep(2)}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (isEdit ? 'Updating...' : 'Submitting...') : (isEdit ? 'Update Content' : 'Submit Content')}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}