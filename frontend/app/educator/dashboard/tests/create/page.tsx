'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/doFetch';

export default function CreateTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    duration: '',
    totalMarks: '',
    numQuestions: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subject || !formData.duration || !formData.totalMarks || !formData.numQuestions) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetchApi.post<typeof formData, { success: boolean; message: string; data: { id: number } }>(
        'api/tests/create',
        formData
      );
      
      if (response.success) {
        toast.success('Test created successfully!');
        router.push(`/educator/dashboard/tests/${response.data.id}/instructions`);
      }
    } catch (error: any) {
      console.error('Error creating test:', error);
      toast.error(error.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
        data-testid="back-button"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tests
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Test</CardTitle>
          <CardDescription>
            Fill in the basic details for your test. You can add instructions and questions in the next steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Test Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Mathematics Mid-Term Exam"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="test-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Physics, Chemistry"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                data-testid="test-subject-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  placeholder="90"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  data-testid="test-duration-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks *</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                  required
                  data-testid="test-marks-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numQuestions">No. of Questions *</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  placeholder="50"
                  value={formData.numQuestions}
                  onChange={(e) => setFormData({ ...formData, numQuestions: e.target.value })}
                  required
                  data-testid="test-questions-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the test..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="test-description-input"
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                data-testid="create-test-submit"
              >
                {loading ? 'Creating...' : 'Create Test'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
