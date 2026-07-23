'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setMessage(data.error || 'Failed to subscribe. Please try again.');
      } else {
        setMessage('🎉 Thank you for subscribing!');
        setEmail('');
      }
    } catch (err: any) {
      setLoading(false);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="bg-slate-900 text-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        
        <div className="space-y-2 text-center md:text-left w-full md:w-auto">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0" />
            Stay Informed
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Subscribe to get local updates on food surplus rescue initiatives, community impact metrics, and news in your city.
          </p>
        </div>

        <div className="w-full md:w-auto">
          {message ? (
            <div className="p-3 bg-green-900/60 border border-green-500 text-green-200 text-xs sm:text-sm rounded-xl text-center">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address..."
                className="bg-slate-800 text-white px-4 py-3 text-sm rounded-xl border border-slate-700 outline-none focus:border-green-500 w-full sm:w-64"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-500 text-white text-sm px-6 py-3 rounded-xl font-semibold transition w-full sm:w-auto shrink-0 shadow-md disabled:opacity-50"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}