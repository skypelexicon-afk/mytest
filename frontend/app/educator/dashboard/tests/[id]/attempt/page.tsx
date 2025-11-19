'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
import { Clock, Flag, Save } from 'lucide-react';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string[];
  marks: number;
  negative_marks: number;
  order: number;
}

interface ExamSession {
  id: number;
  test_id: number;
  student_id: number;
  answers: Record<string, string | number | string[] | null>;
  marked_for_review: number[];
  status: string;
  start_time: string;
}

interface Test {
  id: number;
  name: string;
  subject: string;
  duration: number;
  total_marks: number;
  num_questions: number;
}

export default function TestAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<ExamSession | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[] | null>>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadExamSession();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionId]);

  useEffect(() => {
    if (test && session) {
      const startTime = new Date(session.start_time).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      const totalSeconds = test.duration * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [test, session]);

  const loadExamSession = async () => {
    try {
      setLoading(true);
      // Check if session is still ongoing
      const response = await axios.get(`/api/exam/session/${sessionId}/details`, {
        withCredentials: true,
      });

      // If API doesn't exist, we need to start from session ID
      // For now, let's try to get session by checking ongoing status
      // This is a workaround - ideally backend should have session details endpoint
      
      // Load from stored data if session was just created
      const storedData = sessionStorage.getItem(`exam_session_${sessionId}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        setSession(data.session);
        setTest(data.test);
        setQuestions(data.questions);
        setAnswers(data.session.answers || {});
        setMarkedForReview(data.session.marked_for_review || []);
        setLoading(false);
        return;
      }
      
      // If no stored data, redirect back to tests
      toast.error('Session not found. Please start the test again.');
      router.push('/student/dashboard/tests');
    } catch (error: unknown) {
      console.error('Error loading exam session:', error);
      toast.error('Failed to load exam session');
      router.push('/student/dashboard/tests');
    }
  };

  const handleAutoSubmit = async () => {
    toast.info('Time is up! Submitting your exam...');
    await handleSubmitExam(true);
  };

  const saveAnswer = async (questionId: number, answer: string | number | string[] | null, markForReview: boolean = false) => {
    try {
      setSaving(true);
      await axios.put(
        `/api/exam/session/${sessionId}/save-answer`,
        {
          questionId: questionId.toString(),
          answer,
          markedForReview: markForReview,
        },
        { withCredentials: true }
      );
    } catch (error: unknown) {
      console.error('Error saving answer:', error);
      toast.error('Failed to save answer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string | number | string[] | null) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSaveAndNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestion.id];
    
    if (answer !== undefined && answer !== null && answer !== '') {
      await saveAnswer(currentQuestion.id, answer);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleMarkForReview = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isMarked = markedForReview.includes(currentQuestion.id);
    
    const newMarkedList = isMarked
      ? markedForReview.filter((id) => id !== currentQuestion.id)
      : [...markedForReview, currentQuestion.id];
    
    setMarkedForReview(newMarkedList);
    
    const answer = answers[currentQuestion.id];
    await saveAnswer(currentQuestion.id, answer || null, !isMarked);
    
    toast.success(isMarked ? 'Unmarked for review' : 'Marked for review');
  };

  const handleClearResponse = () => {
    const currentQuestion = questions[currentQuestionIndex];
    handleAnswerChange(currentQuestion.id, null);
    toast.success('Response cleared');
  };

  const handleSubmitExam = async (autoSubmit: boolean = false) => {
    try {
      setSubmitting(true);
      const response = await axios.post(
        `/api/exam/session/${sessionId}/submit`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        toast.success('Exam submitted successfully!');
        router.push(`/student/dashboard/tests/${sessionId}/result`);
      }
    } catch (error: unknown) {
      console.error('Error submitting exam:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const getQuestionStatus = (questionId: number) => {
    const answer = answers[questionId];
    const isMarked = markedForReview.includes(questionId);
    
    if (isMarked) return 'review';
    if (answer !== undefined && answer !== null && answer !== '') return 'answered';
    return 'unanswered';
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !test || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">Unable to load exam session</p>
          <Button onClick={() => router.push('/student/dashboard/tests')} className="mt-4">
            Back to Tests
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const isMarkedForReview = markedForReview.includes(currentQuestion.id);

  const stats = {
    answered: questions.filter((q) => getQuestionStatus(q.id) === 'answered').length,
    review: questions.filter((q) => getQuestionStatus(q.id) === 'review').length,
    unanswered: questions.filter((q) => getQuestionStatus(q.id) === 'unanswered').length,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" data-testid="exam-title">{test.name}</h1>
            <p className="text-sm text-muted-foreground">{test.subject}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md">
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
                <Badge variant="outline">{currentQuestion.marks} marks</Badge>
              </div>
              
              <div className="mb-6">
                <p className="text-base" dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }} />
              </div>

              {/* Answer Options */}
              <div className="space-y-4">
                {currentQuestion.question_type === 'mcq' || currentQuestion.question_type === 'true_false' ? (
                  <RadioGroup
                    value={typeof currentAnswer === 'string' || typeof currentAnswer === 'number' ? String(currentAnswer) : undefined}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : currentQuestion.question_type === 'multiple_correct' ? (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => {
                      const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
                      const isChecked = selectedOptions.includes(index.toString());
                      
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={`option-${index}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleAnswerChange(currentQuestion.id, [...selectedOptions, index.toString()]);
                              } else {
                                handleAnswerChange(
                                  currentQuestion.id,
                                  selectedOptions.filter((opt: string) => opt !== index.toString())
                                );
                              }
                            }}
                          />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : currentQuestion.question_type === 'numerical' ? (
                  <Input
                    type="number"
                    placeholder="Enter your answer"
                    value={currentAnswer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="max-w-md"
                  />
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleMarkForReview}
              disabled={saving}
            >
              <Flag className="h-4 w-4 mr-2" />
              {isMarkedForReview ? 'Unmark' : 'Mark for Review'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearResponse}
            >
              Clear Response
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleSaveAndNext}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {currentQuestionIndex === questions.length - 1 ? 'Save' : 'Save & Next'}
            </Button>
          </div>
        </div>
      </div>

      {/* Question Palette Sidebar */}
      <div className="w-80 bg-white border-l overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-4">Question Palette</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span>Answered ({stats.answered})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded"></div>
              <span>Marked for Review ({stats.review})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <span>Not Answered ({stats.unanswered})</span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const status = getQuestionStatus(question.id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded font-semibold transition-all ${
                    isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''
                  } ${
                    status === 'answered' ? 'bg-green-500 text-white' :
                    status === 'review' ? 'bg-purple-500 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}
                  data-testid={`question-palette-${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t">
          <Button
            onClick={() => setShowSubmitDialog(true)}
            className="w-full"
            variant="destructive"
            data-testid="submit-exam-button"
          >
            Submit Exam
          </Button>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your exam? You have:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>{stats.answered} answered questions</li>
                <li>{stats.review} marked for review</li>
                <li>{stats.unanswered} unanswered questions</li>
              </ul>
              <p className="mt-4 font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubmitExam()}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
