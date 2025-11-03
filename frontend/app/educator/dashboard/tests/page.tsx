'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, BookOpen, FileText, Plus, Edit, Trash2, Eye } from 'lucide-react';
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
  status: string;
  created_at: string;
}


export default function EducatorTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; testId: number | null }>({
    open: false,
    testId: null,
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tests/my-tests', { withCredentials: true });

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

  const handleDeleteTest = async () => {
    if (!deleteDialog.testId) return;

    try {
      const response = await axios.delete(`/api/tests/${deleteDialog.testId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success('Test deleted successfully');
        fetchTests();
      }
    } catch (error: any) {
      console.error('Error deleting test:', error);
      toast.error(error.response?.data?.message || 'Failed to delete test');
    } finally {
      setDeleteDialog({ open: false, testId: null });
    }
  };

  const draftTests = tests.filter((t) => t.status === 'draft');
  const publishedTests = tests.filter((t) => t.status === 'published');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="educator-tests-title">
            My Tests
          </h1>
          <p className="text-muted-foreground mt-2">Create and manage your tests</p>
        </div>
        <Button
          onClick={() => router.push('/educator/dashboard/tests/create')}
          data-testid="create-test-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Test
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all" data-testid="all-tests-tab">
            All Tests ({tests.length})
          </TabsTrigger>
          <TabsTrigger value="draft" data-testid="draft-tests-tab">
            Draft ({draftTests.length})
          </TabsTrigger>
          <TabsTrigger value="published" data-testid="published-tests-tab">
            Published ({publishedTests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {tests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No tests yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start creating tests for your students
                </p>
                <Button onClick={() => router.push('/educator/dashboard/tests/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Test
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onEdit={() => router.push(`/educator/dashboard/tests/${test.id}/questions`)}
                  onDelete={() => setDeleteDialog({ open: true, testId: test.id })}
                  onPreview={() => router.push(`/educator/dashboard/tests/${test.id}/attempt`)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          {draftTests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No draft tests</h3>
                <p className="text-muted-foreground">All your tests are published</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onEdit={() => router.push(`/educator/dashboard/tests/${test.id}/questions`)}
                  onDelete={() => setDeleteDialog({ open: true, testId: test.id })}
                  onPreview={() => router.push(`/educator/dashboard/tests/${test.id}/attempt`)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          {publishedTests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No published tests</h3>
                <p className="text-muted-foreground">
                  Publish your draft tests to make them available to students
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onEdit={() => router.push(`/educator/dashboard/tests/${test.id}/questions`)}
                  onDelete={() => setDeleteDialog({ open: true, testId: test.id })}
                  onPreview={() => router.push(`/educator/dashboard/tests/${test.id}/attempt`)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, testId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test and all associated questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTest} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface TestCardProps {
  test: Test;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

function TestCard({ test, onEdit, onDelete, onPreview }: TestCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`test-card-${test.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge
            className={test.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}
          >
            {test.status === 'published' ? 'Published' : 'Draft'}
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
            onClick={onEdit}
            data-testid={`edit-test-${test.id}`}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            data-testid={`preview-test-${test.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
            data-testid={`delete-test-${test.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
