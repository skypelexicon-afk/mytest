'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Clock, Flag, Send } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string[];
  order: number;
}

interface ExamSession {
  session_id: number;
  test_id: number;
  test_name: string;
  duration: number;
  start_time: string;
  answers: Record<number, any>;
  marked_for_review: number[];
}

export default function TestAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = params.testId;
  const sessionId = searchParams.get('sessionId');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchExamData();
    } else {
      toast.error('Invalid session');
      router.push('/student/dashboard/tests');
    }
  }, [sessionId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/questions/test/${testId}`, { withCredentials: true });

      if (res.data.success) {
        const sortedQuestions = res.data.data.sort((a: Question, b: Question) => a.order - b.order);
        setQuestions(sortedQuestions);
      }

      const durationInSeconds = 60 * 60;
      setTimeLeft(durationInSeconds);
      setAnswers({});
      setMarkedForReview(new Set());
    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast.error('Failed to load exam data');
      router.push('/student/dashboard/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async () => {
    toast.info('Time is up! Auto-submitting your test...');
    await handleSubmitExam();
  };

  const saveAnswer = async (questionId: number, answer: any) => {
    try {
      await axios.put(
        `/api/exam/session/${sessionId}/save-answer`,
        { questionId, answer },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    saveAnswer(questionId, answer);
  };

  const handleMarkForReview = () => {
    const questionId = questions[currentQuestionIndex].id;
    const newMarked = new Set(markedForReview);
    newMarked.has(questionId) ? newMarked.delete(questionId) : newMarked.add(questionId);
    setMarkedForReview(newMarked);
  };

  const handleClearResponse = () => {
    const questionId = questions[currentQuestionIndex].id;
    const newAnswers = { ...answers };
    delete newAnswers[questionId];
    setAnswers(newAnswers);
    saveAnswer(questionId, null);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = async () => {
    try {
      setSubmitting(true);
      const res = await axios.post(
        `/api/exam/session/${sessionId}/submit`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success('Test submitted successfully!');
        router.push(`/student/dashboard/tests/result/${sessionId}`);
      }
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = useMemo(() => {
    const answered = Object.keys(answers).length;
    const reviewed = markedForReview.size;
    const notAnswered = questions.length - answered;
    return { answered, reviewed, notAnswered };
  }, [answers, markedForReview, questions.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <p className="text-lg">No questions found for this test.</p>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-50" data-testid="exam-interface">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" data-testid="exam-title">
            Test in Progress
          </h1>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
            <Clock className="h-5 w-5 text-red-600" />
            <span className="text-lg font-mono font-bold text-red-600" data-testid="timer">
              {formatTime(timeLeft)}
            </span>
          </div>
          <Button variant="destructive" onClick={() => setShowSubmitDialog(true)} data-testid="submit-test-button">
            <Send className="h-4 w-4 mr-2" />
            Submit Test
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Question Palette</h3>
          <div className="space-y-2 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Answered ({stats.answered})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Marked ({stats.reviewed})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>Not Answered ({stats.notAnswered})</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-full aspect-square rounded flex items-center justify-center text-sm font-medium transition-all ${
                  index === currentQuestionIndex ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  {markedForReview.has(currentQuestion.id) && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      <Flag className="h-3 w-3 mr-1" />
                      Marked for Review
                    </Badge>
                  )}
                </div>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.question_text}
                </p>
              </div>

              <RadioGroup
                value={answers[currentQuestion.id]?.toString() || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleAnswerChange(currentQuestion.id, index)}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleMarkForReview}>
                    <Flag className="h-4 w-4 mr-2" />
                    {markedForReview.has(currentQuestion.id) ? 'Unmark' : 'Mark for Review'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearResponse}
                    disabled={!answers[currentQuestion.id]}
                  >
                    Clear Response
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>Are you sure you want to submit the test? You won't be able to change your answers after submission.</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-1">
                  <p><strong>Answered:</strong> {stats.answered} questions</p>
                  <p><strong>Marked for Review:</strong> {stats.reviewed} questions</p>
                  <p><strong>Not Answered:</strong> {stats.notAnswered} questions</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitExam} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Test'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
