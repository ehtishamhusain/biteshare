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
    { id: 'quality', label: '1. Quality & Safety' },
    { id: 'business-model', label: '2. 10% Business Model' },
    { id: 'pickup-pin', label: '3. Pickup & Security PIN' },
    { id: 'cancellation', label: '4. Cancellations & No-Shows' },
    { id: 'liability', label: '5. Limitation of Liability' },
    { id: 'conduct', label: '6. Community Conduct & Fraud' },
    { id: 'governance', label: '7. Governance & Updates' },
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200 shadow-sm"
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
            Effective Date: July 2026. These terms govern the redistribution of surplus food, safety compliance, pickup handshakes, and platform transaction models.
          </motion.p>
        </motion.div>

        {/* Main Grid Layout (Sidebar Index + Content Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Sticky Table of Contents Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block sticky top-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
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
            className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed"
          >
            
            {/* SECTION 1 */}
            <section id="quality" className="space-y-3 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Utensils className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  1. Food Quality & Safety Compliance
                </h2>
              </div>
              <p>
                Food Donors (including restaurants, bakeries, caterers, and grocery outlets) warrant that all surplus meals listed on BiteShare are freshly prepared, wholesome, and fit for human consumption.
              </p>
              <ul className="space-y-2 pt-1 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Municipal Health Standards:</strong> Items must strictly adhere to local food safety and hygiene regulations (e.g., FSSAI standards in India).
                </li>
                <li>
                  <strong className="text-slate-900">Allergen Transparency:</strong> Donors are obligated to declare major allergens (nuts, dairy, gluten, shellfish) during bundle creation.
                </li>
                <li>
                  <strong className="text-slate-900">Storage Integrity:</strong> Temperature-sensitive perishable items must be maintained in proper refrigeration until pickup.
                </li>
              </ul>
            </section>

            {/* SECTION 2: 10% BUSINESS MODEL CALLOUT CARD */}
            <section id="business-model" className="space-y-4 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Coins className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  2. Platform Business Model & 10% Service Fee
                </h2>
              </div>

              <div className="p-5 sm:p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <Percent className="w-5 h-5 text-emerald-600" />
                  <span>How BiteShare Operates (10% Facilitation Fee)</span>
                </div>
                <p className="text-xs text-emerald-900/90 leading-relaxed font-medium">
                  BiteShare operates on a sustainable social-enterprise model. For discounted paid surplus bundles (Surplus Surprise Boxes):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200/80 shadow-xs">
                    <span className="block text-emerald-800 font-black text-xs uppercase">90% Value Direct to Donors</span>
                    <span className="text-slate-600 text-xs">Retained by local businesses to cover base ingredient and operational costs.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200/80 shadow-xs">
                    <span className="block text-emerald-800 font-black text-xs uppercase">10% BiteShare Platform Fee</span>
                    <span className="text-slate-600 text-xs">Supports server infrastructure, SMS PIN verification, security handshakes, and free shelter listings.</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800 pt-1">
                  * Note: 100% Free donation bundles routed to verified non-profit community shelters remain <strong>completely exempt</strong> from all platform fees.
                </p>
              </div>
            </section>

            {/* SECTION 3 */}
            <section id="pickup-pin" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  3. Pickup Windows & 4-Digit Security PIN Handshake
                </h2>
              </div>
              <p>
                To maintain real-time inventory accuracy and food freshness, all claims are subject to strict verification handshakes:
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Strict Windows:</strong> Recipients must arrive at the store within the allotted pickup timeframe specified on their order ticket.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">PIN Verification:</strong> Recipients must physically present their generated <strong>4-Digit Security PIN</strong> to store staff prior to food handover.
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 4 */}
            <section id="cancellation" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  4. Cancellation, Refunds & No-Show Policies
                </h2>
              </div>
              <p>
                Because surplus food is highly perishable, standard e-commerce cancellation rules do not apply:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Recipient Cancellations:</strong> Paid claims can be cancelled up to 30 minutes before the pickup window opens for a full refund (minus gateway processing charges).
                </li>
                <li>
                  <strong className="text-slate-900">Uncollected Food (No-Shows):</strong> Claims left uncollected past the window close time will be forfeited without refund to compensate the donor for store holding.
                </li>
                <li>
                  <strong className="text-slate-900">Quality Refunds:</strong> If claimed food is uncollected due to store closure or mismatched safety standards, recipients must report within 15 minutes at pickup for a 100% refund.
                </li>
              </ul>
            </section>

            {/* SECTION 5 */}
            <section id="liability" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  5. Limitation of Liability & Intermediary Status
                </h2>
              </div>
              <p>
                BiteShare acts purely as an intermediary technology platform connecting independent food providers with local consumers and shelters.
              </p>
              <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 italic">
                BiteShare does not cook, inspect, or transport food items directly. Donors remain solely liable for the quality, preparation accuracy, and sanitary state of their food listings under local civil and food safety laws.
              </p>
            </section>

            {/* SECTION 6 */}
            <section id="conduct" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <UserX className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  6. Community Conduct & Anti-Fraud Protocol
                </h2>
              </div>
              <p>
                To protect local businesses and community trust, the following behaviors trigger immediate account suspension:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl text-red-900">
                  <strong className="block font-bold">Fake Accounts & Multiple Claims</strong>
                  <span>Creating duplicate accounts to monopolize free shelter bundles or discounted boxes.</span>
                </div>
                <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl text-red-900">
                  <strong className="block font-bold">Repeated No-Show Strikes</strong>
                  <span>Accumulating 3 uncollected pickup reservations within 30 days without prior notice.</span>
                </div>
              </div>
            </section>

            {/* SECTION 7 */}
            <section id="governance" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  7. Governance & Amendments
                </h2>
              </div>
              <p>
                BiteShare reserves the right to modify these terms to reflect changes in food safety regulations or platform features. Registered users will receive email notifications 14 days prior to any material policy changes taking effect.
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
                href="mailto:support@biteshare.org"
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