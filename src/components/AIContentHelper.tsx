'use client';

import { useState } from 'react';
import { LightBulbIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface AIContentHelperProps {
  content: string;
  title?: string;
  step?: number;
  onApplySuggestion?: (suggestion: string) => void;
  onInsertContent?: (content: string) => void;
  onGenerateQuestions?: (questions: string) => void;
}

export function AIContentHelper({ content, title, step = 2, onApplySuggestion, onInsertContent, onGenerateQuestions }: AIContentHelperProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string>('');
  const [error, setError] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCulturalModal, setShowCulturalModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Swahili');
  const [culturalLocation, setCulturalLocation] = useState('');

  const handleAIAction = async (action: string, extraParams?: any) => {
    setLoading(true);
    setError('');
    setActiveAction(action);
    setSuggestions([]);
    setGeneratedContent('');
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, action, ...extraParams }),
      });
      
      if (!response.ok) throw new Error('Failed to generate content');
      
      const data = await response.json();
      
      if (action === 'suggestions' || action === 'cultural') {
        setSuggestions(data.result || []);
      } else if (action === 'questions' && onGenerateQuestions) {
        onGenerateQuestions(data.result || '');
        setGeneratedContent('Questions generated! Check below.');
      } else {
        setGeneratedContent(data.result || '');
      }
    } catch (err) {
      setError('Unable to process AI request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* <h3 className="text-lg font-semibold text-black">AI Writing Assistant</h3> */}
        </div>
        <div className="flex flex-col gap-2">
          {step === 2 && (
            <>
              <button
                onClick={() => handleAIAction('suggestions')}
                disabled={loading || !content}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
              >
                <LightBulbIcon className="h-4 w-4" />
                Get Suggestions
              </button>
              <button
                onClick={() => handleAIAction('continue')}
                disabled={loading || !content}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                ✍️ Write Next Page
              </button>
              <button
                onClick={() => setShowLanguageModal(true)}
                disabled={loading || !content}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
              >
                🌍 Translate
              </button>
              <button
                onClick={() => setShowCulturalModal(true)}
                disabled={loading || !content}
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm font-medium"
              >
                🏛️ Add Cultural Context
              </button>
              <button
                onClick={() => handleAIAction('cover')}
                disabled={loading || !title}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                🎨 Cover Image Prompt
              </button>
            </>
          )}
          {step === 3 && (
            <button
              onClick={() => handleAIAction('questions')}
              disabled={loading || !content}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
            >
              ✨ Generate Questions
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-purple-600 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          <span className="text-sm">AI is working...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {generatedContent && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-black">Generated Content:</h4>
            {onInsertContent && (
              <button
                onClick={() => onInsertContent(generatedContent)}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Insert into Editor →
              </button>
            )}
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{generatedContent}</div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-black flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            Suggestions:
          </h4>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">{suggestion}</p>
              {onApplySuggestion && (
                <button
                  onClick={() => onApplySuggestion(suggestion)}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  Apply suggestion →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && suggestions.length === 0 && !generatedContent && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Choose an AI action above to get help with your content
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Translate Content</h3>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            >
              <option value="Swahili">Swahili</option>
              <option value="French">French</option>
              <option value="Arabic">Arabic</option>
              <option value="Amharic">Amharic</option>
              <option value="Hausa">Hausa</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLanguageModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAIAction('translate', { language: selectedLanguage });
                  setShowLanguageModal(false);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Translate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cultural Context Modal */}
      {showCulturalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Cultural Context</h3>
            <p className="text-sm text-gray-600 mb-3">Which region or culture should we reference?</p>
            <input
              type="text"
              value={culturalLocation}
              onChange={(e) => setCulturalLocation(e.target.value)}
              placeholder="e.g., Kenyan, Nigerian, Ethiopian"
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCulturalModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (culturalLocation.trim()) {
                    handleAIAction('cultural', { location: culturalLocation });
                    setShowCulturalModal(false);
                  }
                }}
                disabled={!culturalLocation.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
