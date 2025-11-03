'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/doFetch';

interface Props {
  courseId: number;
}

interface FetchError {
  message?: string;
}

const FaqForm: React.FC<Props> = ({ courseId }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setMessage(null);
    setError(null);

    if (!question || !answer) {
      setError('Both fields are required');
      return;
    }

    try {
      await fetchApi.post(`api/courses/${courseId}/faqs`, {
        question,
        answer,
        courseId,
      });

      setMessage('FAQ submitted for approval');
      setQuestion('');
      setAnswer('');
    } catch (err) {
      const typedErr = err as FetchError;
      setError(typedErr.message || 'Error creating FAQ');
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-lg hover:shadow-2xl">
      <h2 className="text-xl font-bold mb-4">Add FAQ</h2>

      {message && <p className="mb-2 text-green-600">{message}</p>}
      {error && <p className="mb-2 text-red-600">{error}</p>}

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        className="w-full mb-2 p-2 border rounded"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Answer"
        className="w-full mb-2 p-2 border rounded"
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Submit FAQ
      </button>
    </div>
  );
};

export default FaqForm;
