'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Clock, BookOpen, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Test {
  id: number;
  name: string;
  subject: string;
  duration: number;
  total_marks: number;
  num_questions: number;
  description?: string;
  instructions: string;
}

export default function TestInstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id;

  const [test, setTest] = useState<Test | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchTestInstructions();
  }, [testId]);

  const fetchTestInstructions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/exam/test/${testId}/instructions`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setTest(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching test instructions:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch test instructions');
      router.push('/student/dashboard/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!agreed) {
      toast.error('Please agree to the instructions before starting');
      return;
    }

    try {
      setStarting(true);
      
      // Check if there's an ongoing session
      const ongoingResponse = await axios.get(`/api/exam/test/${testId}/ongoing`, {
        withCredentials: true,
      });

      if (ongoingResponse.data.success) {
        // Resume existing session
        toast.info('Resuming your exam...');
        router.push(`/student/dashboard/tests/${testId}/attempt`);
        return;
      }
    } catch (error: any) {
      // No ongoing session, start new one
      if (error.response?.status === 404) {
        try {
          const response = await axios.post(
            '/api/exam/start',
            { testId: parseInt(testId as string) },
            { withCredentials: true }
          );

          if (response.data.success) {
            toast.success('Exam started successfully!');
            router.push(`/student/dashboard/tests/${testId}/attempt`);
          }
        } catch (startError: any) {
          console.error('Error starting exam:', startError);
          toast.error(startError.response?.data?.message || 'Failed to start exam');
        }
      } else {
        console.error('Error checking ongoing session:', error);
        toast.error('Failed to start exam');
      }
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
      <Button
        variant="ghost"
        onClick={() => router.push('/student/dashboard/tests')}
        className="mb-6"
        data-testid="back-button"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tests
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl" data-testid="test-title">{test.name}</CardTitle>
          <CardDescription>{test.subject}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{test.duration} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="font-semibold">{test.num_questions}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="font-semibold">{test.total_marks}</p>
              </div>
            </div>
          </div>
          {test.description && (
            <p className="text-muted-foreground">{test.description}</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert" data-testid="test-instructions">
            <ReactMarkdown>{test.instructions}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
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
              I have read and understood all the instructions. I am ready to begin the test.
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
