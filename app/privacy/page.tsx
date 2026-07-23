import Navbar from '@/components/Navbar';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span>Legal Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mt-2">Last Updated: July 2026</p>
        </div>

        {/* Content Body */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-slate-600 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" /> 1. Information We Collect
            </h2>
            <p>
              To connect food donors with community recipients efficiently, BiteShare collects minimal personal information necessary to facilitate real-time food claims:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Account Credentials:</strong> Email address, hashed password, and organization names for business donors.</li>
              <li><strong>Geospatial Data:</strong> Precise device GPS coordinates or user-selected location boundaries used strictly to calculate proximity distances to active food surplus bundles.</li>
              <li><strong>Usage Analytics:</strong> Logs related to surplus listings, claims created, and timestamped pickup windows.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" /> 2. How We Use Your Data
            </h2>
            <p>Your data is processed strictly for platform performance and community safety:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Filtering and displaying nearby food bundles on the interactive spatial feed.</li>
              <li>Sending automated claims confirmation notifications.</li>
              <li>Preventing automated bot abuse and double-claiming race conditions.</li>
              <li>Generating aggregate, non-personally identifiable Environmental, Social, and Governance (ESG) carbon offset reports.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" /> 3. Data Protection & Sharing
            </h2>
            <p>
              We do not sell, rent, or monetize personal user data to third-party advertisers. Location coordinates attached to food bundles are publicly visible on the surplus feed strictly while the bundle pickup window is active.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Your Rights & Account Deletion</h2>
            <p>
              You have the right to request access to your profile records or permanently delete your BiteShare account and listing history at any time by contacting our support team via our Contact & FAQs page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}