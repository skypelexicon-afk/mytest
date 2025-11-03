'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Question {
  id?: number;
  questionText: string;
  questionType: 'mcq' | 'multiple_correct' | 'true_false' | 'numerical';
  options: string[];
  correctAnswers: (number | string)[];
  marks: number;
  negativeMarks: number;
  explanation: string;
}

export default function QuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    questionText: '',
    questionType: 'mcq',
    options: ['', '', '', ''],
    correctAnswers: [],
    marks: 1,
    negativeMarks: 0,
    explanation: '',
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchTestAndQuestions();
  }, [testId]);

  const fetchTestAndQuestions = async () => {
    try {
      setLoading(true);
      const [testRes, questionsRes] = await Promise.all([
        axios.get(`/api/tests/${testId}`, { withCredentials: true }),
        axios.get(`/api/questions/test/${testId}`, { withCredentials: true }),
      ]);
      
      if (testRes.data.success) {
        setTest(testRes.data.data);
      }
      
      if (questionsRes.data.success) {
        const mappedQuestions = questionsRes.data.data.map((q: any) => ({
          id: q.id,
          questionText: q.question_text,
          questionType: q.question_type,
          options: q.options || [],
          correctAnswers: Array.isArray(q.correct_answers) ? q.correct_answers : [q.correct_answers],
          marks: q.marks,
          negativeMarks: q.negative_marks || 0,
          explanation: q.explanation || '',
        }));
        setQuestions(mappedQuestions);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch test data');
      router.push('/educator/dashboard/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionTypeChange = (type: string) => {
    let newOptions = currentQuestion.options;
    let newCorrectAnswers: (number | string)[] = [];

    if (type === 'true_false') {
      newOptions = ['True', 'False'];
    } else if (type === 'numerical') {
      newOptions = [];
    } else if (newOptions.length === 0) {
      newOptions = ['', '', '', ''];
    }

    setCurrentQuestion({
      ...currentQuestion,
      questionType: type as any,
      options: newOptions,
      correctAnswers: newCorrectAnswers,
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleCorrectAnswerToggle = (index: number) => {
    const { questionType, correctAnswers } = currentQuestion;
    let newCorrectAnswers: (number | string)[];

    if (questionType === 'mcq' || questionType === 'true_false') {
      newCorrectAnswers = [index];
    } else if (questionType === 'multiple_correct') {
      if (correctAnswers.includes(index)) {
        newCorrectAnswers = correctAnswers.filter((a) => a !== index);
      } else {
        newCorrectAnswers = [...correctAnswers, index];
      }
    } else {
      newCorrectAnswers = correctAnswers;
    }

    setCurrentQuestion({ ...currentQuestion, correctAnswers: newCorrectAnswers });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ''],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    const newCorrectAnswers = currentQuestion.correctAnswers.filter((a) => a !== index);
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctAnswers: newCorrectAnswers,
    });
  };

  const validateQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      toast.error('Question text is required');
      return false;
    }

    if (currentQuestion.questionType === 'numerical') {
      if (currentQuestion.correctAnswers.length === 0 || !currentQuestion.correctAnswers[0]) {
        toast.error('Correct answer is required for numerical questions');
        return false;
      }
    } else {
      if (currentQuestion.options.some((opt) => !opt.trim())) {
        toast.error('All options must be filled');
        return false;
      }

      if (currentQuestion.correctAnswers.length === 0) {
        toast.error('Please select at least one correct answer');
        return false;
      }
    }

    return true;
  };

  const saveQuestion = async () => {
    if (!validateQuestion()) return;

    try {
      const payload = {
        testId: parseInt(testId),
        questionText: currentQuestion.questionText,
        questionType: currentQuestion.questionType,
        options: currentQuestion.questionType === 'numerical' ? null : currentQuestion.options,
        correctAnswers: currentQuestion.correctAnswers,
        marks: currentQuestion.marks,
        negativeMarks: currentQuestion.negativeMarks,
        explanation: currentQuestion.explanation,
      };

      if (editingIndex !== null && questions[editingIndex].id) {
        const response = await axios.put(
          `/api/questions/${questions[editingIndex].id}`,
          payload,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          toast.success('Question updated successfully');
          await fetchTestAndQuestions();
        }
      } else {
        const response = await axios.post(
          '/api/questions/add',
          payload,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          toast.success('Question added successfully');
          await fetchTestAndQuestions();
        }
      }

      resetForm();
    } catch (error: any) {
      console.error('Error saving question:', error);
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const editQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const deleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await axios.delete(`/api/questions/${questionId}`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        toast.success('Question deleted successfully');
        await fetchTestAndQuestions();
      }
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast.error(error.response?.data?.message || 'Failed to delete question');
    }
  };

  const publishTest = async () => {
    if (questions.length !== test?.num_questions) {
      toast.error(`Please add exactly ${test?.num_questions} questions before publishing`);
      return;
    }

    if (!confirm('Are you sure you want to publish this test? You won\'t be able to edit it after publishing.')) {
      return;
    }

    try {
      const response = await axios.put(
        `/api/tests/${testId}/publish`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Test published successfully!');
        router.push('/educator/dashboard/tests');
      }
    } catch (error: any) {
      console.error('Error publishing test:', error);
      toast.error(error.response?.data?.message || 'Failed to publish test');
    }
  };

  const resetForm = () => {
    setCurrentQuestion({
      questionText: '',
      questionType: 'mcq',
      options: ['', '', '', ''],
      correctAnswers: [],
      marks: 1,
      negativeMarks: 0,
      explanation: '',
    });
    setEditingIndex(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
        data-testid="back-button"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tests
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{test?.name}</h1>
        <p className="text-muted-foreground mt-2">
          {questions.length} / {test?.num_questions} questions added
        </p>
      </div>

      {!showAddForm && (
        <div className="mb-6 flex justify-between items-center">
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
            data-testid="add-question-button"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
          {questions.length === test?.num_questions && test?.status === 'draft' && (
            <Button
              onClick={publishTest}
              variant="default"
              className="flex items-center gap-2"
              data-testid="publish-test-button"
            >
              <Send className="h-4 w-4" />
              Publish Test
            </Button>
          )}
        </div>
      )}

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingIndex !== null ? 'Edit' : 'Add'} Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={currentQuestion.questionType}
                onValueChange={handleQuestionTypeChange}
              >
                <SelectTrigger data-testid="question-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice (Single Answer)</SelectItem>
                  <SelectItem value="multiple_correct">Multiple Correct Answers</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="numerical">Numerical Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={currentQuestion.questionText}
                onChange={(e) =>
                  setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })
                }
                rows={4}
                placeholder="Enter your question..."
                data-testid="question-text-input"
              />
            </div>

            {currentQuestion.questionType !== 'numerical' && (
              <div className="space-y-4">
                <Label>Options</Label>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Checkbox
                      checked={currentQuestion.correctAnswers.includes(index)}
                      onCheckedChange={() => handleCorrectAnswerToggle(index)}
                      data-testid={`correct-answer-${index}`}
                    />
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                      data-testid={`option-${index}`}
                    />
                    {currentQuestion.questionType !== 'true_false' &&
                      currentQuestion.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                  </div>
                ))}
                {currentQuestion.questionType !== 'true_false' && (
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>
            )}

            {currentQuestion.questionType === 'numerical' && (
              <div className="space-y-2">
                <Label>Correct Answer *</Label>
                <Input
                  type="number"
                  step="any"
                  value={currentQuestion.correctAnswers[0] || ''}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      correctAnswers: [e.target.value],
                    })
                  }
                  placeholder="Enter the numerical answer"
                  data-testid="numerical-answer-input"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
                  type="number"
                  min="1"
                  value={currentQuestion.marks}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      marks: parseInt(e.target.value) || 1,
                    })
                  }
                  data-testid="marks-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Negative Marks</Label>
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  value={currentQuestion.negativeMarks}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      negativeMarks: parseFloat(e.target.value) || 0,
                    })
                  }
                  data-testid="negative-marks-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Explanation (Optional)</Label>
              <Textarea
                value={currentQuestion.explanation}
                onChange={(e) =>
                  setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })
                }
                rows={3}
                placeholder="Explain the correct answer..."
                data-testid="explanation-input"
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={saveQuestion} data-testid="save-question-button">
                <Save className="h-4 w-4 mr-2" />
                {editingIndex !== null ? 'Update' : 'Save'} Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id || index}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    Question {index + 1}
                    <span className="ml-4 text-sm font-normal text-muted-foreground">
                      ({question.marks} marks
                      {question.negativeMarks > 0 && `, -${question.negativeMarks} for wrong`})
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-2">{question.questionText}</CardDescription>
                </div>
                {test?.status === 'draft' && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editQuestion(index)}
                      data-testid={`edit-question-${index}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestion(question.id!)}
                      data-testid={`delete-question-${index}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {question.questionType === 'numerical' ? (
                <div className="text-sm">
                  <strong>Correct Answer:</strong> {question.correctAnswers[0]}
                </div>
              ) : (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg border ${
                        question.correctAnswers.includes(optIndex)
                          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>{' '}
                      {option}
                      {question.correctAnswers.includes(optIndex) && (
                        <span className="ml-2 text-green-600 dark:text-green-400 text-sm">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {question.explanation && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
