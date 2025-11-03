'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function InstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [testName, setTestName] = useState('');

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tests/${testId}`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        setTestName(response.data.data.name);
        setInstructions(response.data.data.instructions || '');
      }
    } catch (error: any) {
      console.error('Error fetching test:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch test');
      router.push('/educator/dashboard/tests');
    } finally {
      setLoading(false);
    }
  };

  const saveInstructions = async () => {
    try {
      setSaving(true);
      const response = await axios.put(
        `/api/tests/${testId}/instructions`,
        { instructions },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Instructions saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving instructions:', error);
      toast.error(error.response?.data?.message || 'Failed to save instructions');
    } finally {
      setSaving(false);
    }
  };

  const proceedToQuestions = () => {
    router.push(`/educator/dashboard/tests/${testId}/questions`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
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
          <CardTitle>Test Instructions</CardTitle>
          <CardDescription>
            {testName} - Edit the instructions that will be shown to students before they start the test.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={20}
              className="font-mono text-sm"
              placeholder="Enter test instructions in Markdown format..."
              data-testid="instructions-input"
            />
            <p className="text-sm text-muted-foreground">
              You can use Markdown formatting for headings, lists, bold text, etc.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              variant="outline"
              onClick={saveInstructions}
              disabled={saving}
              className="flex items-center gap-2"
              data-testid="save-instructions"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Instructions'}
            </Button>
            <Button
              onClick={proceedToQuestions}
              data-testid="proceed-to-questions"
            >
              Proceed to Add Questions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {instructions.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
              } else if (line.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold mt-3 mb-2">{line.slice(3)}</h2>;
              } else if (line.startsWith('   - ') || line.startsWith('- ')) {
                return <li key={i} className="ml-6">{line.replace(/^\s*-\s*/, '')}</li>;
              } else if (line.trim()) {
                return <p key={i} className="mb-2">{line}</p>;
              }
              return <br key={i} />;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
