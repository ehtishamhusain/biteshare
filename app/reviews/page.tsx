'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Star,
  MessageSquare,
  Sparkles,
  UserPlus,
  LogIn,
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  User,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Review Form States
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 🔐 Guest Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchReviews();

    // ⚡ Supabase Realtime Listener for Reviews
    const channel = supabase
      .channel('realtime_reviews')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user:profiles(full_name, organization_name, role)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 🌟 IF GUEST (Not logged in): Show Auth Popup Modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!comment.trim()) {
      setMessage({ text: 'Please write a brief comment before submitting.', type: 'error' });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('reviews').insert([
      {
        user_id: user.id,
        rating,
        comment: comment.trim(),
      },
    ]);

    if (error) {
      setMessage({ text: 'Error posting review: ' + error.message, type: 'error' });
    } else {
      setMessage({ text: '🎉 Thank you! Your review has been shared with the community.', type: 'success' });
      setComment('');
      setRating(5);
      fetchReviews();
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <motion.div
          className="text-center space-y-3"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Community Feedback & Impact</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight"
          >
            What Our Community Says
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-slate-600 text-sm max-w-lg mx-auto">
            Read authentic experiences from local food donors, community members, and shelter partners across BiteShare.
          </motion.p>
        </motion.div>

        {/* ✍️ Write a Review Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-extrabold text-slate-900">Share Your Experience</h2>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-2xl font-semibold text-sm border flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-5">
            {/* Interactive Star Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating ?? rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-600">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Your Feedback / Review
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your pickup or donation experience with BiteShare?"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-6 rounded-xl transition shadow-md inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Posting Review...' : 'Post Community Review'}</span>
            </button>
          </form>
        </motion.div>

        {/* 🌟 Live Community Reviews List */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Recent Community Reviews</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              {reviews.length}
            </span>
          </h2>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-slate-500 text-sm">Loading community reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500 text-sm">
              No reviews posted yet. Be the first to share your experience!
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {reviews.map((rev) => {
                const reviewerName =
                  rev.user?.organization_name || rev.user?.full_name || 'Community Member';
                const role = rev.user?.role?.toUpperCase() === 'DONOR' ? 'Food Donor' : 'Recipient';

                return (
                  <motion.div
                    key={rev.id}
                    variants={fadeInUp}
                    whileHover={{ y: -3 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-slate-700 text-sm leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{reviewerName}</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">{role}</p>
                        </div>
                      </div>

                      <span>
                        {new Date(rev.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* 🔴 GUEST AUTH POPUP MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-6 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-emerald-200">
                <Lock className="w-8 h-8" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  Join BiteShare to Leave a Review
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Please log in or create an account to post your review and share feedback with our community.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Link
                  href="/signup"
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </Link>

                <Link
                  href="/login"
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>Log In to Existing Account</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}