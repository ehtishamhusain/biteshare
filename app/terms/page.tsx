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
  HelpCircle,
  CheckCircle2,
  Ban,
  Store,
  KeyRound,
  Award,
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
    { id: 'payment-fee', label: '2. 12% Fee & Direct Counter Payment' },
    { id: 'inspection', label: '3. In-Store Inspection & Waiver' },
    { id: 'pickup-pin', label: '4. Pickup Windows & Security PIN' },
    { id: 'cancellation', label: '5. Cancellations & No-Shows' },
    { id: 'suspension', label: '6. Direct Account Suspension' },
    { id: 'liability', label: '7. Limitation of Liability' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
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
            Effective Date: August 2026. These terms govern the redistribution of surplus food, hygiene compliance, counter payments, rolling fee accounting, and in-store inspection waivers across the BiteShare network.
          </motion.p>
        </motion.div>

        {/* Main Grid Layout (Sidebar Index + Content Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Sticky Table of Contents Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block sticky top-8 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3"
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
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Utensils className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  1. Fresh Food & Strict Hygiene Standards (For Donors)
                </h2>
              </div>
              <p>
                Food Donors (restaurants, bakeries, cafes, and grocery stores) agree to uphold uncompromising safety, preparation, and hygiene standards:
              </p>
              <ul className="space-y-2.5 pt-1 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Publish Only Fresh Surplus:</strong> Donors must list only surplus food that was prepared fresh on the same day or remains well within safe consumable shelf-life limits.
                </li>
                <li>
                  <strong className="text-slate-900">Proper Cold Storage & Packaging:</strong> Perishable, dairy, cooked, and meat-based items must be maintained under rigorous refrigeration and packaged in clean, food-grade containers up to pickup handover.
                </li>
                <li>
                  <strong className="text-slate-900">Zero Tolerance for Contamination:</strong> Listing expired, spoiled, sour, or contaminated food is strictly forbidden and subject to immediate legal and platform sanctions.
                </li>
              </ul>
            </section>

            {/* SECTION 2: 12% FEE & COUNTER PAYMENT MODEL */}
            <section id="payment-fee" className="space-y-4 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Coins className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  2. 12% Platform Facilitation Fee & Direct Counter Payment
                </h2>
              </div>

              <div className="p-5 sm:p-6 bg-emerald-50/80 border border-emerald-200 rounded-3xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <Store className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Direct In-Store Counter Payment (No Online Gateway)</span>
                </div>
                <p className="text-xs text-emerald-900/90 leading-relaxed font-medium">
                  BiteShare <strong>does not charge or process online payments from customers</strong> on the application. 
                </p>
                <ul className="space-y-2 text-xs text-emerald-900/90 pl-4 list-disc font-medium">
                  <li>
                    <strong className="text-slate-900">Direct Register Settlement:</strong> Recipients pay cash or UPI directly to the restaurant counter register upon collecting their reserved surplus food package.
                  </li>
                  <li>
                    <strong className="text-slate-900">12% Commission Structure:</strong> For maintaining hyper-local discovery, server infrastructure, and real-time verification, BiteShare retains a 12% platform fee. Store partners keep 88% net earnings.
                  </li>
                  <li>
                    <strong className="text-slate-900">FIFO Rolling Balance Ledger:</strong> Accumulated platform fees due from restaurants are recorded in an admin rolling balance and settled using First-In, First-Out (FIFO) chronological order.
                  </li>
                  <li>
                    <strong className="text-slate-900">100% Free Shelter Donations:</strong> Surplus items designated for verified shelters and NGOs are completely exempt from platform fees.
                  </li>
                </ul>
              </div>
            </section>

            {/* SECTION 3: IN-STORE INSPECTION & WAIVER */}
            <section id="inspection" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-2xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  3. Mandatory In-Store Food Inspection & Quality Waiver
                </h2>
              </div>
              <p>
                Recipient safety and food quality approval are enforced prior to payment completion:
              </p>
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Inspect Before Payment & Handover</span>
                </div>
                <p className="leading-relaxed">
                  Recipients are <strong>strictly required to physically inspect the food bundle at the store counter</strong> prior to making payment. Once the recipient inspects, approves, and takes possession of the food package, <strong>BiteShare bears zero liability for subsequent spoilage, unpalatability, or handling issues</strong>.
                </p>
              </div>
            </section>

            {/* SECTION 4 */}
            <section id="pickup-pin" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  4. Pickup Windows & 4-Digit Security PIN Handshakes
                </h2>
              </div>
              <p>
                To maintain order accuracy and prevent unauthorized pickups at store counters:
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Strict Window Adherence:</strong> Recipients must arrive at the store within the specific pickup window close time shown on their reservation ticket.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">4-Digit Security PIN:</strong> Store counter staff will request your unique 4-digit claim PIN before releasing the food parcel.
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 5 */}
            <section id="cancellation" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  5. Cancellations, Expiries & No-Show Policy
                </h2>
              </div>
              <p>
                Surplus food has a limited shelf life. Order commitments must be honored responsibly:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Timely Cancellations:</strong> Recipients who cannot make a pickup must cancel their claim in-app ahead of time to release items back to the local feed.
                </li>
                <li>
                  <strong className="text-slate-900">No-Show Penalty Strikes:</strong> Reserving food and failing to show up without cancelling results in a no-show strike. Multiple strikes trigger automatic account suspension.
                </li>
              </ul>
            </section>

            {/* SECTION 6: DIRECT ACCOUNT SUSPENSION */}
            <section id="suspension" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 text-red-700 rounded-2xl">
                  <Ban className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  6. Direct Account Suspension (Zero-Tolerance Food Quality)
                </h2>
              </div>
              <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-2 text-xs text-red-900">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Zero Tolerance Policy for Quality & Hygiene Violations</span>
                </div>
                <p className="leading-relaxed">
                  If a food donor lists stale, unhygienic, improperly stored, or expired food, or receives substantiated food quality complaints, <strong>their BiteShare partner account will face immediate, permanent suspension</strong> without notice to preserve community health and safety.
                </p>
              </div>
            </section>

            {/* SECTION 7 */}
            <section id="liability" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-2xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  7. Limitation of Liability & Facilitator Role
                </h2>
              </div>
              <p>
                BiteShare operates exclusively as a hyper-local software facilitator connecting independent food businesses with community members.
              </p>
              <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-200 italic">
                BiteShare does not manufacture, cook, inspect, or package food items. Restaurant partners retain 100% legal liability and responsibility for the hygiene, wholesomeness, and safety compliance of all items redistributed.
              </p>
            </section>

            {/* Footer Questions Box */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-3xl">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-xs text-slate-900">Have questions about our Terms of Service?</span>
                  <span className="text-xs text-slate-500">Contact our legal and safety compliance team.</span>
                </div>
              </div>
              <a
                href="mailto:support@biteshare.in"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition shadow-xs whitespace-nowrap"
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