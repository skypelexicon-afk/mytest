'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, FileText, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/doFetch';

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

export default function EducatorTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetchApi.get<{ success: boolean; data: Test[] }>('api/tests/my-tests');
      
      if (response.success) {
        setTests(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching tests:', error);
      toast.error(error.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetchApi.delete<{}, { success: boolean; message: string }>(
        `api/tests/${testId}`,
        {}
      );
      
      if (response.success) {
        toast.success('Test deleted successfully');
        fetchTests(); // Refresh list
      }
    } catch (error: any) {
      console.error('Error deleting test:', error);
      toast.error(error.message || 'Failed to delete test');
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="educator-tests-title">
            My Tests
          </h1>
          <p className="text-muted-foreground mt-2">Manage your tests and assessments</p>
        </div>
        <Button 
          onClick={() => router.push('/educator/dashboard/tests/create')}
          data-testid="create-test-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Test
        </Button>
      </div>

      {tests.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No tests yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first test to get started!
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
            <TestCard
              key={test.id}
              test={test}
              onDelete={() => handleDeleteTest(test.id)}
              onEdit={() => router.push(`/educator/dashboard/tests/${test.id}/questions`)}
              onView={() => router.push(`/educator/dashboard/tests/${test.id}/instructions`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TestCardProps {
  test: Test;
  onDelete: () => void;
  onEdit: () => void;
  onView: () => void;
}

function TestCard({ test, onDelete, onEdit, onView }: TestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'draft':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`test-card-${test.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge className={getStatusColor(test.status)}>
            {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
          </Badge>
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
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{test.total_marks} marks</span>
          </div>
        </div>
        {test.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {test.description}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onView}
            data-testid={`view-test-${test.id}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onEdit}
            data-testid={`edit-test-${test.id}`}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            data-testid={`delete-test-${test.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
