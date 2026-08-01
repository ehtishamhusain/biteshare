'use client';

import { motion, Variants } from 'framer-motion';
import {
  ShieldCheck,
  Scale,
  AlertCircle,
  Utensils,
  Clock,
  Coins,
  FileText,
  AlertTriangle,
  RefreshCw,
  UserX,
  HelpCircle,
  CheckCircle2,
  Percent,
  Ban,
  Store,
} from 'lucide-react';

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
    transition: { staggerChildren: 0.1 },
  },
};

export default function TermsPage() {
  const sections = [
    { id: 'quality', label: '1. Fresh Food & Hygiene Standards' },
    { id: 'payment-fee', label: '2. 12% Fee & Counter Cash Payment' },
    { id: 'inspection', label: '3. In-Store Inspection & Waiver' },
    { id: 'pickup-pin', label: '4. Pickup Windows & Security PIN' },
    { id: 'cancellation', label: '5. Cancellations & No-Shows' },
    { id: 'suspension', label: '6. Direct Account Suspension' },
    { id: 'liability', label: '7. Limitation of Liability' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200 shadow-xs"
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Legal Framework & Platform Rules</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight"
          >
            BiteShare Terms of Service
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Effective Date: July 2026. These terms govern the redistribution of surplus food, safety compliance, in-store inspection waivers, and platform fee structures.
          </motion.p>
        </motion.div>

        {/* Main Grid Layout (Sidebar Index + Content Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Sticky Table of Contents Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block sticky top-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Quick Navigation</span>
            </div>
            <nav className="space-y-1 text-xs font-bold text-slate-600">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block py-2 px-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition"
                >
                  {sec.label}
                </a>
              ))}
            </nav>
          </motion.div>

          {/* Content Card Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-10 text-slate-700 text-sm leading-relaxed"
          >
            
            {/* SECTION 1 */}
            <section id="quality" className="space-y-3 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Utensils className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  1. Fresh Food & Strict Hygiene Standards (For Donors)
                </h2>
              </div>
              <p>
                Food Donors (restaurants, bakeries, cafes, and grocery stores) agree to uphold uncompromising safety and hygiene standards:
              </p>
              <ul className="space-y-2.5 pt-1 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Publish Only Fresh Food:</strong> Donors must only list surplus food that was prepared fresh on the same day or remains well within safe consumable shelf-life limits.
                </li>
                <li>
                  <strong className="text-slate-900">Proper Refrigeration:</strong> Perishable, dairy, and meat-based items must be maintained under rigorous, proper refrigeration up until the moment of pickup.
                </li>
                <li>
                  <strong className="text-slate-900">Zero Tolerance for Expired Food:</strong> Listing expired, spoiled, or contaminated food is strictly prohibited and poses severe health hazards.
                </li>
              </ul>
            </section>

            {/* SECTION 2: 12% FEE & COUNTER CASH PAYMENT */}
            <section id="payment-fee" className="space-y-4 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Coins className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  2. 12% Platform Fee & Counter Cash Payment Model
                </h2>
              </div>

              <div className="p-5 sm:p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <Store className="w-5 h-5 text-emerald-600" />
                  <span>Direct Counter Payment (No Online Gateway)</span>
                </div>
                <p className="text-xs text-emerald-900/90 leading-relaxed font-medium">
                  BiteShare <strong>does not process online payments</strong> on the platform. 
                </p>
                <ul className="space-y-2 text-xs text-emerald-900/90 pl-4 list-disc">
                  <li>
                    <strong>Direct Payment:</strong> Recipients must pay directly to the restaurant counter or store cash register upon collecting their surplus food bundle.
                  </li>
                  <li>
                    <strong>12% Service Fee Structure:</strong> For facilitating hyper-local surplus matching, BiteShare applies a 12% platform facilitation fee (reflected on the digital reservation ticket), which is settled in accordance with restaurant-partner agreements.
                  </li>
                  <li>
                    <strong>Free Shelter Donations:</strong> 100% free surplus food bundles directed to verified non-profit shelters remain completely free of service charges.
                  </li>
                </ul>
              </div>
            </section>

            {/* SECTION 3: IN-STORE INSPECTION & WAIVER */}
            <section id="inspection" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  3. Mandatory In-Store Food Inspection & Expiry Waiver
                </h2>
              </div>
              <p>
                Recipient safety and satisfaction are paramount. Therefore, the following inspection protocol is mandatory:
              </p>
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Inspect Before You Buy / Collect</span>
                </div>
                <p className="leading-relaxed">
                  Recipients are <strong>strictly required to inspect the food at the restaurant counter</strong> before completing payment and final pickup handshakes. Once the food is inspected, approved, and collected from the store, <strong>BiteShare is not responsible or liable for any expired, damaged, or unpalatable food items</strong>.
                </p>
              </div>
            </section>

            {/* SECTION 4 */}
            <section id="pickup-pin" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  4. Pickup Windows & 4-Digit Security PIN Handshake
                </h2>
              </div>
              <p>
                To preserve food safety and inventory accuracy, all reservations require secure verification:
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Timely Arrival:</strong> Recipients must arrive at the store within the exact pickup timeframe indicated on their order ticket.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">PIN Handshake:</strong> Store staff will request your unique <strong>4-Digit Security PIN</strong> before handing over the food package.
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 5 */}
            <section id="cancellation" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  5. Cancellation & No-Show Policies
                </h2>
              </div>
              <p>
                Surplus food has a minimal window of viability. Cancellations must be managed responsibly:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Cancellations:</strong> Recipients may cancel reservations ahead of the pickup window via the app to release items back to local shelters or neighbors.
                </li>
                <li>
                  <strong className="text-slate-900">No-Shows:</strong> Failing to show up for a reserved bundle without cancellation counts as a strict no-show strike. Accumulating multiple strikes leads to account restriction.
                </li>
              </ul>
            </section>

            {/* SECTION 6: DIRECT ACCOUNT SUSPENSION */}
            <section id="suspension" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <Ban className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  6. Direct Account Suspension (For Hygiene & Safety Violations)
                </h2>
              </div>
              <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl space-y-2 text-xs text-red-900">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Zero Tolerance Policy for Donors</span>
                </div>
                <p className="leading-relaxed">
                  If a food donor publishes stale, unhygienic, improperly refrigerated, or expired food, or receives substantiated complaints regarding food quality from recipients, <strong>their BiteShare account will face immediate, direct suspension</strong> without prior warning to protect public health and safety.
                </p>
              </div>
            </section>

            {/* SECTION 7 */}
            <section id="liability" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  7. Limitation of Liability & Intermediary Role
                </h2>
              </div>
              <p>
                BiteShare acts strictly as an online technology facilitator connecting independent food businesses with community recipients.
              </p>
              <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 italic">
                BiteShare does not prepare, package, store, or taste-test food items. Restaurants and food donors retain 100% legal liability and responsibility for the safety, wholesomeness, and consumption fitness of all redistributed food.
              </p>
            </section>

            {/* Footer Questions Box */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-xs text-slate-900">Have questions about our terms?</span>
                  <span className="text-xs text-slate-500">Contact our legal and safety team anytime.</span>
                </div>
              </div>
              <a
                href="mailto:support@biteshare.app"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-xs whitespace-nowrap"
              >
                Contact Legal Support
              </a>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}