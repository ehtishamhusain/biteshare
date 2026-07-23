'use client';

import Link from 'next/link';
import { Heart, Utensils, Users, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Our Mission
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Connecting Surplus Food with Community Need
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            BiteShare is a hyper-local redistribution platform bridging the gap between local food businesses and community members or shelters.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Reduce Food Waste</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Helping restaurants, bakeries, and markets rescue unsold edible food before it reaches municipal landfills.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Support Communities</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Ensuring neighborhood shelters and families get access to fresh, high-quality surplus meals at zero or low cost.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Real-Time Connectivity</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Powered by geolocation and instant WebSockets so food transfers happen in real time before pickup windows close.
            </p>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white text-center shadow-lg space-y-4">
          <h2 className="text-2xl font-bold">Ready to make an impact in your neighborhood?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href="/feed"
              className="px-6 py-3 bg-white text-emerald-800 font-bold text-sm rounded-xl hover:bg-slate-100 transition shadow-sm"
            >
              Explore Available Food
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-emerald-800 text-white font-bold text-sm rounded-xl hover:bg-emerald-900 transition border border-emerald-500/30"
            >
              Become a Partner Donor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}