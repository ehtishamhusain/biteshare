'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Utensils,
  ShieldCheck,
  RefreshCw,
  Tag,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Layers,
  IndianRupee,
  Phone,
  User,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function DonorManagePage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'claims'>('listings');
  const [bundles, setBundles] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinInputs, setPinInputs] = useState<{ [key: string]: string }>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchDonorData();

    // ⚡ Realtime subscription for instant updates on claims and stock
    const channel = supabase
      .channel('realtime_donor_manage')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'claims' },
        () => fetchDonorData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_bundles' },
        () => fetchDonorData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDonorData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: donorBundles } = await supabase
      .from('food_bundles')
      .select('*')
      .eq('donor_id', user.id)
      .order('created_at', { ascending: false });

    if (donorBundles) {
      setBundles(donorBundles);

      const bundleIds = donorBundles.map((b) => b.id);
      if (bundleIds.length > 0) {
        const { data: activeClaims } = await supabase
          .from('claims')
          .select(
            '*, recipient:profiles(full_name, phone, organization_name), bundle:food_bundles(title, quantity, quantity_remaining, price, price_per_item, pickup_window_end)'
          )
          .in('bundle_id', bundleIds)
          .order('created_at', { ascending: false });

        if (activeClaims) {
          setClaims(activeClaims);
        }
      }
    }
    setLoading(false);
  };

  const handleDeleteBundle = async (bundleId: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;

    setDeletingId(bundleId);
    setMessage(null);

    await supabase.from('claims').delete().eq('bundle_id', bundleId);

    const { error } = await supabase
      .from('food_bundles')
      .delete()
      .eq('id', bundleId);

    if (error) {
      setMessage({ text: 'Failed to delete listing: ' + error.message, type: 'error' });
    } else {
      setMessage({ text: 'Listing permanently removed!', type: 'success' });
      setBundles((prev) => prev.filter((b) => b.id !== bundleId));
    }
    setDeletingId(null);
  };

  // 🔑 Verify 4-Digit Security PIN
  const handleVerifyPin = async (claimId: string, expectedPin: string) => {
    setVerifyingId(claimId);
    setMessage(null);

    const enteredPin = pinInputs[claimId]?.trim();

    if (!enteredPin || enteredPin !== expectedPin) {
      setMessage({
        text: '❌ Invalid 4-Digit Security PIN. Please re-check with recipient.',
        type: 'error',
      });
      setVerifyingId(null);
      return;
    }

    // Update claim status to COMPLETED
    const { error: claimErr } = await supabase
      .from('claims')
      .update({ status: 'COMPLETED' })
      .eq('id', claimId);

    if (claimErr) {
      setMessage({ text: 'Failed to complete pickup: ' + claimErr.message, type: 'error' });
      setVerifyingId(null);
      return;
    }

    setMessage({
      text: '✅ PIN Verified! Order marked as successfully picked up.',
      type: 'success',
    });
    fetchDonorData();
    setVerifyingId(null);
  };

  const availableBundles = bundles.filter((b) => b.status === 'AVAILABLE');

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Manage Listings & Store Pickups
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              View active food listings, monitor remaining stock, and verify recipient pickup PINs.
            </p>
          </div>

          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'listings'
                  ? 'bg-white text-emerald-800 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Listings ({availableBundles.length})
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'claims'
                  ? 'bg-white text-emerald-800 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reservations & Pickups ({claims.length})
            </button>
          </div>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl font-semibold text-sm border shadow-sm flex items-center gap-2 ${
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

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-slate-500 text-sm">Loading your donor board...</p>
          </div>
        ) : activeTab === 'listings' ? (
          availableBundles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-3">
              <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No active listings</h3>
              <p className="text-slate-500 text-sm">
                You have no active food bundles right now. Publish a new bundle from your dashboard!
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {availableBundles.map((bundle) => {
                const remaining = bundle.quantity_remaining ?? bundle.quantity;
                const pricePerItem = bundle.price_per_item ?? bundle.price ?? 0;

                return (
                  <motion.div
                    key={bundle.id}
                    variants={fadeInUp}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200">
                          🟢 Live on Feed
                        </span>
                        <span className="font-black text-sm px-2.5 py-0.5 bg-slate-100 border rounded-lg text-slate-900">
                          {pricePerItem === 0 ? '🎁 FREE' : `₹${pricePerItem} / item`}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{bundle.title}</h3>
                      <p className="text-slate-600 text-xs line-clamp-2">
                        {bundle.description || 'Surplus food available for pickup.'}
                      </p>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-emerald-600" />
                            Stock Remaining:
                          </span>
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            {remaining} of {bundle.quantity} left
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
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

                    <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleDeleteBundle(bundle.id)}
                        disabled={deletingId === bundle.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition border border-red-200 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === bundle.id ? 'Deleting...' : 'Delete Listing'}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No active reservations yet</h3>
            <p className="text-slate-500 text-sm">
              When community members reserve your surplus bundles, their claims and verification PINs will show here.
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {claims.map((claim) => {
              const bundle = claim.bundle;
              const claimedQty = claim.claimed_quantity || 1;
              const remainingQty = bundle?.quantity_remaining ?? 0;
              const totalPrice =
                claim.total_price ??
                (bundle?.price_per_item
                  ? claimedQty * bundle.price_per_item
                  : bundle?.price || 0);

              const recipientName =
                claim.recipient?.organization_name ||
                claim.recipient?.full_name ||
                'Community Member';

              return (
                <motion.div
                  key={claim.id}
                  variants={fadeInUp}
                  whileHover={{ y: -3 }}
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-3 flex-grow">
                    {/* Status & Quantities Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          claim.status === 'COMPLETED' || claim.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {claim.status === 'COMPLETED' || claim.status === 'completed'
                          ? 'Completed Pickup'
                          : 'Pending PIN Verification'}
                      </span>

                      {/* 🛍️ Quantity Ordered Badge */}
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-black flex items-center gap-1.5 shadow-xs">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ordered: {claimedQty} item(s)</span>
                      </span>

                      {/* 📦 Left in Listing Badge */}
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span>Listing Stock Left: {remainingQty}</span>
                      </span>

                      {/* 💰 Price Badge */}
                      <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-black flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                        <span>Total: {totalPrice === 0 ? 'FREE' : `₹${totalPrice}`}</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">{bundle?.title}</h3>

                    {/* Recipient Contact Details */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1 max-w-md">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recipient: {recipientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Phone: {claim.recipient?.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Security PIN Verification Box */}
                  {claim.status !== 'COMPLETED' && claim.status !== 'completed' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 w-full md:w-auto min-w-[280px]">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Enter Recipient 4-Digit PIN:</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="1234"
                          value={pinInputs[claim.id] || ''}
                          onChange={(e) =>
                            setPinInputs({ ...pinInputs, [claim.id]: e.target.value })
                          }
                          className="w-28 px-3 py-2 text-center text-base font-mono font-bold tracking-widest rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        />
                        <button
                          onClick={() => handleVerifyPin(claim.id, claim.pickup_pin)}
                          disabled={verifyingId === claim.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-sm disabled:opacity-50 flex-grow"
                        >
                          {verifyingId === claim.id ? 'Verifying...' : 'Verify PIN'}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}