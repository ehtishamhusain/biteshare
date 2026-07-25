'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Utensils, Leaf, IndianRupee, TrendingUp, Award, ArrowLeft, RefreshCw } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
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
    transition: { staggerChildren: 0.15 },
  },
};

export default function DonorAnalyticsPage() {
  const [stats, setStats] = useState({
    totalBundles: 0,
    totalMeals: 0,
    co2SavedKg: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: bundles } = await supabase
      .from('food_bundles')
      .select('*')
      .eq('donor_id', user.id);

    if (bundles) {
      const completedOrClaimed = bundles.filter(
        (b) => b.status === 'CLAIMED' || b.status === 'PICKED_UP'
      );

      let meals = 0;
      let revenue = 0;

      completedOrClaimed.forEach((b) => {
        const qty = parseInt(b.quantity) || 1;
        meals += qty;
        revenue += b.price || 0;
      });

      const co2 = meals * 2.5;

      setStats({
        totalBundles: bundles.length,
        totalMeals: meals,
        co2SavedKg: Math.round(co2 * 10) / 10,
        totalRevenue: revenue,
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <Link
              href="/donor/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Publishing Station
            </Link>
            <h1 className="text-3xl font-black text-slate-900">
              Donor Sustainability & Impact Analytics
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Track your environmental contribution, meals rescued, and revenue generated on BiteShare.
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-slate-500 text-sm">Calculating sustainability metrics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stat Cards Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Meals Rescued</span>
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                    <Utensils className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">{stats.totalMeals}</div>
                <p className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Food kept out of landfills
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">CO₂ Offset</span>
                  <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl">
                    <Leaf className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {stats.co2SavedKg} <span className="text-base font-medium text-slate-500">kg</span>
                </div>
                <p className="text-xs text-teal-700 font-semibold mt-2 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Environmental savings
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Revenue Earned</span>
                  <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">₹{stats.totalRevenue}</div>
                <p className="text-xs text-amber-700 font-semibold mt-2">Recovered inventory cost</p>
              </motion.div>
            </motion.div>

            {/* Impact Banner Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/30 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-400/30">
                  🌿 Zero Waste Partner Status
                </div>
                <h2 className="text-2xl font-bold">You've saved {stats.co2SavedKg} kg of CO₂ emissions!</h2>
                <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                  By redirecting surplus food to community members, your business directly reduces methane gas emissions generated by organic waste.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[200px]">
                <div className="text-4xl font-black text-emerald-200">{stats.totalBundles}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-100 mt-1">Total Bundles Posted</div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}