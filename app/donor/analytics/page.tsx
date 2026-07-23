'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Utensils, Leaf, IndianRupee, TrendingUp, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

    // Fetch all bundles published by this donor
    const { data: bundles } = await supabase
      .from('food_bundles')
      .select('*')
      .eq('donor_id', user.id);

    if (bundles) {
      const completedOrClaimed = bundles.filter((b) => b.status === 'CLAIMED' || b.status === 'PICKED_UP');
      
      let meals = 0;
      let revenue = 0;

      completedOrClaimed.forEach((b) => {
        const qty = parseInt(b.quantity) || 1;
        meals += qty;
        revenue += (b.price || 0);
      });

      // Standard ESG estimate: ~2.5 kg of CO2 emissions prevented per rescued food item
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/donor/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-slate-900">Donor Sustainability & Impact Analytics</h1>
            <p className="text-slate-600 text-sm mt-1">
              Track your environmental contribution, meals rescued, and revenue generated on BiteShare.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-slate-500 text-sm mt-3">Calculating sustainability metrics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Impact Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Meals Rescued</span>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Utensils className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">{stats.totalMeals}</div>
                <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Food kept out of landfills
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">CO₂ Emissions Offset</span>
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                    <Leaf className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">{stats.co2SavedKg} <span className="text-base font-medium text-slate-500">kg</span></div>
                <p className="text-xs text-teal-600 font-semibold mt-2 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Estimated environmental savings
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Revenue Earned</span>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">₹{stats.totalRevenue}</div>
                <p className="text-xs text-amber-600 font-semibold mt-2">Recovered costs from discounted items</p>
              </div>
            </div>

            {/* Environmental Badge Banner */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                  🌿 Zero Waste Partner Status
                </div>
                <h2 className="text-2xl font-bold">You've saved {stats.co2SavedKg} kg of CO₂ emissions!</h2>
                <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                  By redirecting surplus food to community members, your business directly reduces methane gas emissions generated by decomposing organic waste in municipal landfills.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[200px]">
                <div className="text-4xl font-black text-emerald-300">{stats.totalBundles}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-100 mt-1">Total Bundles Posted</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}