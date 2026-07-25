'use client';

import { motion, Variants } from 'framer-motion';
import {
  TrendingUp,
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Store,
  Users,
  Percent,
  CheckCircle2,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function EcosystemSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-4 max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fair & Transparent Ecosystem</span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900"
          >
            A Sustainable Model That Benefits <span className="text-emerald-600">Everyone</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-slate-600 text-sm sm:text-base leading-relaxed"
          >
            BiteShare operates as a hybrid social enterprise. We empower local food businesses to recover lost costs while ensuring high-quality surplus meals reach citizens at honest prices.
          </motion.p>
        </motion.div>

        {/* 🌟 3-COLUMN ECOSYSTEM GRID */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
        >
          {/* Column 1: For Restaurants (90% Cost Recovery) */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -4 }}
            className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xs hover:shadow-md transition"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <Store className="w-6 h-6" />
              </div>

              <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                90% Recouped to Stores
              </span>

              <h3 className="text-xl font-extrabold text-slate-900">
                For Restaurants & Bakeries
              </h3>

              <p className="text-slate-600 text-xs leading-relaxed">
                Eateries recoup up to 90% of their raw ingredient costs on food that would otherwise be thrown away, while gaining valuable new neighborhood foot traffic.
              </p>
            </div>

            <ul className="space-y-2 pt-4 border-t border-slate-200 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero signup or monthly listing fees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Direct weekly bank/UPI payouts</span>
              </li>
            </ul>
          </motion.div>

          {/* Column 2: 10% Platform Sustainability Fee */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -4 }}
            className="bg-emerald-900 text-white rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-emerald-300 flex items-center justify-center font-black border border-emerald-700">
                <Percent className="w-6 h-6" />
              </div>

              <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-emerald-800 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700">
                10% Fair Service Fee
              </span>

              <h3 className="text-xl font-extrabold text-white">
                Platform Operations
              </h3>

              <p className="text-emerald-100 text-xs leading-relaxed">
                A tiny 10% platform fee on paid items funds our real-time WebSocket servers, map geocoding APIs, counter verification security, and community outreach.
              </p>
            </div>

            <div className="pt-4 border-t border-emerald-800 text-xs text-emerald-200 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Keeps BiteShare independent & ad-free</span>
            </div>
          </motion.div>

          {/* Column 3: 0% Fee on Free Donations (Pillar of Zero Hunger) */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -4 }}
            className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xs hover:shadow-md transition"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                <Heart className="w-6 h-6 fill-amber-700" />
              </div>

              <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
                0% Fee on Free Donations
              </span>

              <h3 className="text-xl font-extrabold text-slate-900">
                100% Free Food Pledges
              </h3>

              <p className="text-slate-600 text-xs leading-relaxed">
                When a donor publishes meals for ₹0 (Free Charity), BiteShare charges <strong className="text-slate-900">₹0 commission</strong>. Feeding vulnerable citizens always comes before platform revenue.
              </p>
            </div>

            <ul className="space-y-2 pt-4 border-t border-slate-200 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Priority notification to local shelters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Tax-deductible waste certificate log</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}