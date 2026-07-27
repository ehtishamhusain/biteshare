'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Utensils,
  Sparkles,
  IndianRupee,
  CheckCircle2,
  Gift,
  Users,
  MessageSquare,
  ShieldCheck,
  Send,
  RefreshCw,
  AlertCircle,
  Award,
} from 'lucide-react';

export default function SponsorMealPage() {
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [totalMealsSponsored, setTotalMealsSponsored] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form States
  const [mealsCount, setMealsCount] = useState<number>(5);
  const [customMeals, setCustomMeals] = useState<string>('');
  const [sponsorName, setSponsorName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const MEAL_PRICE = 30; // ₹30 per meal

  useEffect(() => {
    fetchSponsorshipStats();
    prefillUserData();
  }, []);

  const prefillUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, organization_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setSponsorName(profile.full_name || profile.organization_name || '');
      }
    }
  };

  const fetchSponsorshipStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sponsored_meals')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setSponsorships(data);
      const total = data.reduce((acc, curr) => acc + (Number(curr.meals_count) || 0), 0);
      setTotalMealsSponsored(total);
    }
    setLoading(false);
  };

  const activeMealsToPay = customMeals ? Math.max(1, Number(customMeals)) : mealsCount;
  const totalCost = activeMealsToPay * MEAL_PRICE;

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    const { data: { user } } = await supabase.auth.getUser();

    const finalName = sponsorName.trim() || 'Anonymous Hero';

    const { error } = await supabase.from('sponsored_meals').insert({
      sponsor_id: user?.id || null,
      sponsor_name: finalName,
      amount: totalCost,
      meals_count: activeMealsToPay,
      message: message.trim(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      setErrorMsg('Failed to process sponsorship: ' + error.message);
    } else {
      setSuccessMsg(`🎉 Thank you, ${finalName}! You just sponsored ${activeMealsToPay} meal(s) for local shelters!`);
      setMessage('');
      setCustomMeals('');
      fetchSponsorshipStats();
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/30 backdrop-blur-md border border-emerald-400/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Heart className="w-4 h-4 text-emerald-200 fill-emerald-200" /> Pay-It-Forward Movement
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Sponsor a Meal. End Local Hunger.
          </h1>

          <p className="text-emerald-100 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Just <strong>₹30</strong> provides a wholesome hot meal from a verified partner restaurant to a homeless individual or community shelter.
          </p>

          {/* Impact Meter Stat Card */}
          <div className="pt-4 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl flex items-center gap-4">
              <Award className="w-8 h-8 text-amber-300" />
              <div className="text-left">
                <span className="block text-2xl font-black text-white">{totalMealsSponsored} Meals</span>
                <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                  Sponsored by Community Heroes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Sponsorship Selection Form (3 columns) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" /> Select Your Meal Sponsorship
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose how many meals you would like to fund today.
              </p>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSponsorSubmit} className="space-y-6">
              
              {/* Preset Cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { count: 1, label: '1 Meal', desc: 'Feeds 1 person' },
                  { count: 5, label: '5 Meals', desc: 'Feeds a family' },
                  { count: 10, label: '10 Meals', desc: 'Feeds a shelter' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => {
                      setMealsCount(item.count);
                      setCustomMeals('');
                    }}
                    className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-between gap-1 ${
                      !customMeals && mealsCount === item.count
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
                    <span className="text-base font-black text-emerald-700">₹{item.count * MEAL_PRICE}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.desc}</span>
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Or Enter Custom Number of Meals
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={customMeals}
                    onChange={(e) => setCustomMeals(e.target.value)}
                    placeholder="e.g. 25 Meals"
                    className="w-full px-4 py-3 pl-10 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50"
                  />
                  <Utensils className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Your Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Your Name / Organization Name
                </label>
                <input
                  type="text"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  placeholder="e.g. Bareilly Kindness Foundation (or leave blank for Anonymous)"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm text-slate-800 bg-slate-50/50"
                />
              </div>

              {/* Encouraging Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Message of Hope (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message to be displayed on the Wall of Hope..."
                  className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-800 bg-slate-50/50"
                />
              </div>

              {/* Summary Box & Submit Button */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Sponsoring {activeMealsToPay} Meal(s) @ ₹30/meal</span>
                  <span className="text-xl font-black text-emerald-400">Total: ₹{totalCost}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{submitting ? 'Processing Sponsorship...' : `Sponsor ${activeMealsToPay} Meal(s) Now`}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Wall of Hope / Recent Sponsors Feed (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Wall of Hope
              </h2>
              <button
                onClick={fetchSponsorshipStats}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition"
                title="Refresh Feed"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                <p className="text-xs text-slate-500">Loading community contributions...</p>
              </div>
            ) : sponsorships.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
                <Heart className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Be the First Hero</h3>
                <p className="text-xs text-slate-500">No sponsorships yet. Sponsor 1 meal to launch the movement!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
                {sponsorships.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        {item.sponsor_name}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                        {item.meals_count} Meal(s)
                      </span>
                    </div>

                    {item.message && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{item.message}"
                      </p>
                    )}

                    <span className="block text-[10px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}