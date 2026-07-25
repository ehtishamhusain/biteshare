'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Utensils,
  MapPin,
  Clock,
  Tag,
  RefreshCw,
  List,
  Map as MapIcon,
  Sparkles,
  Building,
  UserPlus,
  LogIn,
  X,
  Lock,
} from 'lucide-react';

// ⚡ Dynamically import MapView with SSR disabled
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-100 rounded-3xl animate-pulse flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      <span>Loading Interactive Map...</span>
    </div>
  ),
});

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

export default function FeedPage() {
  const router = useRouter();
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 🔐 Guest Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 🛡️ Auto-redirect Donors away from recipient feed
  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'DONOR') {
          router.push('/donor/dashboard');
        }
      }
    };

    checkRoleAndRedirect();
  }, [router]);

  const fetchBundles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('food_bundles')
      .select('*, donor:profiles(organization_name, full_name)')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBundles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBundles();

    // ⚡ Supabase Realtime Listener
    const channel = supabase
      .channel('realtime_food_bundles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_bundles' },
        () => {
          fetchBundles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClaim = async (bundleId: string) => {
    setClaimingId(bundleId);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 🌟 If guest (not logged in), pop up the Guest Auth Modal instead of an error message
    if (!user) {
      setShowAuthModal(true);
      setClaimingId(null);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'DONOR') {
      setMessage({ text: 'Donor accounts cannot claim food bundles.', type: 'error' });
      setClaimingId(null);
      return;
    }

    const { error: claimError } = await supabase
      .from('claims')
      .insert([{ bundle_id: bundleId, recipient_id: user.id, status: 'PENDING' }]);

    if (claimError) {
      setMessage({ text: 'Failed to claim bundle: ' + claimError.message, type: 'error' });
      setClaimingId(null);
      return;
    }

    await supabase
      .from('food_bundles')
      .update({ status: 'CLAIMED' })
      .eq('id', bundleId);

    setMessage({
      text: '🎉 Food bundle reserved successfully! Check "My Claims" for details.',
      type: 'success',
    });
    setBundles((prev) => prev.filter((b) => b.id !== bundleId));
    setClaimingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/30 backdrop-blur-md border border-emerald-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" /> Realtime Live Feed
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Active Surplus Food Near You</h1>
              <p className="text-emerald-100 text-sm sm:text-base mt-1">
                Real-time surplus offerings from local bakeries, restaurants, and grocery stores.
              </p>
            </div>

            {/* List / Map View Switcher */}
            <div className="flex bg-emerald-800/50 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-500/30">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  viewMode === 'list'
                    ? 'bg-white text-emerald-800 shadow-md'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" /> List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  viewMode === 'map'
                    ? 'bg-white text-emerald-800 shadow-md'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                <MapIcon className="w-4 h-4" /> Map View
              </button>
            </div>
          </div>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl font-semibold text-sm border shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* View Selection */}
        {viewMode === 'map' ? (
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
            <MapView bundles={bundles} onClaim={handleClaim} />
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-medium">Loading live surplus food listings...</p>
          </div>
        ) : bundles.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-3">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No active food bundles found</h3>
            <p className="text-slate-500 text-sm">
              Check back shortly! New surplus food listings appear here automatically in real time.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {bundles.map((bundle) => {
              const businessName =
                bundle.donor?.organization_name ||
                bundle.donor?.full_name ||
                'Local Food Business';

              return (
                <motion.div
                  key={bundle.id}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Tag className="w-3.5 h-3.5" /> Qty: {bundle.quantity}
                      </span>
                      <span
                        className={`font-black text-lg px-3 py-0.5 rounded-lg border ${
                          bundle.price === 0 || !bundle.price
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {bundle.price === 0 || !bundle.price ? '🎁 FREE' : `₹${bundle.price}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{businessName}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">{bundle.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {bundle.description || 'Fresh surplus food available for pickup.'}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {bundle.address || 'Pickup address provided upon reservation'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          Closes:{' '}
                          {new Date(bundle.pickup_window_end).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={() => handleClaim(bundle.id)}
                      disabled={claimingId === bundle.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl transition shadow-sm hover:shadow disabled:opacity-50 text-sm"
                    >
                      {claimingId === bundle.id
                        ? 'Reserving...'
                        : bundle.price > 0
                        ? `Reserve Bundle (₹${bundle.price})`
                        : 'Claim Free Bundle'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* 🌟 GUEST AUTH POPUP MODAL */}
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
                  Join BiteShare to Claim Food
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  To reserve surplus meals and receive your 4-digit pickup PIN, please log in or create a recipient account.
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
                  <span>Create Recipient Account</span>
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