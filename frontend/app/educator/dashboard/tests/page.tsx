'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, BookOpen, FileText, Play, CheckCircle, XCircle } from 'lucide-react';
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
  created_at: string;
}

interface Attempt {
  session_id: number;
  test_id: number;
  test_name: string;
  subject: string;
  duration: number;
  total_marks: number;
  score: number;
  status: string;
  start_time: string;
  end_time?: string;
}

export default function StudentTestsPage() {
  const router = useRouter();
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [myAttempts, setMyAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch available tests and attempts in parallel
      const [testsResponse, attemptsResponse] = await Promise.all([
        axios.get('/api/exam/published-tests', { withCredentials: true }),
        axios.get('/api/exam/my-attempts', { withCredentials: true })
      ]);

      if (testsResponse.data.success) {
        setAvailableTests(testsResponse.data.data);
      }

      if (attemptsResponse.data.success) {
        setMyAttempts(attemptsResponse.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId: number) => {
    router.push(`/student/dashboard/tests/${testId}/instructions`);
  };

  const handleViewResult = (sessionId: number) => {
    router.push(`/student/dashboard/tests/result/${sessionId}`);
  };

  const getScoreColor = (score: number, totalMarks: number) => {
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
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
        <h1 className="text-3xl font-bold" data-testid="student-tests-title">Test Portal</h1>
        <p className="text-muted-foreground mt-2">Attempt tests and view your results</p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="available" data-testid="available-tests-tab">
            Available Tests
          </TabsTrigger>
          <TabsTrigger value="attempts" data-testid="my-attempts-tab">
            My Attempts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          {availableTests.length === 0 ? (
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
              {availableTests.map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow" data-testid={`test-card-${test.id}`}>
                  <CardHeader>
                    <Badge className="w-fit mb-2 bg-blue-500">Available</Badge>
                    <CardTitle className="text-xl">{test.name}</CardTitle>
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
                        <FileText className="h-4 w-4 text-muted-foreground" />
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
                      onClick={() => handleStartTest(test.id)}
                      data-testid={`start-test-${test.id}`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Test
                    </Button>
                  </CardContent>
                </Card>
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
                  You haven't attempted any tests yet. Start your first test from the Available Tests tab!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myAttempts.map((attempt) => (
                <Card key={attempt.session_id} className="hover:shadow-lg transition-shadow" data-testid={`attempt-card-${attempt.session_id}`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{attempt.test_name}</h3>
                          {attempt.status === 'completed' && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {attempt.status === 'in_progress' && (
                            <Badge className="bg-yellow-500">
                              In Progress
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{attempt.subject}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{attempt.duration} min</span>
                          </div>
                          {attempt.status === 'completed' && (
                            <>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">Score:</span>
                                <span className={`font-semibold ${getScoreColor(attempt.score, attempt.total_marks)}`}>
                                  {attempt.score} / {attempt.total_marks}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">Percentage:</span>
                                <span className="font-semibold">
                                  {((attempt.score / attempt.total_marks) * 100).toFixed(2)}%
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Started: {new Date(attempt.start_time).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {attempt.status === 'completed' && (
                          <Button
                            onClick={() => handleViewResult(attempt.session_id)}
                            data-testid={`view-result-${attempt.session_id}`}
                          >
                            View Result
                          </Button>
                        )}
                        {attempt.status === 'in_progress' && (
                          <Button
                            onClick={() => router.push(`/student/dashboard/tests/${attempt.test_id}/attempt`)}
                            data-testid={`resume-test-${attempt.session_id}`}
                          >
                            Resume Test
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
