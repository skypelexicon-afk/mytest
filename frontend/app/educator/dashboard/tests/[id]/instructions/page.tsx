'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, BookOpen, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import ReactMarkdown from 'react-markdown';

interface Test {
  id: number;
  name: string;
  subject: string;
  duration: number;
  total_marks: number;
  num_questions: number;
  description?: string;
  instructions?: string;
  status: string;
}

interface ApiResponse {
  success: boolean;
  data: Test;
  message?: string;
}

export default function TestInstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);

  const fetchTestInstructions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(`/api/exam/test/${testId}/instructions`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setTest(response.data.data);
      }
    } catch (error: unknown) {
      console.error('Error fetching test instructions:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to fetch test instructions');
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
      toast.error('Please agree to the instructions before starting');
      return;
    }

    try {
      setStarting(true);
      const response = await axios.post<ApiResponse>(
        '/api/exam/start',
        { testId: parseInt(testId) },
        { withCredentials: true }
      );

      if (response.data.success) {
        const sessionId = response.data.data.id;
        sessionStorage.setItem(`exam_session_${sessionId}`, JSON.stringify(response.data.data));
        toast.success('Exam started! Good luck!');
        router.push(`/student/dashboard/tests/${sessionId}/attempt`);
      }
    } catch (error: unknown) {
      console.error('Error starting exam:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to start exam');
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl" data-testid="test-instructions-title">
            {test.name}
          </CardTitle>
          <CardDescription className="text-lg">{test.subject}</CardDescription>
          
          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{test.duration} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="font-semibold">{test.num_questions}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="font-semibold">{test.total_marks}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {test.description && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">About this test</h3>
              <p className="text-muted-foreground">{test.description}</p>
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <h2 className="text-xl font-bold mb-4">Instructions</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Please read all instructions carefully before starting the exam. Once started, the timer will begin and cannot be paused.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <ReactMarkdown>
                {test.instructions || ''}
              </ReactMarkdown>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-start space-x-3 mb-6">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                data-testid="agree-checkbox"
              />
              <label
                htmlFor="agree"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I have read and understood all the instructions. I am ready to start the exam.
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/student/dashboard/tests')}
                disabled={starting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartExam}
                disabled={!agreed || starting}
                data-testid="start-exam-button"
                className="flex-1"
              >
                {starting ? 'Starting...' : 'Start Exam'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
