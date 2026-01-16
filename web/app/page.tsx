'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CaptureForm } from './components/CaptureForm';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recentIdeas, setRecentIdeas] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Load recent ideas from localStorage (for now, until Convex is fully integrated)
    const stored = localStorage.getItem('recentIdeas');
    if (stored) {
      setRecentIdeas(JSON.parse(stored));
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">DendwriteAI</h1>
            <p className="text-gray-600 mt-1">Capture & Classify Your Ideas</p>
          </div>
          <div className="text-right">
            <p className="text-gray-700 font-medium">{session.user?.name || session.user?.email}</p>
            <button
              onClick={() => signOut({ redirect: true, redirectTo: '/auth/signin' })}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Capture Form - Main Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <CaptureForm onIdeaSubmitted={(idea) => {
                // Add new idea to recent list
                const updated = [{ text: idea, timestamp: new Date().toISOString(), status: 'pending' }, ...recentIdeas].slice(0, 5);
                setRecentIdeas(updated);
                localStorage.setItem('recentIdeas', JSON.stringify(updated));
              }} />
            </div>

            {/* Recent Ideas List */}
            {recentIdeas.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Recent Ideas</h2>
                <div className="space-y-3">
                  {recentIdeas.map((idea, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-700 flex-1">{idea.text}</p>
                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          idea.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          idea.status === 'classified' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {idea.status === 'pending' ? '⏳ Pending' :
                           idea.status === 'classified' ? '✅ Classified' :
                           '❌ Error'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{new Date(idea.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Panel - Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Status</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 text-sm">✅ System Ready</h3>
                  <p className="text-green-700 text-xs mt-1">Next.js + Convex + NextAuth</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 text-sm">🔐 Authenticated</h3>
                  <p className="text-blue-700 text-xs mt-1">30-day persistent session</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 text-sm">🤖 AI Ready</h3>
                  <p className="text-purple-700 text-xs mt-1">Anthropic API configured</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-orange-800 text-sm">📤 Ideas Captured</h3>
                  <p className="text-orange-700 text-xs mt-1">{recentIdeas.length} in session</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">ℹ️ How It Works</h2>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Type your idea</li>
                <li>Click "Capture Idea"</li>
                <li>AI classifies automatically</li>
                <li>Check status above ⬆️</li>
              </ol>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🔧 Debug Info</h2>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>User:</strong> {session.user?.email}</p>
                <p><strong>Tenant:</strong> {session.user?.tenantId}</p>
                <p><strong>Session:</strong> JWT + Cookies</p>
                <p className="text-green-600 mt-2">✓ All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
