'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Trophy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import ReactMarkdown from 'react-markdown';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Test {
  id: number;
  name: string;
  subject: string;
  duration: number;
  total_marks: number;
  num_questions: number;
  description?: string;
  instructions?: string;
}

export default function TestInstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;
  
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);

  const fetchTestInstructions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/exam/test/${testId}/instructions`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setTest(response.data.data);
      }
    } catch (error: unknown) {
      console.error('Error fetching test instructions:', error);
      const axiosError = error as AxiosError;
      toast.error((axiosError.response?.data as { message?: string })?.message || 'Failed to fetch test instructions');
      router.push('/student/dashboard/tests');
    } finally {
      setLoading(false);
    }
  }, [testId, router]);

  useEffect(() => {
    fetchTestInstructions();
  }, [fetchTestInstructions]);

  const handleStartExam = async () => {
    if (!agreed) {
      toast.error('Please agree to the instructions before starting the exam');
      return;
    }

    try {
      setStarting(true);
      const response = await axios.post(
        `${API_URL}/api/exam/start`,
        { testId: parseInt(testId) },
        { withCredentials: true }
      );

      if (response.data.success) {
        const sessionId = response.data.data.session.id;
        toast.success('Exam started successfully!');
        router.push(`/student/dashboard/tests/${sessionId}/attempt`);
      }
    } catch (error: unknown) {
      console.error('Error starting exam:', error);
      const axiosError = error as AxiosError;
      toast.error((axiosError.response?.data as { message?: string })?.message || 'Failed to start exam');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!test) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl" data-testid="test-name">{test.name}</CardTitle>
              <CardDescription className="text-lg mt-1">{test.subject}</CardDescription>
            </div>
            <Badge className="bg-blue-500">Instructions</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Test Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold" data-testid="test-duration">{test.duration} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="font-semibold" data-testid="test-questions">{test.num_questions}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="font-semibold" data-testid="test-marks">{test.total_marks}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {test.description && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm font-semibold text-blue-900 mb-1">About this test:</p>
              <p className="text-sm text-blue-800">{test.description}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Instructions
            </h3>
            <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border">
              <ReactMarkdown>{test.instructions || 'No specific instructions provided.'}</ReactMarkdown>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Checkbox
                id="agreement"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                data-testid="agree-checkbox"
              />
              <label
                htmlFor="agreement"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I have read and understood all the instructions. I am ready to begin the test and agree to follow all the guidelines mentioned above.
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/student/dashboard/tests')}
              className="flex-1"
              data-testid="back-button"
            >
              Back to Tests
            </Button>
            <Button
              onClick={handleStartExam}
              disabled={!agreed || starting}
              className="flex-1"
              data-testid="start-exam-button"
            >
              {starting ? 'Starting...' : 'Start Exam'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
