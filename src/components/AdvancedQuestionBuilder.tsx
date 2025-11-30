'use client';

import { useState } from 'react';
import { ComprehensionQuestion } from '../../../shared/src/types';

interface Props {
  questions: ComprehensionQuestion[];
  onChange: (questions: ComprehensionQuestion[]) => void;
}

export default function AdvancedQuestionBuilder({ questions, onChange }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState<Partial<ComprehensionQuestion>>({
    type: 'multiple_choice',
    difficulty: 'easy',
    points: 10,
  });

  const addQuestion = () => {
    if (!currentQuestion.question) return;
    
    const newQuestion: ComprehensionQuestion = {
      id: Date.now().toString(),
      question: currentQuestion.question,
      type: currentQuestion.type!,
      difficulty: currentQuestion.difficulty!,
      options: currentQuestion.options || [],
      correctAnswer: currentQuestion.correctAnswer || '',
      hints: currentQuestion.hints || [],
      explanation: currentQuestion.explanation || '',
      points: currentQuestion.points || 10,
      timeLimit: currentQuestion.timeLimit,
      media: currentQuestion.media,
      feedback: currentQuestion.feedback,
    };

    onChange([...questions, newQuestion]);
    setCurrentQuestion({ type: 'multiple_choice', difficulty: 'easy', points: 10 });
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const renderQuestionTypeFields = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Options</label>
              {(currentQuestion.options || []).map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(currentQuestion.options || [])];
                    newOptions[index] = e.target.value;
                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                  }}
                  className="w-full p-2 border rounded mb-2"
                  placeholder={`Option ${index + 1}`}
                />
              ))}
              <button
                type="button"
                onClick={() => setCurrentQuestion({
                  ...currentQuestion,
                  options: [...(currentQuestion.options || []), '']
                })}
                className="text-blue-600 text-sm"
              >
                + Add Option
              </button>
            </div>
            <input
              type="text"
              value={currentQuestion.correctAnswer as string || ''}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
              placeholder="Correct answer"
              className="w-full p-2 border rounded"
            />
          </div>
        );

      case 'true_false':
        return (
          <select
            value={currentQuestion.correctAnswer as string || ''}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select correct answer</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );

      case 'fill_blank':
        return (
          <input
            type="text"
            value={currentQuestion.correctAnswer as string || ''}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
            placeholder="Correct answer for blank"
            className="w-full p-2 border rounded"
          />
        );

      case 'matching':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Items to Match (format: item1|match1,item2|match2)</label>
              <textarea
                value={Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(',') : ''}
                onChange={(e) => setCurrentQuestion({ 
                  ...currentQuestion, 
                  correctAnswer: e.target.value.split(',') 
                })}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Apple|Fruit,Car|Vehicle"
              />
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={currentQuestion.correctAnswer as string || ''}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
            placeholder="Correct answer"
            className="w-full p-2 border rounded"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Add Question</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <select
            value={currentQuestion.type}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as any })}
            className="p-2 border rounded"
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
            <option value="fill_blank">Fill in the Blank</option>
            <option value="short_answer">Short Answer</option>
            <option value="matching">Matching</option>
            <option value="ordering">Ordering</option>
          </select>

          <select
            value={currentQuestion.difficulty}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value as any })}
            className="p-2 border rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <textarea
          value={currentQuestion.question || ''}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
          placeholder="Enter your question"
          className="w-full p-3 border rounded mb-4"
          rows={3}
        />

        {renderQuestionTypeFields()}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <input
            type="number"
            value={currentQuestion.points || 10}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
            placeholder="Points"
            className="p-2 border rounded"
            min="1"
          />
          <input
            type="number"
            value={currentQuestion.timeLimit || ''}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimit: parseInt(e.target.value) })}
            placeholder="Time limit (seconds)"
            className="p-2 border rounded"
            min="10"
          />
        </div>

        <textarea
          value={currentQuestion.explanation || ''}
          onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
          placeholder="Explanation (optional)"
          className="w-full p-2 border rounded mt-4"
          rows={2}
        />

        <button
          type="button"
          onClick={addQuestion}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Question
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
        {questions.map((question, index) => (
          <div key={question.id} className="bg-gray-50 p-4 rounded border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {question.type.replace('_', ' ')}
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                    {question.difficulty}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {question.points} pts
                  </span>
                </div>
                <p className="font-medium">{question.question}</p>
                {question.options && (
                  <ul className="mt-2 text-sm text-gray-600">
                    {question.options.map((option, i) => (
                      <li key={i}>• {option}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => removeQuestion(question.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}