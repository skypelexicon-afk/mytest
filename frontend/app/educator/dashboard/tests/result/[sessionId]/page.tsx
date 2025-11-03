'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  FileText,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface QuestionResult {
  question_id: number;
  question_text: string;
  question_type: string;
  options?: string[];
  student_answer: any;
  correct_answers: any[];
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

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId;

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

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

  const getAnswerDisplay = (question: QuestionResult) => {
    if (question.question_type === 'numerical') {
      return question.student_answer || 'Not answered';
    }

    if (question.question_type === 'multiple_correct') {
      const answers = Array.isArray(question.student_answer) ? question.student_answer : [];
      if (answers.length === 0) return 'Not answered';
      return answers.map((idx: number) => question.options?.[idx] || `Option ${idx + 1}`).join(', ');
    }

    if (question.student_answer !== undefined && question.student_answer !== null) {
      return question.options?.[question.student_answer] || `Option ${question.student_answer + 1}`;
    }

    return 'Not answered';
  };

  const getCorrectAnswerDisplay = (question: QuestionResult) => {
    if (question.question_type === 'numerical') {
      return question.correct_answers[0];
    }

    if (question.question_type === 'multiple_correct') {
      return question.correct_answers
        .map((idx: number) => question.options?.[idx] || `Option ${idx + 1}`)
        .join(', ');
    }

    return question.options?.[question.correct_answers[0]] || `Option ${question.correct_answers[0] + 1}`;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return 'Outstanding Performance! 🎉';
    if (percentage >= 75) return 'Great Job! 👏';
    if (percentage >= 50) return 'Good Effort! 👍';
    return 'Keep Practicing! 💪';
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

  const percentage = parseFloat(result.summary.percentage);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/student/dashboard/tests')}
        className="mb-6"
        data-testid="back-button"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tests
      </Button>

      {/* Header Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl" data-testid="result-title">{result.test.name}</CardTitle>
              <CardDescription className="text-base">{result.test.subject}</CardDescription>
            </div>
            <Award className="h-12 w-12 text-yellow-500" />
          </div>
        </CardHeader>
      </Card>

      {/* Score Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className={`text-5xl font-bold mb-2 ${getPerformanceColor(percentage)}`} data-testid="score">
              {result.summary.score} / {result.test.total_marks}
            </div>
            <div className={`text-3xl font-semibold mb-2 ${getPerformanceColor(percentage)}`}>
              {result.summary.percentage}%
            </div>
            <p className="text-xl text-muted-foreground">{getPerformanceMessage(percentage)}</p>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{result.summary.total_questions}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{result.summary.correct}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{result.summary.incorrect}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-gray-500" />
              <div className="text-2xl font-bold text-gray-600">{result.summary.unattempted}</div>
              <div className="text-sm text-muted-foreground">Unattempted</div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Started: {new Date(result.session.start_time).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Ended: {new Date(result.session.end_time).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results Toggle */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={() => setShowDetailedResults(!showDetailedResults)}
          variant="outline"
          size="lg"
          data-testid="toggle-details-button"
        >
          {showDetailedResults ? 'Hide' : 'Show'} Detailed Results
        </Button>
      </div>

      {/* Detailed Question-wise Results */}
      {showDetailedResults && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Question-wise Analysis</h2>
          {result.questions.map((question, index) => (
            <Card
              key={question.question_id}
              className={`${
                question.is_correct
                  ? 'border-green-500 dark:border-green-700'
                  : question.student_answer !== undefined && question.student_answer !== null && question.student_answer !== ''
                  ? 'border-red-500 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
              data-testid={`question-result-${index + 1}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      {question.is_correct ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Correct
                        </Badge>
                      ) : question.student_answer !== undefined && question.student_answer !== null && question.student_answer !== '' ? (
                        <Badge className="bg-red-500">
                          <XCircle className="h-3 w-3 mr-1" />
                          Incorrect
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500">Unattempted</Badge>
                      )}
                    </div>
                    <p className="text-base text-muted-foreground">{question.question_text}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-lg font-semibold ${question.score_earned >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {question.score_earned >= 0 ? '+' : ''}{question.score_earned}
                    </div>
                    <div className="text-sm text-muted-foreground">/ {question.marks}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {question.options && (
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIndex) => {
                      const isStudentAnswer =
                        question.question_type === 'multiple_correct'
                          ? Array.isArray(question.student_answer) && question.student_answer.includes(optIndex)
                          : question.student_answer === optIndex;
                      
                      const isCorrectAnswer = Array.isArray(question.correct_answers)
                        ? question.correct_answers.includes(optIndex)
                        : question.correct_answers[0] === optIndex;

                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border ${
                            isCorrectAnswer
                              ? 'bg-green-50 dark:bg-green-950 border-green-500'
                              : isStudentAnswer
                              ? 'bg-red-50 dark:bg-red-950 border-red-500'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {isCorrectAnswer && (
                              <Badge className="bg-green-500 ml-2">Correct</Badge>
                            )}
                            {isStudentAnswer && !isCorrectAnswer && (
                              <Badge className="bg-red-500 ml-2">Your Answer</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {question.question_type === 'numerical' && (
                  <div className="space-y-2 mb-4">
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-500">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Your Answer:</span>
                        <span>{question.student_answer || 'Not answered'}</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-500">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Correct Answer:</span>
                        <span>{question.correct_answers[0]}</span>
                      </div>
                    </div>
                  </div>
                )}

                {question.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Explanation:
                    </h4>
                    <p className="text-sm">{question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => router.push('/student/dashboard/tests')}
        >
          Back to Tests
        </Button>
        <Button onClick={() => window.print()}>
          Download/Print Result
        </Button>
      </div>
    </div>
  );
}
