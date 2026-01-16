'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function CaptureForm({ onIdeaSubmitted }: { onIdeaSubmitted?: (idea: string) => void }) {
  const { data: session } = useSession();
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idea.trim()) {
      setMessage('Please enter an idea');
      return;
    }

    if (!session?.user?.email) {
      setMessage('User session not found');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Call Convex API to save the idea to the database
      const response = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: idea.trim(),
          email: session.user.email,
          clientMessageId: `${Date.now()}-${Math.random()}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Idea saved to database:', result);
      
      // Notify parent component
      if (onIdeaSubmitted) {
        onIdeaSubmitted(idea.trim());
      }

      setMessage('✅ Idea captured and saved to database!');
      setIdea('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting idea:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to save idea'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
          💡 Capture Your Idea
        </label>
        <textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="What's on your mind? Share an idea, project, person, or anything worth remembering..."
          disabled={isSubmitting}
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.startsWith('✅')
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !idea.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isSubmitting ? '⏳ Processing...' : '📤 Capture Idea'}
      </button>
    </form>
  );
}
