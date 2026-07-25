'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  IndianRupee,
  TrendingUp,
  Percent,
  ShoppingBag,
  RefreshCw,
  Sparkles,
  Building,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
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

export default function DonorEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);
  const [upiId, setUpiId] = useState('');
  const [updatingUpi, setUpdatingUpi] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Fetch Donor Profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('upi_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.upi_id) setUpiId(profile.upi_id);

    // Fetch all completed/pending claims for donor's listings
    const { data: donorBundles } = await supabase
      .from('food_bundles')
      .select('id')
      .eq('donor_id', user.id);

    if (donorBundles && donorBundles.length > 0) {
      const bundleIds = donorBundles.map((b) => b.id);

      const { data: salesClaims } = await supabase
        .from('claims')
        .select(`
          *,
          bundle:food_bundles(title, quantity, price_per_item, price),
          recipient:profiles(full_name, phone)
        `)
        .in('bundle_id', bundleIds)
        .order('created_at', { ascending: false });

      if (salesClaims) {
        setClaims(salesClaims);
      }
    }
    setLoading(false);
  };

  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingUpi(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ upi_id: upiId.trim() })
      .eq('id', user.id);

    if (error) {
      setMessage({ text: 'Failed to update UPI payout ID: ' + error.message, type: 'error' });
    } else {
      setMessage({ text: '✅ Payout UPI ID updated successfully!', type: 'success' });
    }
    setUpdatingUpi(false);
  };

  // 📊 Calculate Financial Metrics
  const totalSalesGross = claims.reduce((sum, c) => sum + (Number(c.total_price) || 0), 0);
  const totalPlatformFees = claims.reduce((sum, c) => {
    const total = Number(c.total_price) || 0;
    const fee = c.platform_fee ? Number(c.platform_fee) : total * 0.10; // 10% commission
    return sum + fee;
  }, 0);

  const totalNetEarnings = totalSalesGross - totalPlatformFees;
  const totalItemsSold = claims.reduce((sum, c) => sum + (Number(c.claimed_quantity) || 1), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Partner Financial Station</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Revenue & Commission Analytics
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Monitor recouped food costs, net payouts, and 10% BiteShare service fee breakdowns.
            </p>
          </div>
        </motion.div>

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

        {/* 📊 Financial Overview Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Gross Sales */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Gross Sales Value</span>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">₹{totalSalesGross.toFixed(0)}</div>
            <p className="text-[11px] text-slate-500">Total revenue generated on feed</p>
          </motion.div>

          {/* BiteShare Commission (10%) */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase tracking-wider">
              <span>BiteShare Fee (10%)</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-700">₹{totalPlatformFees.toFixed(0)}</div>
            <p className="text-[11px] text-slate-500">Platform operational cut</p>
          </motion.div>

          {/* Net Store Payout */}
          <motion.div
            variants={fadeInUp}
            className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg shadow-emerald-600/20 space-y-2"
          >
            <div className="flex items-center justify-between text-emerald-100 text-xs font-bold uppercase tracking-wider">
              <span>Net Store Earnings (90%)</span>
              <div className="p-2 rounded-xl bg-emerald-500/30 text-white border border-emerald-400/30">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">₹{totalNetEarnings.toFixed(0)}</div>
            <p className="text-[11px] text-emerald-100">Recouped directly into store bank</p>
          </motion.div>

          {/* Items Rescued */}
          <motion.div
            variants={fadeInUp}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Total Items Sold</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{totalItemsSold} Units</div>
            <p className="text-[11px] text-emerald-700 font-semibold">Diverted from waste</p>
          </motion.div>
        </motion.div>

        {/* 💳 UPI Payout Settings Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Direct Bank/UPI Payout Setup
            </h3>
          </div>

          <form onSubmit={handleSaveUpi} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow w-full space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Store UPI ID for Weekly Payouts
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. royalbakery@upi or 9876543210@paytm"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-bold text-slate-800 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={updatingUpi}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
            >
              {updatingUpi ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Payout Details'}
            </button>
          </form>
        </motion.div>

        {/* 📜 Transactions Breakdown Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-extrabold text-slate-900">Recent Sales & Payout Ledger</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">10% Platform Service Fee Applied</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
              <p className="text-xs">Loading ledger...</p>
            </div>
          ) : claims.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No transactions recorded yet</p>
              <p className="text-xs text-slate-500">Sales and commission logs will populate as items are claimed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-2">Item Title</th>
                    <th className="py-3 px-2">Qty</th>
                    <th className="py-3 px-2">Gross Sale</th>
                    <th className="py-3 px-2">BiteShare Cut (10%)</th>
                    <th className="py-3 px-2">Net Store Payout (90%)</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {claims.map((claim) => {
                    const gross = Number(claim.total_price) || 0;
                    const fee = claim.platform_fee ? Number(claim.platform_fee) : gross * 0.10;
                    const net = gross - fee;

                    return (
                      <tr key={claim.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-2 font-bold text-slate-900">{claim.bundle?.title || 'Food Bundle'}</td>
                        <td className="py-3.5 px-2">{claim.claimed_quantity || 1}</td>
                        <td className="py-3.5 px-2 font-black text-slate-900">₹{gross}</td>
                        <td className="py-3.5 px-2 font-bold text-amber-700">-₹{fee.toFixed(1)}</td>
                        <td className="py-3.5 px-2 font-black text-emerald-700">+₹{net.toFixed(1)}</td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            claim.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {claim.status || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}