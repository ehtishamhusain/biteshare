'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Utensils,
  KeyRound,
  XCircle,
  AlertTriangle,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function MyClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Counter Rejection Modal States
  const [rejectingClaim, setRejectingClaim] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchMyClaims = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push('/login');
      return;
    }

    // Primary joined query
    let { data, error } = await supabase
      .from('claims')
      .select('*, bundle:food_bundles(*, donor:profiles(organization_name, full_name, street_address, city, phone))')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });

    // Fallback standalone query engine
    if (error || !data || data.length === 0) {
      const fallbackClaimsRes = await supabase
        .from('claims')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (!fallbackClaimsRes.error && fallbackClaimsRes.data && fallbackClaimsRes.data.length > 0) {
        const rawClaims = fallbackClaimsRes.data;

        const bundleIds = rawClaims.map((c) => c.bundle_id).filter(Boolean);
        if (bundleIds.length > 0) {
          const { data: bundlesData } = await supabase
            .from('food_bundles')
            .select('*')
            .in('id', bundleIds);

          const bundleMap = new Map();
          (bundlesData || []).forEach((b) => bundleMap.set(b.id, b));

          const donorIds = (bundlesData || []).map((b) => b.donor_id).filter(Boolean);
          const donorMap = new Map();
          if (donorIds.length > 0) {
            const { data: donorsData } = await supabase
              .from('profiles')
              .select('id, organization_name, full_name, street_address, city, phone')
              .in('id', donorIds);
            (donorsData || []).forEach((d) => donorMap.set(d.id, d));
          }

          data = rawClaims.map((claim) => {
            const b = bundleMap.get(claim.bundle_id) || {};
            const d = donorMap.get(b.donor_id) || {};
            return {
              ...claim,
              bundle: {
                ...b,
                donor: d,
              },
            };
          });
        } else {
          data = rawClaims;
        }
      }
    }

    const nowTime = new Date().getTime();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    // Process status, expiration, and 24-hour auto-purge filter
    const processedClaims = (data || [])
      .map((claim) => {
        const bundle = claim.bundle || {};
        const isCompleted = claim.status === 'COMPLETED';
        const isCancelled = claim.status === 'CANCELLED';
        const isExplicitExpired = claim.status === 'EXPIRED';

        const pickupDeadline = bundle.pickup_window_end || bundle.expires_at;
        const isDeadlinePassed = pickupDeadline
          ? new Date(pickupDeadline).getTime() < nowTime
          : false;

        const isExpired = !isCompleted && !isCancelled && (isExplicitExpired || isDeadlinePassed);

        // Calculate card age
        const claimTime = new Date(claim.created_at).getTime();
        const ageMs = nowTime - claimTime;
        const isOlderThan24Hours = ageMs > TWENTY_FOUR_HOURS_MS;

        return {
          ...claim,
          isCompleted,
          isCancelled,
          isExpired,
          isOlderThan24Hours,
        };
      })
      // ⚡ FILTER: Remove cards older than 24 hours from /my-claims
      .filter((c) => !c.isOlderThan24Hours);

    setClaims(processedClaims);
    setLoading(false);
  };

  useEffect(() => {
    fetchMyClaims();

    const channel = supabase
      .channel('realtime_my_claims_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => fetchMyClaims())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handler for Rejecting / Cancelling Reservation at Counter due to Quality
  const handleRejectAtCounter = async () => {
    if (!rejectingClaim) return;

    setCancelling(true);
    setMessage(null);

    const { error } = await supabase
      .from('claims')
      .update({
        status: 'CANCELLED',
        total_price: 0,
        platform_fee: 0,
        donor_payout: 0,
      })
      .eq('id', rejectingClaim.id);

    if (error) {
      setMessage({ text: 'Failed to cancel reservation: ' + error.message, type: 'error' });
      setCancelling(false);
    } else {
      setMessage({
        text: '🛡️ Reservation rejected at counter due to freshness issues. ₹0 charged.',
        type: 'success',
      });
      setRejectingClaim(null);
      setCancelling(false);
      fetchMyClaims();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="space-y-1">
            <Link
              href="/feed"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Feed
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-7 h-7 text-emerald-600" /> My Active Reservations
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Track your food claims, pickup PINs, and counter verification details. Uncollected cards auto-purge after 24 hours.
            </p>
          </div>

          <button
            onClick={fetchMyClaims}
            className="self-start sm:self-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            Refresh Reservations
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl font-semibold text-xs sm:text-sm border flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 animate-pulse">
                <div className="h-6 bg-slate-100 rounded-xl w-3/4" />
                <div className="h-4 bg-slate-100 rounded-xl w-1/2" />
                <div className="h-20 bg-slate-100 rounded-2xl w-full" />
              </div>
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No active claims found</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              You haven't reserved any surplus food items yet. Visit the Explore Feed to reserve fresh meals!
            </p>
            <Link
              href="/feed"
              className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-md"
            >
              Browse Food Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claims.map((claim) => {
              const bundle = claim.bundle || {};
              const donor = bundle.donor || {};
              const donorName = bundle.restaurant_name || donor.organization_name || donor.full_name || 'Partner Store';
              const pickupAddress = bundle.address || donor.street_address || 'Store Location';

              const { isCompleted, isCancelled, isExpired } = claim;
              const totalPrice = (isCancelled || isExpired) ? 0 : claim.total_price ?? 0;
              const isFree = totalPrice === 0;

              const displayPin = claim.pickup_pin || claim.id.slice(0, 4);

              return (
                <div
                  key={claim.id}
                  className={`bg-white rounded-3xl border shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isCancelled
                      ? 'border-slate-200 bg-slate-50/60 opacity-80'
                      : isExpired
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="p-6 space-y-4">
                    {/* Status & Price Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full border inline-flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : isCancelled
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : isExpired
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Completed
                          </>
                        ) : isCancelled ? (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                            Cancelled at Counter
                          </>
                        ) : isExpired ? (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            Expired / Unclaimed
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Ready for Pickup
                          </>
                        )}
                      </span>

                      <span className="text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
                        {isFree ? '🎁 FREE' : `₹${totalPrice}`}
                      </span>
                    </div>

                    {/* Bundle Title & Business Name */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-900 line-clamp-1">
                        {bundle.title || 'Reserved Surplus Bundle'}
                      </h3>
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{donorName}</span>
                      </div>
                    </div>

                    {/* 🔑 4-Digit Counter Pickup PIN Card (Only active for valid pending claims) */}
                    {!isCompleted && !isCancelled && !isExpired ? (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center space-y-1 shadow-2xs">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Counter Pickup PIN</span>
                        </div>
                        <div className="text-3xl font-black text-emerald-900 tracking-widest font-mono">
                          {displayPin}
                        </div>
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          Show this PIN to counter staff upon pickup
                        </p>
                      </div>
                    ) : null}

                    {/* Claim Details */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                      <div className="flex items-center justify-between">
                        <span>Quantity Reserved:</span>
                        <span className="font-black text-slate-800">
                          {claim.claimed_quantity || 1} item(s)
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{pickupAddress}</span>
                      </div>

                      {bundle.pickup_window_end && (
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-red-500' : 'text-amber-600'} shrink-0`} />
                          <span className={isExpired ? 'text-red-600 font-bold' : ''}>
                            {isExpired ? 'Pickup deadline was: ' : 'Collect before: '}
                            <strong>
                              {new Date(bundle.pickup_window_end).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </strong>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Claimed on:{' '}
                          {new Date(claim.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Card Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">
                        Order ID: #{claim.id.slice(0, 8)}
                      </span>

                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Handed Over
                        </span>
                      ) : isCancelled ? (
                        <span className="inline-flex items-center gap-1 font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-xl text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Rejected at Counter
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-xl border border-red-200 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Ready for Pickup
                        </span>
                      )}
                    </div>

                    {/* 🛡️ Reject at Counter Button (For active pending claims) */}
                    {!isCompleted && !isCancelled && !isExpired && (
                      <button
                        type="button"
                        onClick={() => setRejectingClaim(claim)}
                        className="w-full py-2 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 font-extrabold rounded-xl transition text-[11px] flex items-center justify-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        <span>Reject at Counter (Not Fresh)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REJECT AT COUNTER CONFIRMATION MODAL */}
      <AnimatePresence>
        {rejectingClaim && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-center relative"
            >
              <button
                onClick={() => setRejectingClaim(null)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
                <ShieldAlert className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900">
                  Reject Food at Counter?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Are you currently at <strong className="text-slate-900">{rejectingClaim.bundle?.restaurant_name || 'the restaurant'}</strong> counter and rejecting this item due to food quality/freshness issues?
                </p>
              </div>

              <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-[11px] text-red-800 font-bold space-y-1">
                <div>• Total charge will immediately drop to ₹0.00</div>
                <div>• Reservation will be marked CANCELLED</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingClaim(null)}
                  className="w-1/3 py-3 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleRejectAtCounter}
                  disabled={cancelling}
                  className="w-2/3 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-3 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {cancelling ? (
                    'Cancelling Order...'
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Confirm Cancellation (₹0)</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}