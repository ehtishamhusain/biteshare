'use client';

import { motion, Variants } from 'framer-motion';
import { ShieldCheck, Sparkles, Scale, AlertCircle, Utensils, Clock } from 'lucide-react';

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

export default function TermsPage() {
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
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Platform Guidelines</span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight"
          >
            BiteShare Terms of Service
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-slate-600 text-sm max-w-lg mx-auto">
            Last updated: July 2026. Rules governing surplus food redistribution, security handshakes, and food safety standards.
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
              <Utensils className="w-5 h-5 text-emerald-600" /> 1. Food Quality & Safety Standards
            </h2>
            <p>
              Donors (restaurants, bakeries, grocery stores) agree to list only edible, properly packaged, and safe surplus items. Food items must adhere to municipal hygienic standards and be listed with accurate allergen notes.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" /> 2. Pickup Windows & 4-Digit Security PINs
            </h2>
            <p>
              Recipients must collect reserved bundles before the specified pickup window closes. Upon counter arrival, recipients must present their unique 4-digit PIN to store staff to complete the handshake.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-600" /> 3. Limitation of Liability
            </h2>
            <p>
              BiteShare operates as a technology facilitator bridging local food businesses and community shelters. While we encourage zero waste practices, BiteShare is not liable for individual transport delays or uncollected store reservations.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> 4. Community Conduct
            </h2>
            <p>
              Users creating fraudulent claims or repeatedly failing to collect reserved orders may have their accounts suspended to ensure fair access for all community members.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}