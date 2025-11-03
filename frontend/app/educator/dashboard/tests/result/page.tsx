'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Trophy, TrendingUp, Home } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface QuestionResult {
  question_id: number;
  question_text: string;
  question_type: string;
  options: string[];
  student_answer: any;
  correct_answers: any[];
  explanation?: string;
  is_correct: boolean;
  marks: number;
  score_earned: number;
}

interface ExamResult {
  session: {
    id: number;
    test_id: number;
    student_id: number;
    score: number;
    start_time: string;
    end_time: string;
    status: string;
  };
  test: {
    id: number;
    name: string;
    subject: string;
    duration: number;
    total_marks: number;
    num_questions: number;
  };
  summary: {
    total_questions: number;
    attempted_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    unattempted: number;
    total_marks: number;
    score_obtained: number;
    percentage: number;
  };
  questions: QuestionResult[];
}

export default function TestResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [sessionId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/exam/session/${sessionId}/result`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching result:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch result');
      router.push('/student/dashboard/tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const { session, test, summary, questions } = result;
  const percentage = summary.percentage;
  const passed = percentage >= 40; // Assuming 40% is passing

  const getAnswerDisplay = (question: QuestionResult) => {
    if (question.question_type === 'mcq' || question.question_type === 'true_false') {
      const studentAnswerIndex = parseInt(question.student_answer);
      const correctAnswerIndex = parseInt(question.correct_answers[0]);
      
      return {
        student: question.options[studentAnswerIndex] || 'Not answered',
        correct: question.options[correctAnswerIndex],
      };
    } else if (question.question_type === 'multiple_correct') {
      const studentAnswers = Array.isArray(question.student_answer) 
        ? question.student_answer.map((idx: string) => question.options[parseInt(idx)]).join(', ')
        : 'Not answered';
      const correctAnswers = question.correct_answers
        .map((idx) => question.options[parseInt(idx)])
        .join(', ');
      
      return {
        student: studentAnswers,
        correct: correctAnswers,
      };
    } else if (question.question_type === 'numerical') {
      return {
        student: question.student_answer || 'Not answered',
        correct: question.correct_answers[0],
      };
    }
    
    return {
      student: 'Not answered',
      correct: 'N/A',
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/student/dashboard/tests')}
          data-testid="back-to-tests"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Tests
        </Button>
      </div>

      {/* Result Summary Card */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <Trophy className="h-20 w-20 text-yellow-500" />
            ) : (
              <TrendingUp className="h-20 w-20 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-3xl" data-testid="result-title">
            {test.name}
          </CardTitle>
          <CardDescription className="text-lg">{test.subject}</CardDescription>
          
          <div className="mt-6">
            <div className="text-6xl font-bold text-primary mb-2">
              {percentage.toFixed(1)}%
            </div>
            <Badge
              className={`text-lg py-1 px-4 ${
                passed ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {passed ? 'Passed' : 'Keep Practicing'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {summary.total_questions}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {summary.correct_answers}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {summary.incorrect_answers}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-600">
                {summary.unattempted}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Unattempted</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {summary.score_obtained}/{summary.total_marks}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Score</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Started: {new Date(session.start_time).toLocaleString()}
              </span>
            </div>
            {session.end_time && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Completed: {new Date(session.end_time).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>Review your answers and explanations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">All ({questions.length})</TabsTrigger>
              <TabsTrigger value="incorrect">
                Incorrect ({summary.incorrect_answers})
              </TabsTrigger>
              <TabsTrigger value="correct">
                Correct ({summary.correct_answers})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-6">
              {questions.map((question, index) => (
                <QuestionCard key={question.question_id} question={question} index={index} />
              ))}
            </TabsContent>

            <TabsContent value="incorrect" className="space-y-6 mt-6">
              {questions
                .filter((q) => !q.is_correct && q.student_answer !== null)
                .map((question, index) => (
                  <QuestionCard key={question.question_id} question={question} index={index} />
                ))}
            </TabsContent>

            <TabsContent value="correct" className="space-y-6 mt-6">
              {questions
                .filter((q) => q.is_correct)
                .map((question, index) => (
                  <QuestionCard key={question.question_id} question={question} index={index} />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuestionCardProps {
  question: QuestionResult;
  index: number;
}

function QuestionCard({ question, index }: QuestionCardProps) {
  const getAnswerDisplay = (question: QuestionResult) => {
    if (question.question_type === 'mcq' || question.question_type === 'true_false') {
      const studentAnswerIndex = question.student_answer !== null ? parseInt(question.student_answer) : null;
      const correctAnswerIndex = parseInt(question.correct_answers[0]);
      
      return {
        student: studentAnswerIndex !== null ? question.options[studentAnswerIndex] : 'Not answered',
        correct: question.options[correctAnswerIndex],
      };
    } else if (question.question_type === 'multiple_correct') {
      const studentAnswers = Array.isArray(question.student_answer) 
        ? question.student_answer.map((idx: string) => question.options[parseInt(idx)]).join(', ')
        : 'Not answered';
      const correctAnswers = question.correct_answers
        .map((idx) => question.options[parseInt(idx)])
        .join(', ');
      
      return {
        student: studentAnswers,
        correct: correctAnswers,
      };
    } else if (question.question_type === 'numerical') {
      return {
        student: question.student_answer || 'Not answered',
        correct: question.correct_answers[0],
      };
    }
    
    return {
      student: 'Not answered',
      correct: 'N/A',
    };
  };

  const answerDisplay = getAnswerDisplay(question);
  const wasAttempted = question.student_answer !== null && question.student_answer !== undefined && question.student_answer !== '';

  return (
    <Card
      className={`border-l-4 ${
        question.is_correct
          ? 'border-l-green-500'
          : wasAttempted
          ? 'border-l-red-500'
          : 'border-l-gray-300'
      }`}
      data-testid={`question-result-${index + 1}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              Question {index + 1}
              {question.is_correct ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : wasAttempted ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Badge variant="outline">Not Attempted</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              <div dangerouslySetInnerHTML={{ __html: question.question_text }} />
            </CardDescription>
          </div>
          <Badge variant="outline">
            {question.score_earned > 0 ? '+' : ''}{question.score_earned} / {question.marks}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-800 mb-2">Your Answer</p>
            <p className="text-sm">{answerDisplay.student}</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800 mb-2">Correct Answer</p>
            <p className="text-sm">{answerDisplay.correct}</p>
          </div>
        </div>

        {question.explanation && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-800 mb-2">Explanation</p>
            <p className="text-sm text-blue-900">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
