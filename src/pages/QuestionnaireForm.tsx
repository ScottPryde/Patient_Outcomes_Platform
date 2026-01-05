import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockQuestionnaires } from '../lib/mockData';
import { Question, QuestionAnswer } from '../types';
import { toast } from '../components/ui/sonner';
import { ArrowLeft, ArrowRight, Save, Send, AlertCircle } from 'lucide-react';

export function QuestionnaireForm() {
  const { id } = useParams<{ id: string }>();
  const { user, activePatient } = useAuth();
  const navigate = useNavigate();

  const [questionnaire, setQuestionnaire] = useState(mockQuestionnaires.find(q => q.id === id));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [startTime] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!questionnaire) {
      toast.error('Questionnaire not found');
      navigate('/questionnaires');
    }
  }, [questionnaire, navigate]);

  if (!questionnaire || !user) return null;

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questionnaire.questions.length - 1;
  const totalQuestions = questionnaire.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      toast.error('Please answer this question before continuing');
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Progress saved! You can resume later.');
    setIsSaving(false);
  };

  const handleSubmit = async () => {
    // Validate all required questions are answered
    const unansweredRequired = questionnaire.questions
      .filter(q => q.required && !answers[q.id]);

    if (unansweredRequired.length > 0) {
      toast.error('Please answer all required questions');
      return;
    }

    setIsSaving(true);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    toast.success('Questionnaire submitted successfully!');
    navigate('/results');
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id];

    switch (question.type) {
      case 'rating':
      case 'likert':
        return (
          <div className="space-y-3">
            {question.options?.map(option => (
              <label
                key={option.id}
                className={`
                  block p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${value === option.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }
                `}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleAnswer(question.id, option.value)}
                  className="mr-3"
                />
                <span className="font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'visual-analog-scale':
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={question.validation?.min || 0}
              max={question.validation?.max || 10}
              value={value || 0}
              onChange={(e) => handleAnswer(question.id, parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>No pain (0)</span>
              <span className="text-2xl font-bold text-blue-600">{value || 0}</span>
              <span>Worst pain (10)</span>
            </div>
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map(option => (
              <label
                key={option.id}
                className={`
                  block p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${value === option.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }
                `}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleAnswer(question.id, option.value)}
                  className="mr-3"
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case 'multiple-select':
        return (
          <div className="space-y-3">
            {question.options?.map(option => (
              <label
                key={option.id}
                className={`
                  block p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${value?.includes(option.value)
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={value?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValue = value || [];
                    const newValue = e.target.checked
                      ? [...currentValue, option.value]
                      : currentValue.filter((v: any) => v !== option.value);
                    handleAnswer(question.id, newValue);
                  }}
                  className="mr-3"
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
            placeholder="Type your answer..."
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
            placeholder="Type your answer..."
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            min={question.validation?.min}
            max={question.validation?.max}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
            placeholder="Enter a number..."
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
          />
        );

      default:
        return <p className="text-gray-500">Unsupported question type</p>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/questionnaires')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-gray-900 dark:text-white">{questionnaire.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {questionnaire.description}
          </p>
        </div>
      </div>

      {/* Caregiver indicator */}
      {user.role === 'caregiver' && activePatient && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-purple-900 dark:text-purple-200">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Completing on behalf of {activePatient.firstName} {activePatient.lastName}
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {currentQuestion.text}
            {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
          </h2>
          {currentQuestion.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {currentQuestion.description}
            </p>
          )}
        </div>

        {renderQuestion(currentQuestion)}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Save className="w-5 h-5" />
          Save Progress
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {isLastQuestion ? (
            <>
              Submit
              <Send className="w-5 h-5" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Help text */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Your responses are encrypted and securely stored</p>
      </div>
    </div>
  );
}
