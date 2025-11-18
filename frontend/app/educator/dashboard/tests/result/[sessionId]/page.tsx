'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';

interface Result {
  session_id: number;
  test_name: string;
  subject: string;
  duration: number;
  total_marks: number;
  score: number;
  total_questions: number;
  answered: number;
  correct: number;
  incorrect: number;
  start_time: string;
  end_time: string;
  time_taken: number;
}

interface ApiResponse {
  success: boolean;
  data: Result;
  message?: string;
}

export default function TestResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId;
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResult = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(`/api/exam/session/${sessionId}/result`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (error: unknown) {
      console.error('Error fetching result:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to fetch result');
      router.push('/student/dashboard/tests');
    } finally {
      setLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

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

  const percentage = ((result.score / result.total_marks) * 100).toFixed(2);
  const accuracy = result.answered > 0 
    ? ((result.correct / result.answered) * 100).toFixed(2)
    : '0';

  const getGrade = (percent: number) => {
    if (percent >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percent >= 80) return { grade: 'A', color: 'text-green-600' };
    if (percent >= 70) return { grade: 'B+', color: 'text-blue-600' };
    if (percent >= 60) return { grade: 'B', color: 'text-blue-600' };
    if (percent >= 50) return { grade: 'C', color: 'text-yellow-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const gradeInfo = getGrade(parseFloat(percentage));

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2" data-testid="result-title">Test Completed!</h1>
        <p className="text-muted-foreground">Here are your results</p>
      </div>

      {/* Test Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{result.test_name}</span>
            <Badge className={`text-lg px-4 py-2 ${gradeInfo.color}`} variant="outline">
              Grade: {gradeInfo.grade}
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">{result.subject}</p>
        </CardHeader>
      </Card>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Score Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Your Score</span>
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-blue-900 mb-1" data-testid="score">
              {result.score} / {result.total_marks}
            </div>
            <div className="text-sm text-blue-700">
              Percentage: {percentage}%
            </div>
          </CardContent>
        </Card>

        {/* Accuracy Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">Accuracy</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-4xl font-bold text-green-900 mb-1" data-testid="accuracy">
              {accuracy}%
            </div>
            <div className="text-sm text-green-700">
              {result.correct} correct out of {result.answered} attempted
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {result.total_questions}
              </div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1" data-testid="answered">
                {result.answered}
              </div>
              <div className="text-sm text-muted-foreground">Attempted</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1 flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6" />
                {result.correct}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600 mb-1 flex items-center justify-center gap-2">
                <XCircle className="h-6 w-6" />
                {result.incorrect}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
          </div>

          {/* Time Information */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Time Taken:</span>
                <span className="font-semibold">{formatTime(result.time_taken || 0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Duration:</span>
                <span className="font-semibold">{result.duration} minutes</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1">
            <div>Started: {new Date(result.start_time).toLocaleString()}</div>
            <div>Completed: {new Date(result.end_time).toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Message */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {parseFloat(percentage) >= 75 ? (
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">Excellent Performance!</h3>
              <p className="text-sm text-muted-foreground">
                You&apos;ve scored above 75%. Keep up the great work!
              </p>
            </div>
          ) : parseFloat(percentage) >= 50 ? (
            <div className="text-center">
              <div className="text-2xl mb-2">👍</div>
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Good Job!</h3>
              <p className="text-sm text-muted-foreground">
                You passed the test. Keep practicing to improve your score!
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-2">💪</div>
              <h3 className="text-lg font-semibold text-orange-600 mb-2">Keep Trying!</h3>
              <p className="text-sm text-muted-foreground">
                Don&apos;t give up! Review the material and try again.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push('/student/dashboard/tests')}
          data-testid="back-to-tests-button"
        >
          Back to Tests
        </Button>
        <Button
          onClick={() => router.push('/student/dashboard/tests')}
          data-testid="take-another-test-button"
        >
          Take Another Test
        </Button>
      </div>
    </div>
  );
}
