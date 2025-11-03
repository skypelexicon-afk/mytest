'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Question {
  id: number;
  question_text: string;
  question_type: 'mcq' | 'multiple_correct' | 'true_false' | 'numerical';
  options?: string[];
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
  answers: Record<string, any>;
  marked_for_review: number[];
  start_time: string;
}

export default function TestAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id;

  const [test, setTest] = useState<Test | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    fetchExamSession();
    
    // Prevent page refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  useEffect(() => {
    if (test && session) {
      // Calculate time remaining
      const startTime = new Date(session.start_time).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      const totalSeconds = test.duration * 60;
      const remaining = totalSeconds - elapsedSeconds;

      if (remaining <= 0) {
        handleAutoSubmit();
        return;
      }

      setTimeRemaining(remaining);

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          
          // Show warning at 5 minutes
          if (prev === 300 && !showWarning) {
            setShowWarning(true);
            toast.warning('5 minutes remaining!', {
              duration: 5000,
            });
          }
          
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [test, session]);

  const fetchExamSession = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/exam/test/${testId}/ongoing`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const { session: sessionData, test: testData, questions: questionsData } = response.data.data;
        setSession(sessionData);
        setTest(testData);
        setQuestions(questionsData);
        setAnswers(sessionData.answers || {});
        setMarkedForReview(sessionData.marked_for_review || []);
      }
    } catch (error: any) {
      console.error('Error fetching exam session:', error);
      toast.error('Failed to load exam session');
      router.push('/student/dashboard/tests');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = useCallback(async (questionId: number, answer: any, markReview: boolean) => {
    if (savingRef.current || !session) return;
    
    try {
      savingRef.current = true;
      await axios.put(
        `/api/exam/session/${session.id}/save-answer`,
        {
          questionId: questionId.toString(),
          answer,
          markedForReview: markReview,
        },
        { withCredentials: true }
      );
    } catch (error: any) {
      console.error('Error saving answer:', error);
      toast.error('Failed to save answer');
    } finally {
      savingRef.current = false;
    }
  }, [session]);

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSaveAndNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestion.id];
    const isMarked = markedForReview.includes(currentQuestion.id);

    await saveAnswer(currentQuestion.id, answer, isMarked);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleMarkForReview = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCurrentlyMarked = markedForReview.includes(currentQuestion.id);
    const newMarked = isCurrentlyMarked
      ? markedForReview.filter((id) => id !== currentQuestion.id)
      : [...markedForReview, currentQuestion.id];

    setMarkedForReview(newMarked);
    
    const answer = answers[currentQuestion.id];
    await saveAnswer(currentQuestion.id, answer, !isCurrentlyMarked);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleClearResponse = () => {
    const currentQuestion = questions[currentQuestionIndex];
    handleAnswerChange(currentQuestion.id, null);
  };

  const handleAutoSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    toast.error('Time is up! Submitting your exam...');
    await submitExam();
  };

  const submitExam = async () => {
    if (!session) return;

    try {
      setSubmitting(true);
      const response = await axios.post(
        `/api/exam/session/${session.id}/submit`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Exam submitted successfully!');
        router.push(`/student/dashboard/tests/result/${session.id}`);
      }
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast.error(error.response?.data?.message || 'Failed to submit exam');
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const getQuestionStatus = (question: Question) => {
    const hasAnswer = answers[question.id] !== undefined && answers[question.id] !== null && answers[question.id] !== '';
    const isMarked = markedForReview.includes(question.id);

    if (isMarked) return 'review'; // Purple - marked for review
    if (hasAnswer) return 'answered'; // Green - answered
    return 'unanswered'; // Gray - not answered
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 hover:bg-green-600';
      case 'review':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'unanswered':
        return 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600';
      default:
        return 'bg-gray-300';
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAttemptedCount = () => {
    return questions.filter((q) => {
      const answer = answers[q.id];
      return answer !== undefined && answer !== null && answer !== '';
    }).length;
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" data-testid="exam-title">{test.name}</h1>
              <p className="text-sm text-muted-foreground">{test.subject}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining <= 300 ? 'bg-red-100 dark:bg-red-900' : 'bg-muted'}`}>
                <Clock className={`h-5 w-5 ${timeRemaining <= 300 ? 'text-red-600 dark:text-red-400' : 'text-primary'}`} />
                <span className={`font-mono text-lg font-semibold ${timeRemaining <= 300 ? 'text-red-600 dark:text-red-400' : ''}`} data-testid="timer">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                onClick={() => setShowSubmitDialog(true)}
                variant="destructive"
                data-testid="submit-test-button"
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      Marks: {currentQuestion.marks}
                      {currentQuestion.negative_marks > 0 && ` | -${currentQuestion.negative_marks}`}
                    </span>
                  </div>
                  <p className="text-base mb-6" data-testid="question-text">{currentQuestion.question_text}</p>

                  {/* MCQ or True/False */}
                  {(currentQuestion.question_type === 'mcq' || currentQuestion.question_type === 'true_false') && currentQuestion.options && (
                    <RadioGroup
                      value={answers[currentQuestion.id]?.toString() || ''}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                    >
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                            <RadioGroupItem value={index.toString()} id={`option-${index}`} data-testid={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {/* Multiple Correct */}
                  {currentQuestion.question_type === 'multiple_correct' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => {
                        const currentAnswers = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : [];
                        const isChecked = currentAnswers.includes(index);

                        return (
                          <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted">
                            <Checkbox
                              id={`option-${index}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const newAnswers = checked
                                  ? [...currentAnswers, index]
                                  : currentAnswers.filter((a: number) => a !== index);
                                handleAnswerChange(currentQuestion.id, newAnswers);
                              }}
                              data-testid={`checkbox-${index}`}
                            />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Numerical */}
                  {currentQuestion.question_type === 'numerical' && (
                    <Input
                      type="number"
                      step="any"
                      placeholder="Enter your answer"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="max-w-xs"
                      data-testid="numerical-input"
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                  <Button
                    onClick={handleSaveAndNext}
                    data-testid="save-next-button"
                  >
                    Save & Next
                  </Button>
                  <Button
                    onClick={handleMarkForReview}
                    variant="outline"
                    data-testid="mark-review-button"
                  >
                    {markedForReview.includes(currentQuestion.id) ? 'Unmark Review' : 'Mark for Review'}
                  </Button>
                  <Button
                    onClick={handleClearResponse}
                    variant="outline"
                    data-testid="clear-button"
                  >
                    Clear Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Question Palette</h3>
                
                {/* Legend */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <span>Not Answered</span>
                  </div>
                </div>

                {/* Question Numbers */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((question, index) => {
                    const status = getQuestionStatus(question);
                    return (
                      <Button
                        key={question.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`h-10 ${getStatusColor(status)} ${currentQuestionIndex === index ? 'ring-2 ring-primary' : ''}`}
                        variant="outline"
                        size="sm"
                        data-testid={`question-nav-${index + 1}`}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Questions:</span>
                    <span className="font-semibold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempted:</span>
                    <span className="font-semibold text-green-600">{getAttemptedCount()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Not Attempted:</span>
                    <span className="font-semibold text-gray-600">{questions.length - getAttemptedCount()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marked for Review:</span>
                    <span className="font-semibold text-purple-600">{markedForReview.length}</span>
                  </div>
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
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>Are you sure you want to submit the test? You won't be able to change your answers after submission.</p>
                <div className="mt-4 p-3 bg-muted rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Questions:</span>
                    <span className="font-semibold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempted:</span>
                    <span className="font-semibold">{getAttemptedCount()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Not Attempted:</span>
                    <span className="font-semibold">{questions.length - getAttemptedCount()}</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitExam}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
