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
    const { data, error } = await supabase
      .from('food_bundles')
      .select('*, donor:profiles(organization_name, full_name, city)')
      .eq('status', 'AVAILABLE')
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
        {/* 🚀 Hero Section */}
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <motion.div
              className="lg:col-span-7 space-y-8 text-center lg:text-left"
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
                <span>Hyper-Local Zero Food Waste</span>
              </motion.div>

              {/* Dynamic Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900"
              >
                Turn Surplus Food into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
                  Community Impact
                </span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                variants={fadeInUp}
                className="text-slate-600 text-base sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Connecting local bakeries, restaurants, and grocery stores with community members and neighborhood shelters in real time.
              </motion.p>

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
                  <span className="font-medium">QR/PIN Verified Handshakes</span>
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
                  <div className="py-8 text-center space-y-3">
                    <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">
                      No active listings right now. Check back soon or publish one as a donor!
                    </p>
                    <Link
                      href="/feed"
                      className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                    >
                      View Explore Feed
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

        {/* 📊 Impact Metrics Bar */}
        <section className="border-y border-slate-200 bg-white py-12 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="space-y-1">
                <div className="text-3xl sm:text-5xl font-black text-emerald-600">12,500+</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Meals Rescued
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-1">
                <div className="text-3xl sm:text-5xl font-black text-emerald-600">85+</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Partner Businesses
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-1">
                <div className="text-3xl sm:text-5xl font-black text-emerald-600">15.2 Tons</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  CO₂ Emissions Offset
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-1">
                <div className="text-3xl sm:text-5xl font-black text-emerald-600">100%</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Verified Quality
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 🌟 OUR MISSION SECTION */}
        <MissionSection />

        {/* 💰 FAIR BUSINESS MODEL & ECOSYSTEM SECTION */}
        <EcosystemSection />

        {/* ⚡ REDESIGNED ANIMATED "HOW IT WORKS" SECTION */}
        <HowItWorksSection />

        {/* 🍱 BENTO FEATURE SHOWCASE (NOW A SEPARATE COMPONENT) */}
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