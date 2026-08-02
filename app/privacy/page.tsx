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
  CheckCircle2,
  ShieldCheck,
  Server,
  HelpCircle,
  MapPin,
  IndianRupee,
  Award,
  KeyRound,
  Receipt,
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
    { id: 'location', label: '2. Geolocation & Auto GPS' },
    { id: 'financials', label: '3. Platform Fees & Accounting' },
    { id: 'pin-security', label: '4. Pickup PIN Handshakes' },
    { id: 'csr-analytics', label: '5. ESG & CSR Certification' },
    { id: 'security', label: '6. Database Security & RLS' },
    { id: 'sharing', label: '7. Controlled Data Sharing' },
    { id: 'rights', label: '8. Your Rights & Control' },
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
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Data Protection & Platform Governance</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight"
          >
            BiteShare Privacy Policy
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Effective Date: August 2026. Comprehensive breakdown of how BiteShare collects, handles, and protects user data across our hyper-local surplus food marketplace, financial ledger, and ESG impact network.
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
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  1. Information We Collect
                </h2>
              </div>
              <p>
                To facilitate food waste redistribution, process atomic claims, and maintain financial integrity, BiteShare collects specific user data based on your platform role (Food Donor, Community Recipient, or Platform Administrator):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <strong className="block text-slate-900 font-bold mb-1">Account & Profile Identity</strong>
                  <p className="text-slate-600">Email address, encrypted authentication tokens, full name, phone number, and user role selection.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <strong className="block text-slate-900 font-bold mb-1">Store & Shelter Details</strong>
                  <p className="text-slate-600">Restaurant or organization name, street address, city, state, pincode, and operating pickup windows.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <strong className="block text-slate-900 font-bold mb-1">Claim Records & Security PINs</strong>
                  <p className="text-slate-600">Claimed food items, item quantities, total prices, claim status, and unique 4-digit pickup verification PINs.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <strong className="block text-slate-900 font-bold mb-1">Financial & Fee Accounting</strong>
                  <p className="text-slate-600">Gross order sales GMV, 12% platform fee deductions, 88% store net payout totals, and rolling fee settlement status.</p>
                </div>
              </div>
            </section>

            {/* SECTION 2 */}
            <section id="location" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  2. Geolocation & Auto GPS Detection
                </h2>
              </div>
              <p>
                Proximity matching is critical for rescuing fresh surplus meals before expiration. BiteShare utilizes background GPS detection and dynamic address geocoding:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Automatic Background Location:</strong> When creating food listings, browser GPS coordinates (latitude/longitude) are automatically captured to place listings accurately on the marketplace map.
                </li>
                <li>
                  <strong className="text-slate-900">Dynamic Address Geocoding:</strong> If GPS is disabled, our system dynamically geocodes typed street addresses via Nominatim API to attach verified map coordinates.
                </li>
                <li>
                  <strong className="text-slate-900">No Continuous Tracking:</strong> Location permissions are used strictly during active session browsing to sort nearby food items and calculate distance. We do not track your movement when the application is closed.
                </li>
              </ul>
            </section>

            {/* ZERO DATA MONETIZATION GUARANTEE */}
            <div className="p-5 sm:p-6 bg-emerald-50/80 border border-emerald-200 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Zero Data Monetization Guarantee</span>
              </div>
              <p className="text-xs text-emerald-900/90 leading-relaxed font-medium">
                BiteShare is built on community trust. We <strong>never sell, lease, trade, or monetize</strong> your personal details, order histories, phone numbers, or business sales data to third-party advertisers or data brokers.
              </p>
            </div>

            {/* SECTION 3 */}
            <section id="financials" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  3. Platform Fee, Invoicing & Financial Ledger
                </h2>
              </div>
              <p>
                BiteShare operates a transparent financial model to sustain platform maintenance, real-time channels, and server hosting:
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">12% Platform Commission:</strong> BiteShare retains a 12% platform fee on completed claims, allocating 88% net earnings directly to donor stores.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Rolling Balance & FIFO Settlement:</strong> Unpaid fees are tracked in an itemized rolling balance. Fee payments recorded by admins clear claims chronologically using First-In, First-Out (FIFO) accounting.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Admin Financial Ledger:</strong> Financial summaries are accessible exclusively to authorized BiteShare administrators for auditing, billing statement generation, and RFC 4180-compliant CSV exports.
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 4 */}
            <section id="pin-security" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  4. Counter Verification & Pickup PIN Handshakes
                </h2>
              </div>
              <p>
                To prevent fraud, unauthorized claims, and missing orders at store counters:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">4-Digit Security PIN:</strong> Every confirmed claim generates a unique 4-digit PIN that must be presented at the restaurant counter to verify the order.
                </li>
                <li>
                  <strong className="text-slate-900">Handshake Confidentiality:</strong> Contact details (recipient phone number and name) are shared with the store staff only after a reservation is confirmed to coordinate smooth handover.
                </li>
              </ul>
            </section>

            {/* SECTION 5 */}
            <section id="csr-analytics" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  5. ESG Metrics & CSR Impact Certification
                </h2>
              </div>
              <p>
                BiteShare calculates environmental sustainability statistics (Meals Rescued, CO₂ Emissions Offset, and Economic Value Diverted):
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Aggregated ESG Analytics:</strong> Claim data is converted into aggregated environmental savings reports for corporate ESG reporting.
                </li>
                <li>
                  <strong className="text-slate-900">Official CSR Certificates:</strong> Partner businesses receive verifiable high-resolution CSR Certificates carrying a unique cryptographically generated Certificate ID (`BS-CSR-YYYY-XXXX`).
                </li>
              </ul>
            </section>

            {/* SECTION 6 */}
            <section id="security" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Server className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  6. Database Security & Row-Level Policies (RLS)
                </h2>
              </div>
              <p>
                BiteShare employs enterprise database security policies to ensure strict data isolation and protection:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <strong className="block text-slate-900 font-bold mb-0.5">Row-Level Security (RLS)</strong>
                  <span className="text-slate-600">PostgreSQL policies ensure users can strictly access and modify only their own profiles and claim histories.</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <strong className="block text-slate-900 font-bold mb-0.5">Encrypted Auth & Recovery</strong>
                  <span className="text-slate-600">All passwords are salted and hashed. Password recovery flows utilize secure tokens redirected directly to `/update-password`.</span>
                </div>
              </div>
            </section>

            {/* SECTION 7 */}
            <section id="sharing" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Share2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  7. Controlled Operational Infrastructure Sharing
                </h2>
              </div>
              <p>
                Your data is stored and processed exclusively by verified cloud infrastructure providers operating under strict data protection agreements:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Database Hosting:</strong> Supabase PostgreSQL (Managed cloud database with automated backups).
                </li>
                <li>
                  <strong className="text-slate-900">Application Deployment:</strong> Vercel Edge Network (Secure serverless hosting).
                </li>
                <li>
                  <strong className="text-slate-900">Legal Compliance:</strong> Information may be disclosed if required by law or local food health authorities during official food safety inquiries.
                </li>
              </ul>
            </section>

            {/* SECTION 8 */}
            <section id="rights" className="space-y-3 pt-6 border-t border-slate-100 scroll-mt-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  8. Your Data Rights & Account Controls
                </h2>
              </div>
              <p>
                You retain complete authority over your personal information on BiteShare:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-xs text-slate-600">
                <li>
                  <strong className="text-slate-900">Profile Updates:</strong> You can edit your phone number, business address, and store details anytime on the profile settings page.
                </li>
                <li>
                  <strong className="text-slate-900">Account Erasure:</strong> You have the right to request complete account deletion and data scrubbing by contacting our privacy team.
                </li>
              </ul>
            </section>

            {/* Footer Contact Box */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-3xl">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="block font-bold text-xs text-slate-900">Questions about our Privacy Policy?</span>
                  <span className="text-xs text-slate-500">Contact our platform data protection officer.</span>
                </div>
              </div>
              <a
                href="mailto:support@biteshare.in"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition shadow-xs whitespace-nowrap"
              >
                Email Privacy Team
              </a>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}