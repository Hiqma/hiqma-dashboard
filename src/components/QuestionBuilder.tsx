'use client';

import { useState } from 'react';
import { Plus, Trash2, HelpCircle, Clock } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'matching';
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
  correctAnswer?: string | string[];
  hints?: string[];
  explanation?: string;
  points: number;
  timeLimit?: number;
}

interface QuestionBuilderProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      type,
      difficulty: 'easy',
      points: 10,
      timeLimit: 60,
    };

    if (type === 'multiple_choice') {
      newQuestion.options = ['', '', '', ''];
      newQuestion.correctAnswer = '';
    } else if (type === 'true_false') {
      newQuestion.options = ['True', 'False'];
      newQuestion.correctAnswer = '';
    } else if (type === 'matching') {
      newQuestion.options = ['', '', '', ''];
      newQuestion.correctAnswer = [];
    }

    onChange([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '🔘' },
    { value: 'true_false', label: 'True/False', icon: '✓✗' },
    { value: 'fill_blank', label: 'Fill in the Blank', icon: '___' },
    { value: 'short_answer', label: 'Short Answer', icon: '📝' },
    { value: 'matching', label: 'Matching', icon: '🔗' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Comprehension Questions</h3>
        <div className="flex gap-2">
          {questionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => addQuestion(type.value as Question['type'])}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center gap-1"
              title={`Add ${type.label}`}
            >
              <span>{type.icon}</span>
              <Plus className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>

      {questions.map((question, index) => (
        <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium">Question {index + 1}</h4>
            <button
              onClick={() => removeQuestion(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Question Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Question *</label>
            <textarea
              value={question.question}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              className="w-full p-2 border rounded-md h-20"
              placeholder="Enter your question here..."
            />
          </div>

          {/* Question Settings */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={question.type}
                onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={question.difficulty}
                onChange={(e) => updateQuestion(index, 'difficulty', e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Points</label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md text-sm"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Time (sec)
              </label>
              <input
                type="number"
                value={question.timeLimit || 60}
                onChange={(e) => updateQuestion(index, 'timeLimit', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md text-sm"
                min="10"
                max="300"
              />
            </div>
          </div>

          {/* Question-specific inputs */}
          {question.type === 'multiple_choice' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Options</label>
              <div className="space-y-2">
                {question.options?.map((option, optIndex) => (
                  <div key={optIndex} className="flex gap-2">
                    <input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])];
                        newOptions[optIndex] = e.target.value;
                        updateQuestion(index, 'options', newOptions);
                      }}
                      className="flex-1 p-2 border rounded-md"
                      placeholder={`Option ${optIndex + 1}`}
                    />
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctAnswer === option}
                        onChange={() => updateQuestion(index, 'correctAnswer', option)}
                        className="mr-1"
                      />
                      <span className="text-sm text-green-600">Correct</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.type === 'true_false' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Correct Answer</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`tf-${question.id}`}
                    checked={question.correctAnswer === 'True'}
                    onChange={() => updateQuestion(index, 'correctAnswer', 'True')}
                    className="mr-2"
                  />
                  True
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`tf-${question.id}`}
                    checked={question.correctAnswer === 'False'}
                    onChange={() => updateQuestion(index, 'correctAnswer', 'False')}
                    className="mr-2"
                  />
                  False
                </label>
              </div>
            </div>
          )}

          {question.type === 'fill_blank' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Correct Answer</label>
              <input
                value={question.correctAnswer as string || ''}
                onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter the correct answer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use underscores (___) in your question to indicate where the blank should be
              </p>
            </div>
          )}

          {question.type === 'short_answer' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Sample Answer</label>
              <textarea
                value={question.correctAnswer as string || ''}
                onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                className="w-full p-2 border rounded-md h-16"
                placeholder="Provide a sample correct answer for reference"
              />
            </div>
          )}

          {/* Hints and Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Hint (optional)
              </label>
              <input
                value={question.hints?.[0] || ''}
                onChange={(e) => updateQuestion(index, 'hints', [e.target.value])}
                className="w-full p-2 border rounded-md"
                placeholder="Provide a helpful hint"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Explanation (optional)</label>
              <input
                value={question.explanation || ''}
                onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Explain why this is the correct answer"
              />
            </div>
          </div>
        </div>
      ))}

      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="mb-4">No questions added yet</p>
          <p className="text-sm">Click the buttons above to add different types of questions</p>
        </div>
      )}
    </div>
  );
}