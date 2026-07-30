'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Store,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Utensils,
  CheckCircle2,
  Heart,
  Zap,
  Lock,
  UserPlus,
  LogIn,
  X,
} from 'lucide-react';

export default function HowItWorksSection() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);

  const steps = [
    {
      step: '01',
      icon: Store,
      title: 'List Surplus Food',
      subtitle: 'For Restaurants & Bakeries',
      description:
        'Post unsold, freshly prepared meals or bakery boxes at 50-80% OFF—or set ₹0 for free shelter donations.',
      badge: 'Takes < 30 Seconds',
      color: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50/80',
      borderAccent: 'hover:border-emerald-500',
    },
    {
      step: '02',
      icon: Sparkles,
      title: 'Discover & Reserve',
      subtitle: 'For Local Neighbors & Shelters',
      description:
        'Browse live nearby listings on the explore feed. Pick your batch quantity and claim your food instantly.',
      badge: 'Real-Time Inventory',
      color: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50/80',
      borderAccent: 'hover:border-amber-500',
    },
    {
      step: '03',
      icon: ShoppingBag,
      title: 'Quick Store Pickup',
      subtitle: 'Zero Waste Impact',
      description:
        'Head to the store, show your 4-digits claim PIN, collect your fresh food, and help save the planet!',
      badge: '100% Fresh Guaranteed',
      color: 'from-teal-500 to-cyan-600',
      lightBg: 'bg-teal-50/80',
      borderAccent: 'hover:border-teal-500',
    },
  ];

  // 🔒 Auth Check Handler for "List Food as Donor"
  const handleDonorClick = async () => {
    setCheckingAuth(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCheckingAuth(false);

    if (user) {
      // Logged in -> Go to donor dashboard
      router.push('/donor/dashboard');
    } else {
      // Guest User -> Show Pop-up Auth Modal
      setShowAuthModal(true);
    }
  };

  // Explicitly typed Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-100/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest border border-emerald-200/80 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Simple & Impactful
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
          >
            How <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">BiteShare</span> Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed"
          >
            Connecting surplus food from local bakeries and restaurants with neighbors in 3 easy steps.
          </motion.p>
        </div>

        {/* 3 Step Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Desktop Dotted Flow Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-slate-200 -translate-y-12 -z-0" />

          {steps.map((item, index) => {
            const IconComponent = item.icon;

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`relative bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs hover:shadow-xl ${item.borderAccent} transition-all duration-300 flex flex-col justify-between group z-10`}
              >
                <div className="space-y-6">
                  
                  {/* Step Number & Icon Header */}
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7" />
                    </div>

                    <span className="text-4xl font-black tracking-tighter text-slate-200 group-hover:text-emerald-500/30 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${item.lightBg} text-slate-700 mb-2 border border-slate-100`}>
                      {item.badge}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Card Bottom Indicator */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                  <span>Step {index + 1} of 3</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Dual Call-To-Action Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-60 h-60 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-black tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400/20" /> Ready to Make a Difference Today?
            </h4>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Join locals reducing food waste and advancing zero hunger.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* 🔴 Donor Action Button with Auth Check */}
            <button
              onClick={handleDonorClick}
              disabled={checkingAuth}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{checkingAuth ? 'Checking...' : 'List Food as Donor'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/feed"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs sm:text-sm rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>Browse Live Feed</span>
            </Link>
          </div>
        </motion.div>

      </div>

      {/* 🌟 AUTH POPUP MODAL FOR GUEST USERS */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon & Title */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Sign in to Publish Surplus Food
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                    Please log in or create a free donor account to start listing surplus meals and bakery boxes for local neighbors!
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  href="/signup"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account / Sign Up</span>
                </Link>

                <Link
                  href="/login"
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm rounded-2xl border border-slate-200 transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>Already Have an Account? Log In</span>
                </Link>
              </div>

              <p className="text-center text-[11px] text-slate-400 font-medium">
                Takes less than 1 minute to set up your store profile.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}