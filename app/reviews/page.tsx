'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Star, MessageSquare, Send, CheckCircle2, Sparkles } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5 } 
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

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
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          className="text-center space-y-3"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Community Feedback</span>
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Donor Reviews & Thank You Notes
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-slate-600 text-sm max-w-lg mx-auto">
            See what local community members and shelters are saying about BiteShare surplus food donors.
          </motion.p>
        </motion.div>

        {/* Leave a Review Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" /> Share Your Experience
          </h2>

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl mb-6 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Thank you! Your review has been submitted.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
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
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 text-sm bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-8 rounded-xl transition shadow-md inline-flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </form>
        </motion.div>

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Community Feedback</h2>

          {loading ? (
            <p className="text-slate-500 text-sm">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl text-center border border-slate-200 text-slate-500 text-sm">
              No reviews posted yet. Be the first to share your experience!
            </div>
          ) : (
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {reviews.map((rev) => (
                <motion.div
                  key={rev.id}
                  variants={fadeInUp}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2"
                >
                  <div className="flex justify-between items-start">
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
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{rev.comment}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}