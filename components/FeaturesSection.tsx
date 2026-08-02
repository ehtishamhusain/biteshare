'use client';

import { motion, Variants } from 'framer-motion';
import {
  MapPin,
  QrCode,
  TrendingUp,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  Leaf,
  Sparkles,
  Activity,
  Cpu,
  Award,
} from 'lucide-react';

export default function FeaturesSection() {
  // Explicitly typed Animation Variants to eliminate TypeScript errors
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="py-24 bg-white border-t border-slate-200/80 relative overflow-hidden font-sans">
      {/* Subtle Background Glows matching the Home Page */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-100/30 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-black uppercase tracking-widest border border-emerald-200/80 shadow-2xs"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600" /> Full-Stack Architecture
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
          >
            Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">Speed & Impact</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed"
          >
            Built with modern full-stack web standards for real-time synchronization, secure verifications, and verified sustainability audits.
          </motion.p>
        </div>

        {/* 🌟 4-COLUMN INTERACTIVE FEATURE CARDS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          
          {/* CARD 1: GEOSPATIAL SEARCH ENGINE */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -8 }}
            className="bg-slate-50/80 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-emerald-600 animate-pulse" /> Live Radius
                </span>
              </div>

              <div>
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 mb-2 border border-emerald-200/60">
                  PostGIS Engine
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Geospatial Search
                </h3>
              </div>

              <p className="text-slate-600 text-xs sm:text-[13px] font-medium leading-relaxed">
                PostGIS location radius calculations ensure users discover surplus food nearest to their current location in real time.
              </p>
            </div>

            {/* Simulated Live Radar Widget */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-[11px] border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-emerald-600 animate-spin" /> GPS Proximity
                </span>
                <span className="text-emerald-700 font-black text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Within 2.5 km
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse block" />
                  <div>
                    <div className="text-[11px] font-black text-slate-900">Royal Bakery</div>
                    <div className="text-[9px] text-slate-500">Fresh Croissant Box</div>
                  </div>
                </div>
                <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                  0.6 km
                </span>
              </div>
            </div>
          </motion.div>

          {/* CARD 2: TWO-WAY PIN HANDSHAKE */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -8 }}
            className="bg-slate-50/80 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center border border-teal-200 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Anti-Fraud
                </span>
              </div>

              <div>
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 mb-2 border border-teal-200/60">
                  Secure Verification
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Two-Way Handshake
                </h3>
              </div>

              <p className="text-slate-600 text-xs sm:text-[13px] font-medium leading-relaxed">
                Every reservation generates a unique 4-digit security PIN to ensure only legitimate claimants collect food at the store counter.
              </p>
            </div>

            {/* Simulated Keypad PIN UI Widget */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                4-Digit Pickup PIN
              </span>

              <div className="flex items-center justify-center gap-1.5">
                {['8', '4', '2', '9'].map((digit, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-slate-50 border border-teal-300 rounded-lg flex items-center justify-center text-xs font-black text-teal-800 shadow-2xs"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              <div className="pt-0.5 flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-extrabold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Handshake</span>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: REALTIME CARBON ANALYTICS (WITH DEMO METRICS LABEL) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -8 }}
            className="bg-slate-50/80 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center border border-amber-200 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <span>Demo Metrics</span>
                </span>
              </div>

              <div>
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 mb-2 border border-amber-200/60">
                  Impact Reporting
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Carbon Analytics
                </h3>
              </div>

              <p className="text-slate-600 text-xs sm:text-[13px] font-medium leading-relaxed">
                Businesses track real-time environmental contributions, total meals rescued, financial cost recovery, and CO₂ offset metrics.
              </p>
            </div>

            {/* Simulated Impact Progress Bars Widget */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-emerald-600" /> CO₂ Offset
                  </span>
                  <span className="text-emerald-700 font-black">15.2 Tons</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full w-[84%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-600" /> Cost Recovered
                  </span>
                  <span className="text-amber-800 font-black">₹18,400</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full w-[72%]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 4: VERIFIED CSR CERTIFICATION */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -8 }}
            className="bg-slate-50/80 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-700 flex items-center justify-center border border-purple-200 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                  ESG Compliance
                </span>
              </div>

              <div>
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 mb-2 border border-purple-200/60">
                  Official Audit
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  CSR Certification
                </h3>
              </div>

              <p className="text-slate-600 text-xs sm:text-[13px] font-medium leading-relaxed">
                Partner restaurants automatically earn verified corporate social responsibility certificates to showcase environmental compliance.
              </p>
            </div>

            {/* Simulated CSR Certificate Badge Widget */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2 text-center">
              <div className="flex items-center justify-between text-[10px] border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-mono">ID: BS-CSR-2026</span>
                <span className="text-purple-700 font-black bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  Verified ✓
                </span>
              </div>
              <div className="text-[11px] font-extrabold text-slate-800 flex items-center justify-center gap-1.5 pt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Ready for Download</span>
              </div>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}