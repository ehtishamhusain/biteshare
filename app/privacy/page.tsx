'use client';

import { motion, Variants } from 'framer-motion';
import { Shield, Sparkles, Lock, Eye, FileText, Database } from 'lucide-react';

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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          className="text-center space-y-3"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Protection & Privacy</span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight"
          >
            BiteShare Privacy Policy
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-slate-600 text-sm max-w-lg mx-auto">
            Last updated: July 2026. How we collect, safeguard, and utilize information across our hyper-local surplus food network.
          </motion.p>
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed"
        >
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" /> 1. Information We Collect
            </h2>
            <p>
              When you register as a donor business or community recipient on BiteShare, we collect necessary profile details such as your full name, email address, phone number, organization name, and business address.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" /> 2. Geolocation Data Usage
            </h2>
            <p>
              To connect you with nearby food offerings in real time, BiteShare utilizes GPS and geospatial coordinates (latitude and longitude). Location data is strictly used to measure proximity between stores and claimants and is never sold to third-party data brokers.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" /> 3. Data Security & Supabase Storage
            </h2>
            <p>
              All authentication and user records are stored securely using Supabase PostgreSQL infrastructure protected by Row Level Security (RLS) policies. Only authorized users can manage their individual claims and listings.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> 4. Contact Us Regarding Your Privacy
            </h2>
            <p>
              If you have questions, feedback, or wish to request the deletion of your account and personal profile data, please contact our team directly at{' '}
              <a
                href="mailto:support@biteshare.app"
                className="font-bold text-emerald-700 underline"
              >
                support@biteshare.app
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}