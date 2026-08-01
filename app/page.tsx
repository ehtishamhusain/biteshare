'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import MissionSection from '@/components/MissionSection';
import EcosystemSection from '@/components/EcosystemSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import FeaturesSection from '@/components/FeaturesSection';
import FaqSection from '@/components/FaqSection';
import FounderNote from '@/components/FounderNote';
import NewsletterSection from '@/components/NewsletterSection';
import {
  Utensils,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  Leaf,
  Clock,
  CheckCircle2,
  ChevronRight,
  Building,
  RefreshCw,
  HeartHandshake,
  Recycle,
} from 'lucide-react';

// Explicitly typed Animation Variants for zero TypeScript errors
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function Home() {
  const [latestBundle, setLatestBundle] = useState<any>(null);
  const [loadingBundle, setLoadingBundle] = useState(true);

  // 🔄 Fetch the most recently published AVAILABLE food bundle from Supabase
  const fetchLatestBundle = async () => {
    setLoadingBundle(true);
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('food_bundles')
      .select('*, donor:profiles(organization_name, full_name, city)')
      .eq('status', 'AVAILABLE')
      .gt('expires_at', nowIso)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setLatestBundle(data);
    } else {
      setLatestBundle(null);
    }
    setLoadingBundle(false);
  };

  useEffect(() => {
    fetchLatestBundle();

    // ⚡ Realtime WebSockets listener: Update home preview card automatically when a donor publishes
    const channel = supabase
      .channel('realtime_home_preview')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_bundles' },
        () => {
          fetchLatestBundle();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* 🌟 Background Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* 🚀 Hero Section - Compacted top padding so it fits nicely */}
        <section className="relative pt-4 pb-16 lg:pt-6 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <motion.div
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Pulsing Pill Badge */}
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest shadow-xs"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hyper-Local Food Redistribution Network</span>
              </motion.div>

              {/* Dynamic Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900"
              >
                Driving Zero Hunger{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
                Through Zero Food Waste.
                </span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                variants={fadeInUp}
                className="text-slate-600 text-base sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                We connect local restaurants, bakeries, and grocery stores directly with neighbors and shelters to feed families and protect our planet.
              </motion.p>

              {/* 🌟 2 Core Objective Highlight Cards */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto lg:mx-0 pt-1"
              >
                {/* Objective 1 Card */}
                <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-emerald-100 shadow-xs flex items-center gap-3.5 text-left group hover:border-emerald-300 transition">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-110 transition-transform">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-emerald-800">Primary Goal</div>
                    <div className="text-xs font-bold text-slate-800">Removing Hunger Daily</div>
                  </div>
                </div>

                {/* Objective 2 Card */}
                <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-teal-100 shadow-xs flex items-center gap-3.5 text-left group hover:border-teal-300 transition">
                  <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl group-hover:scale-110 transition-transform">
                    <Recycle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-teal-800">Secondary Goal</div>
                    <div className="text-xs font-bold text-slate-800">100% Zero Waste</div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link
                  href="/feed"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/20 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 group"
                >
                  <span>Explore Available Food</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base rounded-2xl border border-slate-200 shadow-xs transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  <span>Become a Food Donor</span>
                </Link>
              </motion.div>

              {/* Micro Trust Stats */}
              <motion.div
                variants={fadeInUp}
                className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 border-t border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">100% Free or Deep Discount</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">PIN Verified Handshakes</span>
                </div>
              </motion.div>
            </motion.div>

            {/* 🔴 REAL-TIME HERO PREVIEW CARD */}
            <motion.div
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative mx-auto max-w-md bg-white border border-slate-200 p-6 rounded-3xl shadow-xl">
                {/* Live Floating Tag */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Live Listing Nearby
                    </span>
                  </div>
                  {latestBundle && (
                    <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-black">
                      {latestBundle.price === 0 || !latestBundle.price
                        ? '🎁 FREE'
                        : `₹${latestBundle.price}`}
                    </span>
                  )}
                </div>

                {/* Card Content Rendered from Real Database */}
                {loadingBundle ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                    <p className="text-xs">Fetching active listings...</p>
                  </div>
                ) : latestBundle ? (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <Building className="w-3.5 h-3.5" />
                        <span>
                          {latestBundle.donor?.organization_name ||
                            latestBundle.donor?.full_name ||
                            'Local Food Business'}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                          {latestBundle.title}
                        </h4>
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex-shrink-0">
                          Qty: {latestBundle.quantity_remaining ?? latestBundle.quantity}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60 pt-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            Closes:{' '}
                            {new Date(latestBundle.pickup_window_end).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold truncate max-w-[140px]">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{latestBundle.donor?.city || 'Bareilly'}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/feed"
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <span>Reserve Bundle on Feed</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-sm">No Active Food Available Nearby</h4>
                      <p className="text-xs text-slate-500 px-2 leading-relaxed">
                        There are currently no surplus food bundles posted in your area. Check back soon or publish a surplus bundle if you are a food business!
                      </p>
                    </div>
                    <Link
                      href="/feed"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs mt-1"
                    >
                      <span>Browse Explore Feed</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                {/* Floating Eco Badge */}
                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xl flex items-center gap-3"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">2.5 kg CO₂ Saved</div>
                    <div className="text-[10px] text-slate-500">Per meal rescued</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🌟 OUR MISSION SECTION */}
        <MissionSection />

        {/* 💰 FAIR BUSINESS MODEL & ECOSYSTEM SECTION */}
        <EcosystemSection />

        {/* ⚡ REDESIGNED ANIMATED "HOW IT WORKS" SECTION */}
        <HowItWorksSection />

        {/* 🍱 BENTO FEATURE SHOWCASE */}
        <FeaturesSection />

        {/* ❓ FREQUENTLY ASKED QUESTIONS (FAQ) SECTION */}
        <FaqSection />

        {/* ✍️ FOUNDER'S PERSONAL MESSAGE */}
        <FounderNote />

        {/* 📢 Newsletter Section */}
        <NewsletterSection />
      </div>
    </div>
  );
}