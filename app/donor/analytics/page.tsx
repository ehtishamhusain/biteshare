'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Utensils,
  Leaf,
  IndianRupee,
  TrendingUp,
  Award,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  Building,
  CheckCircle2,
  Receipt,
  Calendar,
  Percent,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
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
    transition: { staggerChildren: 0.12 },
  },
};

export default function DonorAnalyticsPage() {
  const [stats, setStats] = useState({
    totalBundles: 0,
    totalMeals: 0,
    co2SavedKg: 0,
    grossRevenue: 0,
    platformFeeDeducted: 0,
    netRevenueEarned: 0,
    completedClaimsCount: 0,
  });

  const [recentCompleted, setRecentCompleted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Fetch all food bundles published by this donor
    const { data: bundles } = await supabase
      .from('food_bundles')
      .select('*')
      .eq('donor_id', user.id);

    if (bundles && bundles.length > 0) {
      const bundleIds = bundles.map((b) => b.id);
      const bundleMap = Object.fromEntries(bundles.map((b) => [b.id, b]));

      // 2. Fetch completed claims associated with these bundles
      const { data: claims } = await supabase
        .from('claims')
        .select('*')
        .in('bundle_id', bundleIds)
        .order('created_at', { ascending: false });

      let meals = 0;
      let grossRev = 0;
      let feeDeducted = 0;
      let netRev = 0;
      let completedCount = 0;
      const completedList: any[] = [];

      if (claims && claims.length > 0) {
        // Filter for COMPLETED handovers
        const completedClaims = claims.filter(
          (c) => String(c.status).toUpperCase() === 'COMPLETED'
        );

        completedCount = completedClaims.length;

        completedClaims.forEach((c) => {
          const qty = parseInt(c.claimed_quantity) || 1;
          meals += qty;

          const totalPrice = Number(c.total_price) || 0;
          const fee = c.platform_fee !== null && c.platform_fee !== undefined
            ? Number(c.platform_fee)
            : totalPrice * 0.12;

          const payout = c.donor_payout !== null && c.donor_payout !== undefined
            ? Number(c.donor_payout)
            : totalPrice * 0.88;

          grossRev += totalPrice;
          feeDeducted += fee;
          netRev += payout;

          completedList.push({
            ...c,
            bundleTitle: bundleMap[c.bundle_id]?.title || 'Surplus Food Bundle',
            grossPrice: totalPrice,
            netPayout: payout,
          });
        });
      } else {
        // Fallback for bundle-level completed status
        const claimedBundles = bundles.filter(
          (b) => b.status === 'CLAIMED' || b.status === 'PICKED_UP'
        );

        claimedBundles.forEach((b) => {
          const qty = parseInt(b.quantity) || 1;
          meals += qty;

          const totalPrice = Number(b.total_price || b.price) || 0;
          const fee = totalPrice * 0.12;
          const payout = totalPrice * 0.88;

          grossRev += totalPrice;
          feeDeducted += fee;
          netRev += payout;
        });
      }

      // Environmental Calculations
      const co2 = meals * 2.5; // 2.5 kg CO2 per meal rescued

      setStats({
        totalBundles: bundles.length,
        totalMeals: meals,
        co2SavedKg: Math.round(co2 * 10) / 10,
        grossRevenue: Math.round(grossRev),
        platformFeeDeducted: Math.round(feeDeducted),
        netRevenueEarned: Math.round(netRev),
        completedClaimsCount: completedCount,
      });

      setRecentCompleted(completedList.slice(0, 5));
    } else {
      setStats({
        totalBundles: 0,
        totalMeals: 0,
        co2SavedKg: 0,
        grossRevenue: 0,
        platformFeeDeducted: 0,
        netRevenueEarned: 0,
        completedClaimsCount: 0,
      });
      setRecentCompleted([]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs"
        >
          <div>
            <Link
              href="/donor/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Donor Station
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Donor Revenue & Impact Analytics
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Real-time audit of your net earnings (12% platform fee deducted), rescued meals, and environmental savings.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </motion.div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-slate-500 text-sm font-semibold">Calculating net store earnings and metrics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* 🟢 NET REVENUE EARNED (88%) */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
                    Net Revenue Earned
                  </span>
                  <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-black tracking-tight">₹{stats.netRevenueEarned}</div>
                  <p className="text-[11px] text-emerald-100 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    12% Fee Deducted (Net Store Payout)
                  </p>
                </div>
              </motion.div>

              {/* Meals Rescued */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Meals Rescued
                  </span>
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                    <Utensils className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-black text-slate-900">{stats.totalMeals}</div>
                  <p className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Food kept out of landfills
                  </p>
                </div>
              </motion.div>

              {/* CO2 Offset */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    CO₂ Offset
                  </span>
                  <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl border border-teal-100">
                    <Leaf className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-black text-slate-900">
                    {stats.co2SavedKg} <span className="text-sm font-bold text-slate-500">kg</span>
                  </div>
                  <p className="text-[11px] text-teal-700 font-bold mt-1 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Environmental savings
                  </p>
                </div>
              </motion.div>

              {/* Handover Completed */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Completed Handovers
                  </span>
                  <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-black text-slate-900">{stats.completedClaimsCount}</div>
                  <p className="text-[11px] text-purple-700 font-bold mt-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> Verified counter PIN handovers
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* 💳 FINANCIAL BREAKDOWN CARD (Full Width) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-600" /> Revenue & Platform Fee Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Itemized accounting of store payouts vs 12% BiteShare commission.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
                <div className="flex flex-col justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Gross Sales GMV (100%)</span>
                  <span className="font-black text-slate-900 text-xl">₹{stats.grossRevenue}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Total customer claim volume</span>
                </div>

                <div className="flex flex-col justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-amber-800">
                    <Percent className="w-3.5 h-3.5 text-amber-600" /> BiteShare Fee (12%)
                  </span>
                  <span className="font-black text-amber-900 text-xl">- ₹{stats.platformFeeDeducted}</span>
                  <span className="text-[10px] text-amber-700 font-medium">Platform commission deducted</span>
                </div>

                <div className="flex flex-col justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2">
                  <span className="font-black text-[10px] uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Net Store Payout (88%)
                  </span>
                  <span className="font-black text-emerald-800 text-2xl">₹{stats.netRevenueEarned}</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Your net take-home earnings</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Platform fees cover payment processing, location hosting, and realtime customer notifications.
              </p>
            </motion.div>

            {/* 📋 RECENT COMPLETED HANDOVERS LOG */}
            {recentCompleted.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" /> Recent Fulfillments Log
                  </h3>
                  <span className="text-xs font-bold text-slate-400">Top 5 Completed Orders</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {recentCompleted.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs font-medium">
                      <div className="space-y-0.5">
                        <div className="font-black text-slate-900">{item.bundleTitle}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(item.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-emerald-700 text-sm">₹{item.netPayout.toFixed(2)} (Net)</div>
                        <div className="text-[10px] text-slate-400">
                          Gross ₹{item.grossPrice} (-12% Fee)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}