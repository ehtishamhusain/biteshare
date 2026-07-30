'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import {
  Heart,
  Target,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Users,
  Store,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  Award,
  MapPin,
  Code2,
  Quote,
} from 'lucide-react';

export default function AboutPage() {
  // Explicitly typed Animation Variants to eliminate TypeScript red underlines
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const pillars = [
    {
      icon: Users,
      title: 'Community First',
      badge: 'Social Equity',
      description:
        'We believe fresh, wholesome food is a basic human right. We bridge the gap between commercial food surplus and local neighbors or shelters in real time.',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'hover:border-emerald-300',
    },
    {
      icon: ShieldCheck,
      title: 'Verifiable Integrity',
      badge: 'Trust & Quality',
      description:
        'Every surplus claim uses two-way 4-digit PIN verification to ensure legitimate handshakes, preventing fraud while maintaining food freshness standards.',
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50/80',
      borderColor: 'hover:border-teal-300',
    },
    {
      icon: Leaf,
      title: 'Planet Stewardship',
      badge: 'Carbon Reduction',
      description:
        'Food waste accounts for ~10% of global greenhouse gases. Rescuing surplus meals directly reduces methane emissions and saves water & farmland energy.',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'hover:border-amber-300',
    },
    {
      icon: TrendingUp,
      title: 'Fair Business Economy',
      badge: 'Cost Recovery',
      description:
        'Local bakeries and restaurants recover ingredient costs on unsold batches while building strong goodwill as certified sustainable community partners.',
      color: 'from-emerald-600 to-emerald-800',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'hover:border-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* 🌟 Background Glowing Orbs matching Home Page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-20 py-12 lg:py-20">
        
        {/* 🚀 HERO BANNER */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest border border-emerald-200/80 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Our Purpose & Movement
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-slate-900"
          >
            Rescuing Surplus Food,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
              Nourishing Communities
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 text-base sm:text-xl font-normal leading-relaxed max-w-3xl mx-auto"
          >
            BiteShare is a hyper-local technology platform connecting restaurants, bakeries, and grocery stores with local neighbors and neighborhood shelters to ensure zero perfectly good food goes to waste.
          </motion.p>
        </section>

        {/* 🎯 MISSION & VISION DUAL CARDS */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* OUR MISSION CARD */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 space-y-6 relative overflow-hidden group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Our Mission
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Zero Food Waste at the Local Level
                </h2>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                To eliminate daily commercial food waste by providing businesses with an instant, effortless tool to redistribute surplus meals and baked goods at deep discounts or 100% free shelter donations before closing time.
              </p>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-extrabold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Real-time WebSocket inventory sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Pre-filled profile address & GPS geocoding</span>
                </div>
              </div>
            </motion.div>

            {/* OUR VISION CARD */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 space-y-6 relative overflow-hidden group"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                  Our Vision
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  A Sustainable Food Ecosystem for Every City
                </h2>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                We envision a future where every neighborhood operates a circular food economy—where surplus food is celebrated as a resource, food insecurity is reduced, and local food businesses thrive sustainably.
              </p>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-extrabold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Scalable across 100+ cities worldwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Empowering local shelters & non-profits</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ⚖️ THE PROBLEM VS BITESHARE SOLUTION */}
        <section className="bg-white py-16 border-y border-slate-200/80 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Why BiteShare Matters
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Understanding the real-world challenge we face every single evening.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Problem Block */}
              <div className="bg-red-50/70 p-8 rounded-3xl border border-red-200 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black uppercase">
                  The Problem
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  1/3rd of All Food Produced is Wasted
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Every night, local bakeries, restaurants, and buffets discard unsold fresh food simply because they lack an instant local audience to buy it before closing time. Meanwhile, millions of nearby families and shelters face rising food costs.
                </p>
              </div>

              {/* Solution Block */}
              <div className="bg-emerald-50/70 p-8 rounded-3xl border border-emerald-200 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                  The BiteShare Solution
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Instant Hyper-Local Food Redirection
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  BiteShare gives store owners a 30-second listing portal to publish surplus food trays or bakery boxes. Local buyers discover them on a live map feed, reserve with 1 click, and pick them up using a secure 4-digit verification PIN.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 🌟 4 CORE VALUES / PILLARS */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
              <Award className="w-3.5 h-3.5 text-emerald-600" /> Guided by Principles
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Core Value Pillars
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              The fundamental beliefs driving every feature we design.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {pillars.map((p, idx) => {
              const IconComp = p.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -6 }}
                  className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-lg ${p.borderColor} transition-all duration-300 flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center shadow-md`}>
                      <IconComp className="w-6 h-6" />
                    </div>

                    <div>
                      <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${p.bgColor} text-slate-800 mb-1 border border-slate-100`}>
                        {p.badge}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        {p.title}
                      </h3>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed font-medium">
                      {p.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* 👤 MEET THE FOUNDER SECTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
              <Code2 className="w-3.5 h-3.5 text-emerald-600" /> Leadership & Vision
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Meet the Founder
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              The mind and passion behind BiteShare’s hyper-local food rescue engine.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs hover:shadow-md transition relative overflow-hidden group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Founder Photo & Badge */}
              <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-1 shadow-xl overflow-hidden">
                    {/* 📸 YOUR IMAGE LOADS FROM public/founder.jpg */}
                    <img
                      src="/founder.jpeg"
                      alt="Ehtisham Husain"
                      className="w-full h-full object-cover rounded-[22px]"
                      onError={(e) => {
                        // Fallback to initials if founder.jpg is not found in public/
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-white font-black text-4xl sm:text-5xl tracking-wider">
                      EH
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-emerald-500 text-slate-950 rounded-xl shadow-md font-black text-xs flex items-center gap-1.5 border border-emerald-400">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> Founder
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">Ehtisham Husain</h3>
                  <p className="text-xs font-extrabold text-emerald-600 mt-0.5 uppercase tracking-wider">
                    Founder & Full-Stack Architect
                  </p>
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 mt-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Bareilly, Uttar Pradesh, India
                  </div>
                </div>
              </div>

              {/* Founder Narrative & Philosophy */}
              <div className="lg:col-span-8 space-y-6">
                <div className="relative pl-6 border-l-4 border-emerald-500 space-y-2">
                  <Quote className="w-8 h-8 text-emerald-500/20 absolute -top-3 -left-3" />
                  <p className="text-slate-800 text-sm sm:text-base font-semibold leading-relaxed italic">
                    "Technology is at its absolute best when it solves quiet, everyday human struggles. BiteShare wasn't built to be just another app; it was engineered to convert daily commercial food surplus into genuine community hope."
                  </p>
                </div>

                <div className="space-y-3 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                  <p>
                    Driven by a passion for building high-impact tech products that address real-world community challenges, Ehtisham designed BiteShare to bridge the gap between food waste in local businesses and hunger in local neighborhoods.
                  </p>
                  <p>
                    Combining full-stack web engineering with hyper-local geospatial logistics, Ehtisham architected BiteShare with real-time WebSocket synchronization, anti-fraud 4-digit verification handshakes, and automated carbon offset telemetry.
                  </p>
                </div>

                {/* Founder Tech Focus Pillars */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div className="text-sm sm:text-base font-black text-emerald-600">Full-Stack</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Next.js & Supabase</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div className="text-sm sm:text-base font-black text-emerald-600">Geospatial</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">PostGIS Logistics</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center col-span-2 sm:col-span-1">
                    <div className="text-sm sm:text-base font-black text-emerald-600">Impact Driven</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Zero Food Waste</div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </section>

        {/* 👥 DUAL IMPACT: WHO BENEFITS? (LIGHT THEME CONTAINER) */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-slate-900 space-y-10 border border-slate-200/80 shadow-xs relative overflow-hidden">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase border border-emerald-200">
                Win-Win Ecosystem
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                A Platform Built for Everyone
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Creating tangible economic and social value for businesses and community members alike.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              
              {/* For Donors */}
              <div className="bg-emerald-50/60 p-6 sm:p-8 rounded-2xl border border-emerald-200/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">For Restaurants & Bakeries</h3>
                    <p className="text-xs text-emerald-700 font-bold">Food Donors</p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Recover 30-50% of ingredient costs on unsold inventory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Attract new local foot traffic & loyal store customers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Achieve verified CSR ESG sustainability ratings</span>
                  </li>
                </ul>
              </div>

              {/* For Recipients */}
              <div className="bg-teal-50/60 p-6 sm:p-8 rounded-2xl border border-teal-200/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-100 text-teal-700 rounded-xl border border-teal-200">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">For Neighbors & Shelters</h3>
                    <p className="text-xs text-teal-700 font-bold">Recipients</p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Access high-quality restaurant meals at 50-80% OFF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>100% free food donations dedicated to local shelters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Dignified, seamless pickup with 4-digit PIN receipt</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </section>

        {/* 📢 CALL TO ACTION BANNER */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white space-y-6 shadow-xl relative overflow-hidden">
            
            <div className="space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Join the Zero Food Waste Movement
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                Whether you are a bakery owner with surplus bread or a neighbor looking for delicious, affordable meals—BiteShare is built for you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/feed"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-emerald-900 font-black text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Browse Live Food Feed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800/60 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-2xl border border-emerald-400/40 transition flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4 text-emerald-300" />
                <span>Register as Food Donor</span>
              </Link>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}