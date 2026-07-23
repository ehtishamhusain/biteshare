'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, recipient:profiles(full_name, organization_name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Please log in to submit a review.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('reviews').insert([
      {
        recipient_id: user.id,
        rating,
        comment,
      },
    ]);

    if (error) {
      alert('Error submitting review: ' + error.message);
    } else {
      setSuccess(true);
      setComment('');
      fetchReviews();
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900">Community Reviews & Feedback</h1>
          <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto">
            See what local community members and shelters are saying about BiteShare surplus food donors.
          </p>
        </div>

        {/* Leave a Review Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" /> Share Your Experience
          </h2>

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Thank you! Your review has been submitted.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Your Review / Thank You Note</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a brief thank-you note or review for local food donors..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-sm inline-flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Reviews</h2>

          {loading ? (
            <p className="text-slate-500 text-sm">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-500 text-sm">
              No reviews posted yet. Be the first to share your experience!
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {rev.recipient?.full_name || rev.recipient?.organization_name || 'Community Member'}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm mt-2">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}