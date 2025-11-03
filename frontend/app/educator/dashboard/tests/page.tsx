'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, BookOpen, FileText, Edit, Trash2, Eye } from 'lucide-react';
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
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

export default function TestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tests/my-tests', {
        withCredentials: true,
      });
      
      if (response.data.success) {
        setTests(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching tests:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (id: number) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      const response = await axios.delete(`/api/tests/${id}`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        toast.success('Test deleted successfully');
        fetchTests();
      }
    } catch (error: any) {
      console.error('Error deleting test:', error);
      toast.error(error.response?.data?.message || 'Failed to delete test');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'published':
        return 'bg-green-500';
      case 'archived':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Test Portal</h1>
          <p className="text-muted-foreground mt-2">Create and manage your tests</p>
        </div>
        <Button 
          onClick={() => router.push('/educator/dashboard/tests/create')}
          className="flex items-center gap-2"
          data-testid="create-test-button"
        >
          <Plus className="h-4 w-4" />
          Create New Test
        </Button>
      </div>

      {tests.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No tests yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first test to get started with the exam portal
            </p>
            <Button onClick={() => router.push('/educator/dashboard/tests/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getStatusColor(test.status)}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/educator/dashboard/tests/${test.id}/questions`)}
                      data-testid={`edit-test-${test.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTest(test.id)}
                      data-testid={`delete-test-${test.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl">{test.name}</CardTitle>
                <CardDescription>{test.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
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
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {test.description}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/educator/dashboard/tests/${test.id}/instructions`)}
                    data-testid={`edit-instructions-${test.id}`}
                  >
                    Instructions
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/educator/dashboard/tests/${test.id}/questions`)}
                    data-testid={`manage-questions-${test.id}`}
                  >
                    Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
