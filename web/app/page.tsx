'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const allCaptures = useQuery(api.captures.getCaptures);
  const submitCapture = useMutation(api.captures.submitCapture);
  const classifyAllPending = useMutation(api.process.classifyAllPending);

  // Filter to show only pending captures
  const captures = allCaptures?.filter(c => c.status === 'pending') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const clientMessageId = crypto.randomUUID();
      await submitCapture({
        text: input,
        clientMessageId,
      });
      setInput('');
    } catch (error) {
      console.error('Error submitting capture:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassifyAll = async () => {
    setClassifying(true);
    try {
      const result = await classifyAllPending();
      console.log('Classification results:', result);
    } catch (error) {
      console.error('Error classifying:', error);
    } finally {
      setClassifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">DendwriteAI</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's your big idea? Share anything..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Processing...' : 'Capture Idea'}
          </button>
        </form>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Pending Captures</h2>
            <button
              onClick={handleClassifyAll}
              disabled={classifying || captures.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
            >
              {classifying ? 'Classifying...' : 'Classify All'}
            </button>
          </div>
          {captures && captures.length > 0 ? (
            <div className="space-y-4">
              {captures.map((capture) => (
                <div key={capture._id} className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-700">{capture.text}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    Status: <span className="font-semibold">{capture.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No captures pending. Add an idea!</p>
          )}
        </div>
      </div>
    </div>
  );
}
