'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface QuestionResult {
  question_id: number;
  question_text: string;
  question_type: string;
  options: string[] | null;
  student_answer: string | number | string[] | number[] | undefined;
  correct_answers: (string | number)[];
  explanation?: string;
  is_correct: boolean;
  marks: number;
  score_earned: number;
}

interface ResultData {
  session: {
    id: number;
    start_time: string;
    end_time: string;
    score: number;
  };
  test: {
    name: string;
    subject: string;
    total_marks: number;
    duration: number;
  };
  summary: {
    total_questions: number;
    attempted: number;
    unattempted: number;
    correct: number;
    incorrect: number;
    score: number;
    percentage: string;
  };
  questions: QuestionResult[];
}

export default function ExamResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [sessionId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/exam/session/${sessionId}/result`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setResultData(response.data.data);
      }
    } catch (error: unknown) {
      console.error('Error fetching result:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || 'Failed to fetch result');
      router.push('/student/dashboard/tests');
    } finally {
      setLoading(false);
    }
  };

  const getAnswerDisplay = (question: QuestionResult) => {
    if (question.question_type === 'mcq' || question.question_type === 'true_false') {
      const options = Array.isArray(question.options) ? question.options : [];
      const studentAnswerIndex = typeof question.student_answer === 'number' || typeof question.student_answer === 'string' 
        ? Number(question.student_answer) 
        : undefined;
      const correctAnswerIndex = typeof question.correct_answers[0] === 'number' || typeof question.correct_answers[0] === 'string'
        ? Number(question.correct_answers[0])
        : 0;
      return {
        student: studentAnswerIndex !== undefined ? options[studentAnswerIndex] : 'Not Answered',
        correct: options[correctAnswerIndex],
      };
    } else if (question.question_type === 'multiple_correct') {
      const options = Array.isArray(question.options) ? question.options : [];
      const studentAnswers = Array.isArray(question.student_answer) 
        ? question.student_answer.map((idx) => options[Number(idx)]).join(', ')
        : 'Not Answered';
      const correctAnswers = Array.isArray(question.correct_answers)
        ? question.correct_answers.map((idx) => options[Number(idx)]).join(', ')
        : '';
      return {
        student: studentAnswers,
        correct: correctAnswers,
      };
    } else if (question.question_type === 'numerical') {
      return {
        student: question.student_answer !== undefined ? question.student_answer : 'Not Answered',
        correct: question.correct_answers[0],
      };
    }
    return { student: 'N/A', correct: 'N/A' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!resultData) {
    return null;
  }

  const { session, test, summary, questions } = resultData;
  const percentage = parseFloat(summary.percentage);
  const timeTaken = session.end_time 
    ? Math.floor((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
          <Trophy className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2" data-testid="result-title">Exam Results</h1>
        <p className="text-xl text-muted-foreground" data-testid="test-name">{test.name}</p>
        <p className="text-muted-foreground">{test.subject}</p>
      </div>

      {/* Score Card */}
      <Card className="mb-8 border-2 border-primary/20">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-primary" data-testid="total-score">
                {summary.score}
              </p>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-xs text-muted-foreground">out of {test.total_marks}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600" data-testid="percentage">
                {percentage.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Percentage</p>
              <p className={`text-xs font-semibold ${
                percentage >= 75 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {percentage >= 75 ? 'Excellent!' : percentage >= 50 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600" data-testid="correct-count">
                {summary.correct}
              </p>
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="text-xs text-muted-foreground">out of {summary.total_questions}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-600" data-testid="time-taken">
                {timeTaken}
              </p>
              <p className="text-sm text-muted-foreground">Minutes</p>
              <p className="text-xs text-muted-foreground">of {test.duration} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.attempted}</p>
              <p className="text-sm text-muted-foreground">Attempted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.unattempted}</p>
              <p className="text-sm text-muted-foreground">Unattempted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.correct}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.incorrect}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>Review your answers and explanations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const answers = getAnswerDisplay(question);
              return (
                <Card key={question.question_id} className={`border-l-4 ${
                  question.is_correct ? 'border-l-green-500' : 'border-l-red-500'
                }`} data-testid={`question-result-${index + 1}`}>
                  <CardContent className="p-6">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Question {index + 1}</span>
                          <Badge variant={question.is_correct ? 'default' : 'destructive'}>
                            {question.is_correct ? 'Correct' : 'Incorrect'}
                          </Badge>
                          <Badge variant="outline">{question.marks} marks</Badge>
                        </div>
                        <p className="text-base mb-4">{question.question_text}</p>
                      </div>
                      {question.is_correct ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Answers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Your Answer:</p>
                        <p className="text-sm text-blue-800">{answers.student}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm font-semibold text-green-900 mb-1">Correct Answer:</p>
                        <p className="text-sm text-green-800">{answers.correct}</p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-semibold">Score Earned:</span>
                      <Badge variant={question.score_earned > 0 ? 'default' : 'destructive'}>
                        {question.score_earned > 0 ? '+' : ''}{question.score_earned} marks
                      </Badge>
                    </div>

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="p-4 rounded-lg bg-gray-50 border">
                        <p className="text-sm font-semibold mb-2">💡 Explanation:</p>
                        <p className="text-sm text-gray-700">{question.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          variant="outline"
          onClick={() => router.push('/student/dashboard/tests')}
          data-testid="back-to-tests-button"
        >
          Back to Tests
        </Button>
      </div>
    </div>
  );
}
