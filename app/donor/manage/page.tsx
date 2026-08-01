'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListCheck,
  KeyRound,
  CheckCircle2,
  User,
  Phone,
  RefreshCw,
  AlertCircle,
  Search,
  X,
  ShieldCheck,
  Utensils,
  Clock,
  XCircle,
  Ban,
} from 'lucide-react';

export default function DonorManagePickupsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // PIN Verification Modal States
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [enteredPin, setPinInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchDonorClaims();

    // Real-time synchronization for pickup status changes
    const channel = supabase
      .channel('donor_claims_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'claims' },
        () => fetchDonorClaims()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_bundles' },
        () => fetchDonorClaims()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDonorClaims = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Fetch ALL food bundles published by this donor
    const { data: donorBundles, error: bundleError } = await supabase
      .from('food_bundles')
      .select('id, title, address, status, pickup_window_end, expires_at')
      .eq('donor_id', user.id);

    if (bundleError || !donorBundles || donorBundles.length === 0) {
      setClaims([]);
      setLoading(false);
      return;
    }

    const bundleIds = donorBundles.map((b) => b.id);
    const bundleMap = Object.fromEntries(donorBundles.map((b) => [b.id, b]));

    // 2. Fetch all claims for these bundles
    const { data: claimsData, error: claimsError } = await supabase
      .from('claims')
      .select('*')
      .in('bundle_id', bundleIds)
      .order('created_at', { ascending: false });

    if (claimsError || !claimsData) {
      setClaims([]);
      setLoading(false);
      return;
    }

    // 3. Fetch recipient profiles for details
    const recipientIds = Array.from(new Set(claimsData.map((c) => c.recipient_id).filter(Boolean)));
    let profileMap: { [id: string]: any } = {};

    if (recipientIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email, organization_name')
        .in('id', recipientIds);

      if (profilesData) {
        profileMap = Object.fromEntries(profilesData.map((p) => [p.id, p]));
      }
    }

    const nowTime = new Date().getTime();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    // 4. Process statuses and apply 24-hour auto-purge filter
    const processedClaims = claimsData
      .map((claim) => {
        const bundle = bundleMap[claim.bundle_id] || { title: 'Surplus Food Bundle' };
        const recipient = profileMap[claim.recipient_id] || { full_name: 'Community Recipient' };

        const isCompleted = claim.status === 'COMPLETED';
        const isCancelled = claim.status === 'CANCELLED';

        const pickupDeadline = bundle.pickup_window_end || bundle.expires_at;
        const isDeadlinePassed = pickupDeadline
          ? new Date(pickupDeadline).getTime() < nowTime
          : false;

        const isExpired = !isCompleted && !isCancelled && (claim.status === 'EXPIRED' || isDeadlinePassed);

        // Calculate card age
        const claimTime = new Date(claim.created_at).getTime();
        const ageMs = nowTime - claimTime;
        const isOlderThan24Hours = ageMs > TWENTY_FOUR_HOURS_MS;

        return {
          ...claim,
          bundle,
          recipient,
          isCompleted,
          isCancelled,
          isExpired,
          isOlderThan24Hours,
        };
      })
      // ⚡ FILTER: Remove cards older than 24 hours from /donor/manage
      .filter((c) => !c.isOlderThan24Hours);

    setClaims(processedClaims);
    setLoading(false);
  };

  // Verify 4-Digit Handshake PIN
  const handleVerifyPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setVerifying(true);
    setFeedback(null);

    const cleanInputPin = enteredPin.trim();
    const expectedPin = String(selectedClaim.pickup_pin).trim();

    if (cleanInputPin !== expectedPin) {
      setFeedback({
        text: '❌ Incorrect 4-digit PIN! Please check with the customer at the counter.',
        type: 'error',
      });
      setVerifying(false);
      return;
    }

    // Update claim status to COMPLETED
    const { error } = await supabase
      .from('claims')
      .update({
        status: 'COMPLETED',
      })
      .eq('id', selectedClaim.id);

    if (error) {
      setFeedback({ text: 'Error completing order: ' + error.message, type: 'error' });
      setVerifying(false);
    } else {
      setFeedback({
        text: '🎉 PIN Verified! Order completed successfully.',
        type: 'success',
      });

      setTimeout(() => {
        setSelectedClaim(null);
        setPinInput('');
        setFeedback(null);
        fetchDonorClaims();
      }, 1200);
    }
  };

  // Filter claims by recipient name, phone, or bundle title
  const filteredClaims = claims.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const recipientName = (c.recipient?.full_name || c.recipient?.organization_name || '').toLowerCase();
    const phone = (c.recipient?.phone || '').toLowerCase();
    const title = (c.bundle?.title || '').toLowerCase();

    return q === '' || recipientName.includes(q) || phone.includes(q) || title.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200 mb-2">
              <ListCheck className="w-3.5 h-3.5 text-emerald-600" /> Store Counter Verification
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manage Store Pickups
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Verify customer PINs at the counter. Cancelled or expired orders automatically purge after 24 hours.
            </p>
          </div>

          <button
            onClick={fetchDonorClaims}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pickup by customer name, phone number, or food item..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-800 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Pickup Orders List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-slate-500 text-sm font-semibold">Loading customer reservations...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No active pickup reservations</h3>
            <p className="text-slate-500 text-xs">
              When recipients reserve food bundles, their verification tickets appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClaims.map((claim) => {
              const { isCompleted, isCancelled, isExpired } = claim;
              const recipientName = claim.recipient?.full_name || claim.recipient?.organization_name || 'Community Recipient';

              // Display 0 rupees if cancelled or expired
              const price = (isCancelled || isExpired) ? 0 : (claim.total_price || 0);
              const storePayout = (isCancelled || isExpired) ? 0 : (claim.donor_payout || price * 0.88);

              return (
                <div
                  key={claim.id}
                  className={`bg-white rounded-3xl p-6 border shadow-xs transition flex flex-col justify-between space-y-4 ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : isCancelled
                      ? 'border-slate-300 bg-slate-50/80 opacity-85'
                      : isExpired
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Status & Financial Breakdown */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isCancelled
                            ? 'bg-slate-200 text-slate-800 border border-slate-300'
                            : isExpired
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-600'
                              : isCancelled
                              ? 'bg-slate-500'
                              : isExpired
                              ? 'bg-red-500'
                              : 'bg-amber-500 animate-pulse'
                          }`}
                        />
                        {isCompleted
                          ? 'Completed'
                          : isCancelled
                          ? 'Cancelled / Rejected at Counter'
                          : isExpired
                          ? 'Expired / Unclaimed'
                          : 'Pending Pickup'}
                      </span>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900">
                          {isCancelled || isExpired ? '₹0.00' : price === 0 ? '🎁 FREE' : `₹${price}`}
                        </span>
                        {!isCancelled && !isExpired && price > 0 && (
                          <span className="block text-[10px] text-emerald-700 font-bold">
                            Net Payout: ₹{Number(storePayout).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Food Title */}
                    <div>
                      <h3 className="text-base font-black text-slate-900">{claim.bundle?.title}</h3>
                      <p className="text-xs text-slate-500">
                        Claimed Quantity: <strong className="text-slate-800">{claim.claimed_quantity || 1} item(s)</strong>
                      </p>
                    </div>

                    {/* Customer Info */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{recipientName}</span>
                      </div>
                      {claim.recipient?.phone && (
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{claim.recipient.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Deadline Display */}
                    {(claim.bundle?.pickup_window_end || claim.bundle?.expires_at) && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                        <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-red-500' : 'text-amber-600'}`} />
                        <span className={isExpired ? 'text-red-600 font-bold' : ''}>
                          {isExpired ? 'Pickup window ended: ' : 'Collect before: '}
                          {new Date(claim.bundle.pickup_window_end || claim.bundle.expires_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Counter Action Button */}
                  <div>
                    {isCompleted ? (
                      <div className="p-3 bg-emerald-100/60 rounded-2xl text-center text-xs font-bold text-emerald-900 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Verified & Handed Over</span>
                      </div>
                    ) : isCancelled ? (
                      <div className="p-3 bg-slate-200/80 rounded-2xl text-center text-xs font-bold text-slate-800 flex items-center justify-center gap-2 border border-slate-300">
                        <Ban className="w-4 h-4 text-slate-600" />
                        <span>Cancelled by Recipient at Counter (₹0)</span>
                      </div>
                    ) : isExpired ? (
                      <div className="p-3 bg-red-100/60 rounded-2xl text-center text-xs font-bold text-red-900 flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Pickup Deadline Expired (Uncollected)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setPinInput('');
                          setFeedback(null);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 px-4 rounded-2xl text-xs transition shadow-xs flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-4 h-4 text-emerald-400" />
                        <span>Enter 4-Digit Counter PIN</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Counter PIN Verification Modal */}
      <AnimatePresence>
        {selectedClaim && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-black text-slate-900">Verify Counter Pickup</h3>
                </div>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleVerifyPinSubmit} className="space-y-4">
                {feedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      feedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <span>{feedback.text}</span>
                  </div>
                )}

                <div className="text-center space-y-1">
                  <span className="text-xs text-slate-500">Enter customer's 4-Digit Security PIN:</span>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={enteredPin}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="e.g. 4829"
                    className="w-full text-center text-2xl font-black tracking-widest py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedClaim(null)}
                    className="w-1/3 py-3 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifying || enteredPin.length < 4}
                    className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-3 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {verifying ? 'Verifying...' : 'Verify PIN & Handover'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}