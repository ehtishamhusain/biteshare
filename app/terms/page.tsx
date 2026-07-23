import Navbar from '@/components/Navbar';
import { FileCheck, ShieldAlert, HeartHandshake, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Scale className="w-3.5 h-3.5 text-green-600" />
            <span>Community Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Terms of Service</h1>
          <p className="text-sm text-slate-500 mt-2">Last Updated: July 2026</p>
        </div>

        {/* Content Body */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-slate-600 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-600" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing or registering an account on BiteShare, you agree to comply with these Terms of Service. BiteShare operates as a peer-to-community food rescue network connecting food donors with recipients.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-green-600" /> 2. Food Safety & Good Samaritan Protection
            </h2>
            <p>
              Food donors agree to list food items fit for human consumption in accordance with local health standards and safety regulations. Food bundles must be stored at proper temperatures until pickup.
            </p>
            <p>
              Under applicable Good Samaritan Food Donation legislation, food donors listing wholesome surplus food in good faith are protected from civil liability related to donated items.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-green-600" /> 3. Recipient Code of Conduct
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Pickup Timeliness:</strong> Recipients must collect claimed food bundles within the posted donor pickup window.</li>
              <li><strong>Fair Usage:</strong> Repeatedly claiming food bundles without arriving for pickup ("no-shows") may result in temporary account suspension.</li>
              <li><strong>No Reselling:</strong> Food items claimed through BiteShare are provided free of charge and may not be resold for monetary profit.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Account Termination</h2>
            <p>
              BiteShare reserves the right to suspend or terminate accounts that violate platform safety standards, submit fraudulent listings, or engage in disruptive behavior.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}