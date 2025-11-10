'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, AlertCircle, CheckCircle2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: any;
  marks: number;
  negative_marks: number;
  order: number;
}

interface Test {
  id: number;
  name: string;
  subject: string;
  duration: number;
  total_marks: number;
  num_questions: number;
}

interface Session {
  id: number;
  test_id: number;
  student_id: number;
  answers: any;
  marked_for_review: any;
  start_time: string;
  status: string;
}

type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';

export default function ExamAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  // Timer
  useEffect(() => {
    if (!test || !session) return;

    const startTime = new Date(session.start_time).getTime();
    const durationMs = test.duration * 60 * 1000;
    const endTime = startTime + durationMs;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(timer);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [test, session]);

  // Mark current question as visited
  useEffect(() => {
    if (questions.length > 0) {
      const questionId = questions[currentQuestionIndex]?.id;
      if (questionId) {
        setVisitedQuestions((prev) => new Set([...prev, questionId]));
      }
    }
  }, [currentQuestionIndex, questions]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/exam/session/${sessionId}/details`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const { session: sessionData, test: testData, questions: questionsData } = response.data.data;
        setSession(sessionData);
        setTest(testData);
        setQuestions(questionsData);
        setAnswers(sessionData.answers || {});
        setMarkedForReview(sessionData.marked_for_review || []);

        // Calculate time remaining
        const startTime = new Date(sessionData.start_time).getTime();
        const durationMs = testData.duration * 60 * 1000;
        const endTime = startTime + durationMs;
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(Math.floor(remaining / 1000));
      }
    } catch (error: any) {
      console.error('Error fetching session details:', error);
      toast.error(error.response?.data?.message || 'Failed to load exam session');
      router.push('/student/dashboard/tests');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (questionId: number, answer: any, marked: boolean) => {
    try {
      setSaving(true);
      await axios.put(
        `${API_URL}/api/exam/session/${sessionId}/save-answer`,
        {
          questionId: questionId.toString(),
          answer: answer,
          markedForReview: marked,
        },
        { withCredentials: true }
      );
    } catch (error: any) {
      console.error('Error saving answer:', error);
      toast.error('Failed to save answer');
    } finally {
      setSaving(false);
    }
  };

  const handleAnswerChange = (value: any) => {
    const questionId = questions[currentQuestionIndex].id;
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
  };

  const handleSaveAndNext = async () => {
    const question = questions[currentQuestionIndex];
    const answer = answers[question.id];
    const isMarked = markedForReview.includes(question.id);

    await saveAnswer(question.id, answer, isMarked);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleMarkForReview = async () => {
    const question = questions[currentQuestionIndex];
    const newMarked = markedForReview.includes(question.id)
      ? markedForReview.filter((id) => id !== question.id)
      : [...markedForReview, question.id];
    
    setMarkedForReview(newMarked);
    const answer = answers[question.id];
    await saveAnswer(question.id, answer, !markedForReview.includes(question.id));
  };

  const handleClearResponse = () => {
    const questionId = questions[currentQuestionIndex].id;
    const newAnswers = { ...answers };
    delete newAnswers[questionId];
    setAnswers(newAnswers);
  };

  const handleSubmitExam = async () => {
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${API_URL}/api/exam/session/${sessionId}/submit`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Exam submitted successfully!');
        router.push(`/student/dashboard/tests/${sessionId}/result`);
      }
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const handleAutoSubmit = async () => {
    toast.info('Time is up! Auto-submitting exam...');
    await handleSubmitExam();
  };

  const getQuestionStatus = (questionId: number): QuestionStatus => {
    const isVisited = visitedQuestions.has(questionId);
    const isAnswered = answers[questionId] !== undefined && answers[questionId] !== null && answers[questionId] !== '';
    const isMarked = markedForReview.includes(questionId);

    if (!isVisited) return 'not-visited';
    if (isAnswered && isMarked) return 'answered-marked';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    return 'not-answered';
  };

  const getStatusColor = (status: QuestionStatus): string => {
    switch (status) {
      case 'not-visited':
        return 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'not-answered':
        return 'bg-red-500 text-white hover:bg-red-600 border-2 border-red-600';
      case 'answered':
        return 'bg-green-500 text-white hover:bg-green-600 border-2 border-green-600';
      case 'marked':
        return 'bg-purple-500 text-white hover:bg-purple-600 border-2 border-purple-600';
      case 'answered-marked':
        return 'bg-blue-500 text-white hover:bg-blue-600 border-2 border-blue-600';
      default:
        return 'bg-white border-2 border-gray-300';
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestionInput = () => {
    const question = questions[currentQuestionIndex];
    const currentAnswer = answers[question.id];

    if (question.question_type === 'mcq' || question.question_type === 'true_false') {
      const options = Array.isArray(question.options) ? question.options : [];
      return (
        <RadioGroup value={currentAnswer?.toString() || ''} onValueChange={(value) => handleAnswerChange(parseInt(value))}>
          <div className="space-y-3">
            {options.map((option: string, index: number) => {
              const isSelected = currentAnswer?.toString() === index.toString();
              return (
                <div 
                  key={index} 
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleAnswerChange(index)}
                >
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`} 
                    data-testid={`option-${index}`}
                    className={isSelected ? 'border-green-500 text-green-500' : ''}
                  />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer font-normal leading-relaxed"
                  >
                    {option}
                  </Label>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </RadioGroup>
      );
    } else if (question.question_type === 'multiple_correct') {
      const options = Array.isArray(question.options) ? question.options : [];
      const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
      
      return (
        <div className="space-y-3">
          {options.map((option: string, index: number) => {
            const isSelected = selectedOptions.includes(index);
            return (
              <div 
                key={index} 
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  const newSelected = isSelected
                    ? selectedOptions.filter((i: number) => i !== index)
                    : [...selectedOptions, index];
                  handleAnswerChange(newSelected);
                }}
              >
                <Checkbox
                  id={`option-${index}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    const newSelected = checked
                      ? [...selectedOptions, index]
                      : selectedOptions.filter((i: number) => i !== index);
                    handleAnswerChange(newSelected);
                  }}
                  data-testid={`option-${index}`}
                  className={isSelected ? 'border-green-500 bg-green-500' : ''}
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer font-normal leading-relaxed"
                >
                  {option}
                </Label>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      );
    } else if (question.question_type === 'numerical') {
      return (
        <div className="space-y-2">
          <Label htmlFor="numerical-answer" className="text-base">Enter your answer:</Label>
          <Input
            id="numerical-answer"
            type="number"
            step="any"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Enter numerical value"
            className="max-w-md text-lg p-3"
            data-testid="numerical-input"
          />
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!test || !session || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== null && answers[key] !== '').length;
  const markedCount = markedForReview.length;
  const notAnsweredCount = visitedQuestions.size - answeredCount;
  const notVisitedCount = questions.length - visitedQuestions.size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" data-testid="exam-title">{test.name}</h1>
              <p className="text-sm text-muted-foreground">{test.subject}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`} data-testid="timer">
                <Clock className="h-5 w-5" />
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* Main Question Area */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold" data-testid="question-number">
                      Question No. {currentQuestionIndex + 1}
                    </h2>
                    <Badge className="bg-green-600 hover:bg-green-700">
                      Marks: {currentQuestion.marks}
                    </Badge>
                    {currentQuestion.negative_marks > 0 && (
                      <Badge variant="destructive" className="bg-red-600">
                        Negative: -{currentQuestion.negative_marks}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <p className="text-base leading-relaxed" data-testid="question-text">
                    {currentQuestion.question_text}
                  </p>
                </div>

                {/* Options/Input */}
                <div className="mb-8" data-testid="question-options">
                  {renderQuestionInput()}
                </div>

                {/* Action Buttons at Bottom */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0 || saving}
                    data-testid="previous-button"
                    className="min-w-[120px]"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleClearResponse}
                      disabled={saving}
                      data-testid="clear-response-button"
                    >
                      Clear Response
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleMarkForReview}
                      disabled={saving}
                      data-testid="mark-review-button"
                      className="bg-purple-50 hover:bg-purple-100 border-purple-300"
                    >
                      <Bookmark className={`h-4 w-4 mr-2 ${markedForReview.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
                      {markedForReview.includes(currentQuestion.id) ? 'Unmark Review' : 'Mark for Review'}
                    </Button>
                    <Button
                      onClick={handleSaveAndNext}
                      disabled={saving}
                      data-testid="save-next-button"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? 'Saving...' : 'Save & Next'}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => currentQuestionIndex < questions.length - 1 && setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    disabled={currentQuestionIndex === questions.length - 1 || saving}
                    data-testid="next-button"
                    className="min-w-[120px]"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Palette - Right Side */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardContent className="p-4 bg-blue-50">
                {/* Section Header */}
                <div className="mb-4 pb-3 border-b border-blue-200">
                  <h3 className="font-semibold text-lg text-blue-900">Section: {test.subject}</h3>
                </div>

                {/* Question Numbers Grid */}
                <div className="mb-4">
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((question, index) => {
                      const status = getQuestionStatus(question.id);
                      return (
                        <button
                          key={question.id}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`aspect-square rounded-md font-bold text-sm transition-all flex items-center justify-center ${
                            getStatusColor(status)
                          } ${
                            index === currentQuestionIndex ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                          }`}
                          data-testid={`question-palette-${index + 1}`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="mb-4 pb-3 border-b border-blue-200">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900">Legend:</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                      <span>Not Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
                        M
                      </div>
                      <span>Marked for Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-md"></div>
                      <span>Not Visited</span>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="mb-4 pb-3 border-b border-blue-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded">
                      <div className="font-semibold text-green-600" data-testid="answered-count">{answeredCount}</div>
                      <div className="text-gray-600">Answered</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-semibold text-red-600" data-testid="not-answered-count">{notAnsweredCount}</div>
                      <div className="text-gray-600">Not Answered</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-semibold text-purple-600" data-testid="marked-count">{markedCount}</div>
                      <div className="text-gray-600">Marked</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-semibold text-gray-600" data-testid="not-visited-count">{notVisitedCount}</div>
                      <div className="text-gray-600">Not Visited</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                    variant="default"
                    size="sm"
                  >
                    Question Paper
                  </Button>
                  <Button
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                    variant="default"
                    size="sm"
                  >
                    Summary
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => setShowSubmitDialog(true)}
                    data-testid="submit-exam-button"
                  >
                    Submit Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit the exam? You have:
              <ul className="mt-2 space-y-1">
                <li>• {answeredCount} answered questions</li>
                <li>• {notAnsweredCount} not answered questions</li>
                <li>• {markedCount} questions marked for review</li>
                <li>• {notVisitedCount} questions not visited</li>
              </ul>
              <p className="mt-3 font-semibold">Once submitted, you cannot modify your answers.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-submit">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitExam}
              disabled={submitting}
              data-testid="confirm-submit"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
