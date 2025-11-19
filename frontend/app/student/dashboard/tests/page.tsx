'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, BookOpen, FileText, Play, CheckCircle, AlertCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Test {
  id: number;
  name: string;
  subject: string;
  duration: number;
  total_marks: number;
  num_questions: number;
  description?: string;
  created_at: string;
}

interface Attempt {
  session_id: number;
  test_id: number;
  test_name: string;
  subject: string;
  duration: number;
  total_marks: number;
  score: number | null;
  status: string;
  start_time: string;
  end_time: string | null;
}

export default function StudentTestsPage() {
  const router = useRouter();
  const [publishedTests, setPublishedTests] = useState<Test[]>([]);
  const [myAttempts, setMyAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testsResponse, attemptsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/exam/published-tests`, { withCredentials: true }),
        axios.get(`${API_URL}/api/exam/my-attempts`, { withCredentials: true }),
      ]);

      if (testsResponse.data.success) {
        setPublishedTests(testsResponse.data.data);
      }

      if (attemptsResponse.data.success) {
        setMyAttempts(attemptsResponse.data.data);
      }
    } catch (error: unknown) {
      console.error('Error fetching tests:', error);
      const axiosError = error as AxiosError;
      toast.error((axiosError.response?.data as { message?: string })?.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId: number) => {
    try {
      // Check for ongoing session
      const ongoingResponse = await axios.get(`${API_URL}/api/exam/test/${testId}/ongoing`, {
        withCredentials: true,
      });

      if (ongoingResponse.data.success && ongoingResponse.data.data) {
        // Resume existing session
        const sessionId = ongoingResponse.data.data.session.id;
        router.push(`/student/dashboard/tests/${sessionId}/attempt`);
      }
    } catch (error: unknown) {
      // If no ongoing session, go to instructions
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        router.push(`/student/dashboard/tests/test-instructions/${testId}`);
      } else {
        console.error('Error checking test status:', error);
        router.push(`/student/dashboard/tests/test-instructions/${testId}`);
      }
    }
  };

  const handleViewResult = (sessionId: number) => {
    router.push(`/student/dashboard/tests/${sessionId}/result`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="student-tests-title">
          Tests Portal
        </h1>
        <p className="text-muted-foreground mt-2">Browse and attempt available tests</p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="available" data-testid="available-tests-tab">
            Available Tests ({publishedTests.length})
          </TabsTrigger>
          <TabsTrigger value="attempts" data-testid="my-attempts-tab">
            My Attempts ({myAttempts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          {publishedTests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No tests available</h3>
                <p className="text-muted-foreground">
                  There are no published tests at the moment. Check back later!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onStart={() => handleStartTest(test.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="attempts" className="mt-6">
          {myAttempts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No attempts yet</h3>
                <p className="text-muted-foreground">
                  You haven&apos;t attempted any tests yet. Start with available tests!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAttempts.map((attempt) => (
                <AttemptCard
                  key={attempt.session_id}
                  attempt={attempt}
                  onViewResult={() => handleViewResult(attempt.session_id)}
                  onResume={() => router.push(`/student/dashboard/tests/${attempt.session_id}/attempt`)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TestCardProps {
  test: Test;
  onStart: () => void;
}

function TestCard({ test, onStart }: TestCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`test-card-${test.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge className="bg-green-500">Published</Badge>
        </div>
        <CardTitle className="text-xl mt-2">{test.name}</CardTitle>
        <CardDescription>{test.subject}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{test.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>{test.num_questions} questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span>{test.total_marks} marks</span>
          </div>
        </div>
        {test.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {test.description}
          </p>
        )}
        <Button
          className="w-full"
          onClick={onStart}
          data-testid={`start-test-${test.id}`}
        >
          <Play className="h-4 w-4 mr-2" />
          Start Test
        </Button>
      </CardContent>
    </Card>
  );
}

interface AttemptCardProps {
  attempt: Attempt;
  onViewResult: () => void;
  onResume: () => void;
}

function AttemptCard({ attempt, onViewResult, onResume }: AttemptCardProps) {
  const isCompleted = attempt.status === 'completed';
  const isInProgress = attempt.status === 'in_progress';
  const percentage = attempt.score !== null ? ((attempt.score / attempt.total_marks) * 100).toFixed(1) : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`attempt-card-${attempt.session_id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge className={isCompleted ? 'bg-green-500' : isInProgress ? 'bg-yellow-500' : 'bg-gray-500'}>
            {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : attempt.status}
          </Badge>
          {isCompleted && attempt.score !== null && (
            <Badge variant="outline" className="ml-2">
              {percentage}%
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl mt-2">{attempt.test_name}</CardTitle>
        <CardDescription>{attempt.subject}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Started: {new Date(attempt.start_time).toLocaleDateString()}</span>
          </div>
          {isCompleted && attempt.score !== null && (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Score: {attempt.score} / {attempt.total_marks}</span>
              </div>
            </>
          )}
          {isInProgress && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>Test in progress</span>
            </div>
          )}
        </div>
        {isCompleted ? (
          <Button
            className="w-full"
            variant="outline"
            onClick={onViewResult}
            data-testid={`view-result-${attempt.session_id}`}
          >
            View Result
          </Button>
        ) : isInProgress ? (
          <Button
            className="w-full"
            onClick={onResume}
            data-testid={`resume-test-${attempt.session_id}`}
          >
            Resume Test
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
