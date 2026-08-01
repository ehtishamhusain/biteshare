'use client';

import { motion, Variants } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Database,
  Share2,
  UserCheck,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Server,
  HelpCircle,
  MapPin,
  Sparkles,
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

export default function PrivacyPage() {
  const sections = [
    { id: 'collection', label: '1. Information We Collect' },
    { id: 'location', label: '2. Geolocation & GPS' },
    { id: 'usage', label: '3. How We Use Data' },
    { id: 'sharing', label: '4. Third-Party Sharing' },
    { id: 'security', label: '5. Database Security & RLS' },
    { id: 'rights', label: '6. Your Data Rights' },
    { id: 'retention', label: '7. Retention & Deletion' },
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
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Data Protection & Transparency</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight"
          >
            BiteShare Privacy Policy
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Effective Date: July 2026. How BiteShare collects, protects, and handles personal information across our hyper-local surplus food redistribution network.
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
              <span>Policy Index</span>
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

          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-10 text-slate-700 text-sm leading-relaxed"
          >

            {/* SECTION 1 */}
            <section id="collection" className="space-y-3 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  1. Information We Collect
                </h2>
              </div>
              <p>
                When you create an account or interact with BiteShare as a food donor (restaurant, bakery, store) or community recipient (shelter, individual user), we collect specific categories of data necessary for operational safety:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <strong className="block text-slate-900 font-bold mb-1">Account Credentials & Profile</strong>
                  <p className="text-slate-600">Email address, encrypted password, role selection (Donor vs Recipient), full name, and phone number.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <strong className="block text-slate-900 font-bold mb-1">Business & Shelter Details</strong>
                  <p className="text-slate-600">Organization name, street address, city, state, pincode, and operational hours.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <strong className="block text-slate-900 font-bold mb-1">Listing & Claim Handshakes</strong>
                  <p className="text-slate-600">Food descriptions, quantity, preparation timestamps, shelf life, and unique 4-Digit Security PINs generated for claims.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <strong className="block text-slate-900 font-bold mb-1">Technical Analytics</strong>
                  <p className="text-slate-600">Browser type, device metadata, and access timestamps stored securely to detect spam and abuse.</p>
                </div>
              </div>
            </section>

            {/* SECTION 2 */}
            <section id="location" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  2. Geolocation Data & Proximity Matching
                </h2>
              </div>
              <p>
                BiteShare relies on hyper-local discovery to prevent food waste. When enabled by your device browser:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Distance Calculation:</strong> GPS latitude and longitude coordinates are used solely to measure proximity between nearby surplus listings and recipient locations.
                </li>
                <li>
                  <strong className="text-slate-900">No Continuous Background Tracking:</strong> Location is requested only while browsing the feed or viewing pickup directions. We do not track your location in the background when the application is closed.
                </li>
              </ul>
            </section>

            {/* ZERO DATA SELLING PROMISE CARD */}
            <div className="p-5 sm:p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Our Uncompromising Guarantee: Zero Data Monetization</span>
              </div>
              <p className="text-xs text-emerald-900/90 leading-relaxed font-medium">
                BiteShare is built on community trust. We <strong>never sell, rent, or trade</strong> your personal contact details, order histories, or business addresses to ad brokers, marketers, or data aggregators.
              </p>
            </div>

            {/* SECTION 3 */}
            <section id="usage" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Eye className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  3. How We Use Your Information
                </h2>
              </div>
              <p>
                We process personal information exclusively for platform functionality, food safety auditing, and user security:
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Claim Coordination:</strong> Presenting your contact phone number to store staff or recipient shelters once a claim is confirmed to organize timely pickup.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Counter PIN Handshakes:</strong> Verifying generated 4-digit PINs at store counters to confirm legitimate order collection.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Impact Metrics:</strong> Aggregating anonymized data (e.g., total kilograms of food saved, CO₂ reduction) for environmental reporting.
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 4 */}
            <section id="sharing" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  4. Controlled Operational Data Sharing
                </h2>
              </div>
              <p>
                Information is disclosed only under strictly controlled operational situations:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Donor-Recipient Handshake:</strong> When a recipient reserves a bundle, the donor business receives the recipient's name and pickup PIN to prepare the order.
                </li>
                <li>
                  <strong className="text-slate-900">Infrastructure Partners:</strong> We host data with trusted cloud providers (Supabase PostgreSQL infrastructure & Vercel edge deployment) bound by strict data processing agreements.
                </li>
                <li>
                  <strong className="text-slate-900">Legal Compliance:</strong> If mandated by law or food safety authorities during a health investigation.
                </li>
              </ul>
            </section>

            {/* SECTION 5 */}
            <section id="security" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Server className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  5. Database Security & Row Level Protection (RLS)
                </h2>
              </div>
              <p>
                BiteShare leverages enterprise-grade security standards to protect user records against unauthorized access:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="block text-slate-900 font-bold mb-0.5">Row Level Security (RLS)</strong>
                  <span className="text-slate-600">PostgreSQL policies ensure users can only view or modify their own private claim history and profile records.</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <strong className="block text-slate-900 font-bold mb-0.5">Encrypted Transit & Storage</strong>
                  <span className="text-slate-600">All data in transit is encrypted using modern TLS 1.3 protocols, and passwords are salted and hashed.</span>
                </div>
              </div>
            </section>

            {/* SECTION 6 */}
            <section id="rights" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  6. Your Rights & Profile Control
                </h2>
              </div>
              <p>
                Regardless of your location, BiteShare provides comprehensive controls over your account information:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Access & Update:</strong> You can update your phone, address, and organization details anytime directly on your <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-bold">/profile</code> page.
                </li>
                <li>
                  <strong className="text-slate-900">Right to Erasure:</strong> You can request complete account deletion and data scrubbing by contacting our privacy officer.
                </li>
              </ul>
            </section>

            {/* SECTION 7 */}
            <section id="retention" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  7. Data Retention & Cookies
                </h2>
              </div>
              <p>
                We retain profile records for as long as your account remains active. Local session storage and secure HTTP cookies are utilized purely to maintain authentication state and keep you logged in.
              </p>
            </section>

            {/* Footer Contact Box */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-xs text-slate-900">Questions about your privacy?</span>
                  <span className="text-xs text-slate-500">Reach out to our dedicated data privacy team.</span>
                </div>
              </div>
              <a
                href="mailto:support@biteshare.app"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-xs whitespace-nowrap"
              >
                Email Support Team
              </a>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}