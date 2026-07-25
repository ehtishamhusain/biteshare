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
  Layers,
} from 'lucide-react';

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

  // 🔢 Track recipient's chosen quantity for each bundle card
  const [selectedQuantities, setSelectedQuantities] = useState<{ [bundleId: string]: number }>({});

  // 🔐 Guest Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      const processedBundles = data
        .map((bundle) => {
          const remaining =
            bundle.quantity_remaining !== null && bundle.quantity_remaining !== undefined
              ? Number(bundle.quantity_remaining)
              : Number(bundle.quantity) || 0;

          return {
            ...bundle,
            quantity_remaining: remaining,
          };
        })
        .filter((bundle) => bundle.quantity_remaining > 0);

      setBundles(processedBundles);

      const initialQtyMap: { [key: string]: number } = {};
      processedBundles.forEach((b) => {
        initialQtyMap[b.id] = 1;
      });
      setSelectedQuantities(initialQtyMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBundles();

    const channel = supabase
      .channel('realtime_feed_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_bundles' },
        () => fetchBundles()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'claims' },
        () => fetchBundles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDirectQtyChange = (bundleId: string, inputVal: string, maxQty: number) => {
    if (inputVal === '') {
      setSelectedQuantities((prev) => ({ ...prev, [bundleId]: 0 }));
      return;
    }

    let parsed = parseInt(inputVal, 10);
    if (isNaN(parsed)) parsed = 1;
    if (parsed > maxQty) parsed = maxQty;

    setSelectedQuantities((prev) => ({ ...prev, [bundleId]: parsed }));
  };

  const handleSelectAll = (bundleId: string, maxQty: number) => {
    setSelectedQuantities((prev) => ({ ...prev, [bundleId]: maxQty }));
  };

  const handleClaim = async (bundle: any) => {
    const bundleId = bundle.id;
    const remainingQty = bundle.quantity_remaining;
    const rawSelectedQty = selectedQuantities[bundleId] || 1;
    const claimQty = Math.max(1, Math.min(rawSelectedQty, remainingQty));

    const pricePerUnit = bundle.price_per_item ?? bundle.price ?? 0;
    const bulkTotalPrice = bundle.price ?? 0;

    const isFullBatch = claimQty === remainingQty;
    const hasBulkDiscount =
      isFullBatch && bulkTotalPrice > 0 && bulkTotalPrice < claimQty * pricePerUnit;

    const totalPrice = hasBulkDiscount ? bulkTotalPrice : claimQty * pricePerUnit;

    // 💰 Calculate 10% BiteShare Platform Fee and 90% Store Payout
    const platformFee = totalPrice > 0 ? totalPrice * 0.10 : 0;
    const donorPayout = totalPrice > 0 ? totalPrice * 0.90 : 0;

    setClaimingId(bundleId);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setShowAuthModal(true);
      setClaimingId(null);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role === 'DONOR') {
      setMessage({ text: 'Donor accounts cannot claim food bundles.', type: 'error' });
      setClaimingId(null);
      return;
    }

    // Generate random 4-digit PIN
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

    // 1. Insert claim record with financial commission breakdown
    const { error: claimError } = await supabase.from('claims').insert({
      bundle_id: bundleId,
      recipient_id: user.id,
      claimed_quantity: claimQty,
      total_price: totalPrice,
      platform_fee: platformFee,   // ⚡ 10% Platform Commission
      donor_payout: donorPayout,   // ⚡ 90% Net Donor Payout
      pickup_pin: generatedPin,
      status: 'PENDING',
    });

    if (claimError) {
      setMessage({ text: 'Failed to claim bundle: ' + claimError.message, type: 'error' });
      setClaimingId(null);
      return;
    }

    // 2. Update food_bundles remaining stock
    const newRemaining = remainingQty - claimQty;
    const newStatus = newRemaining <= 0 ? 'CLAIMED' : 'AVAILABLE';

    await supabase
      .from('food_bundles')
      .update({
        quantity_remaining: newRemaining,
        status: newStatus,
      })
      .eq('id', bundleId);

    setMessage({
      text: `🎉 Reserved ${claimQty} item(s) for ₹${totalPrice}! PIN: ${generatedPin}. Check "My Claims" for details.`,
      type: 'success',
    });

    fetchBundles();
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
                Enter your required quantity or claim all available items at once.
              </p>
            </div>

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
            <MapView bundles={bundles} onClaim={(id) => handleClaim(bundles.find((b) => b.id === id))} />
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

              const remainingQty = bundle.quantity_remaining;
              const selectedQty = Math.max(1, Math.min(selectedQuantities[bundle.id] ?? 1, remainingQty));
              const pricePerUnit = bundle.price_per_item ?? bundle.price ?? 0;
              const bulkTotalPrice = bundle.price ?? 0;

              const isFullBatchSelected = selectedQty === remainingQty;
              const hasBulkDiscount =
                isFullBatchSelected && bulkTotalPrice > 0 && bulkTotalPrice < selectedQty * pricePerUnit;

              const calculatedTotal = hasBulkDiscount ? bulkTotalPrice : selectedQty * pricePerUnit;

              return (
                <motion.div
                  key={bundle.id}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Tag className="w-3.5 h-3.5" /> {remainingQty} Servings Left
                      </span>

                      <div className="text-right space-y-1">
                        <span
                          className={`font-black text-sm sm:text-base px-2.5 py-0.5 rounded-lg border inline-block ${
                            pricePerUnit === 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {pricePerUnit === 0 ? '🎁 FREE' : `₹${pricePerUnit} / item`}
                        </span>

                        {bulkTotalPrice > 0 && bulkTotalPrice < remainingQty * pricePerUnit && (
                          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            All {remainingQty} for ₹{bulkTotalPrice} Deal
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <Building className="w-3.5 h-3.5" />
                      <span>{businessName}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{bundle.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2">
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

                  <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Quantity</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Available: <span className="font-extrabold text-emerald-700">{remainingQty} items</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={remainingQty}
                          value={selectedQuantities[bundle.id] ?? 1}
                          onChange={(e) =>
                            handleDirectQtyChange(bundle.id, e.target.value, remainingQty)
                          }
                          className="w-16 px-2 py-1.5 text-center font-black text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />

                        <button
                          type="button"
                          onClick={() => handleSelectAll(bundle.id, remainingQty)}
                          className="px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl border border-emerald-300 transition shadow-xs"
                          title="Select all available items"
                        >
                          All ({remainingQty})
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaim(bundle)}
                      disabled={claimingId === bundle.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl transition shadow-sm hover:shadow disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                    >
                      {claimingId === bundle.id
                        ? 'Reserving...'
                        : calculatedTotal > 0
                        ? hasBulkDiscount
                          ? `💥 Claim All ${selectedQty} for ₹${calculatedTotal} (Bulk Discount!)`
                          : `Claim ${selectedQty} item(s) for ₹${calculatedTotal}`
                        : `Claim ${selectedQty} Free Item(s)`}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-6 z-10"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-emerald-200">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  Join BiteShare to Claim Food
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  To reserve surplus meals and receive your 4-digit pickup PIN, please log in or create a recipient account.
                </p>
              </div>

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