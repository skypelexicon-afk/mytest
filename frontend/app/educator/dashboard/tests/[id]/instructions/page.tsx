'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, BookOpen, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

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
  const testId = params.testId;
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [hasOngoingSession, setHasOngoingSession] = useState(false);
  const [ongoingSessionId, setOngoingSessionId] = useState<number | null>(null);

  useEffect(() => {
    fetchTestInstructions();
    checkOngoingSession();
  }, [testId]);

  const checkOngoingSession = async () => {
    try {
      const response = await axios.get(`/api/exam/test/${testId}/ongoing`, {
        withCredentials: true,
      });
      if (response.data.success && response.data.data) {
        setHasOngoingSession(true);
        setOngoingSessionId(response.data.data.session_id);
      }
    } catch (error: any) {
      // No ongoing session
      console.log('No ongoing session');
    }
  };

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
      toast.error(error.response?.data?.message || 'Failed to fetch test details');
      router.push('/student/dashboard/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (!agreed) {
      toast.error('Please agree to the instructions to continue');
      return;
    }

    try {
      setStarting(true);
      const response = await axios.post(
        '/api/exam/start',
        { testId },
        { withCredentials: true }
      );

      if (response.data.success) {
        const sessionId = response.data.data.session_id;
        toast.success('Test started successfully!');
        router.push(`/student/dashboard/tests/${testId}/attempt?sessionId=${sessionId}`);
      }
    } catch (error: any) {
      console.error('Error starting test:', error);
      toast.error(error.response?.data?.message || 'Failed to start test');
    } finally {
      setStarting(false);
    }
  };

  const handleResumeTest = () => {
    if (ongoingSessionId) {
      router.push(`/student/dashboard/tests/${testId}/attempt?sessionId=${ongoingSessionId}`);
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

  const defaultInstructions = `
## General Instructions

1. **Duration**: This test has a total duration of ${test.duration} minutes.
2. **Total Questions**: The test contains ${test.num_questions} questions.
3. **Total Marks**: The maximum marks for this test is ${test.total_marks}.

## Important Points

- All questions are compulsory.
- Each question has only one correct answer.
- There is no negative marking for incorrect answers.
- You can mark questions for review and come back to them later.
- Your answers are saved automatically.
- Once submitted, you cannot change your answers.

## Navigation

- Use the question palette on the left to navigate between questions.
- Green: Answered
- Orange: Marked for Review
- White: Not Visited
- Red: Not Answered

## Timer

- A countdown timer will be displayed throughout the test.
- The test will auto-submit when time runs out.

## Good Luck! 🎓
  `;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl" data-testid="test-instructions-title">
            {test.name}
          </CardTitle>
          <p className="text-muted-foreground">{test.subject}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
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

          {/* Description */}
          {test.description && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm">{test.description}</p>
            </div>
          )}

          {/* Ongoing Session Warning */}
          {hasOngoingSession && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800">Ongoing Test Found</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You have an ongoing test session. You can resume it or start a new attempt.
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="prose prose-sm max-w-none">
            <div 
              className="whitespace-pre-wrap text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: test.instructions || defaultInstructions 
              }}
            />
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start space-x-2 p-4 border rounded-lg">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              data-testid="agree-checkbox"
            />
            <label
              htmlFor="agreement"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I have read and understood all the instructions. I am ready to begin the test.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/student/dashboard/tests')}
              data-testid="back-button"
            >
              Back to Tests
            </Button>
            <div className="flex gap-2">
              {hasOngoingSession && (
                <Button
                  variant="secondary"
                  onClick={handleResumeTest}
                  data-testid="resume-test-button"
                >
                  Resume Test
                </Button>
              )}
              <Button
                onClick={handleStartTest}
                disabled={!agreed || starting}
                data-testid="start-exam-button"
              >
                {starting ? 'Starting...' : 'Start New Attempt'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
