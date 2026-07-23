'use client';

import Link from 'next/link';
import NewsletterSection from '@/components/NewsletterSection';
import {
  Utensils,
  Heart,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  Award,
  Users,
  Leaf,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hyper-Local Zero Food Waste</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Turn Surplus Food into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Community Support
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Connecting local bakeries, restaurants, and grocery stores with neighborhood shelters and community members in real-time.
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/feed"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 group"
              >
                <span>Claim Local Food</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-sm transition flex items-center justify-center"
              >
                Become a Food Donor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics Bar */}
      <section className="bg-white border-y border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">12,500+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Meals Rescued
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">85+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Local Partners
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">15.2 Tons</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                CO₂ Offset
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">100%</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Verified Quality
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Why Businesses & Neighbors Love BiteShare
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Our platform bridges the gap between surplus inventory and local community demand seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Hyper-Local Map Discovery</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Discover active food bundles pinned in real time right in your immediate neighborhood.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">QR & PIN Code Verification</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Secure two-way pickup verification ensures seamless, error-free store handshakes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-6">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">ESG & Carbon Impact Reports</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Businesses track their real-time environmental contribution and food waste reduction stats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Standalone Homepage Newsletter Banner */}
      <NewsletterSection />
    </div>
  );
}