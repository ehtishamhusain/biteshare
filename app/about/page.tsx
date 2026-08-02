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
  Utensils,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

export default function AboutPage() {
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
      icon: Heart,
      title: 'Zero Hunger First',
      badge: 'Core Objective',
      description:
        'Food is a basic human right. Our primary mission is to ensure that fresh, wholesome meals reach every individual, family, and shelter in need.',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'hover:border-emerald-300',
    },
    {
      icon: Leaf,
      title: 'Zero Food Waste',
      badge: 'Planet & Economy',
      description:
        'We redirect commercial surplus food before closing time, preventing perfectly good food from rotting in landfills and cutting carbon emissions.',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'hover:border-amber-300',
    },
    {
      icon: ShieldCheck,
      title: 'Dignified Access',
      badge: 'Trust & Integrity',
      description:
        'Every surplus reservation uses a discrete 4-digit PIN receipt system, giving recipients a seamless, dignified handshake pickup experience.',
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50/80',
      borderColor: 'hover:border-teal-300',
    },
    {
      icon: TrendingUp,
      title: 'Local Business Partner',
      badge: 'Cost Recovery',
      description:
        'Partner bakeries and restaurants recover ingredient costs on unsold items while building massive goodwill as verified community champions.',
      color: 'from-emerald-600 to-emerald-800',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'hover:border-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* 🌟 Background Glowing Orbs */}
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
            <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> Our Main Objective: Zero Hunger
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-slate-900"
          >
            Our Mission:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
              No One Should Sleep Hungry.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-600 text-base sm:text-xl font-normal leading-relaxed max-w-3xl mx-auto"
          >
            BiteShare is a hyper-local movement powered by technology—connecting local bakeries, cafes, and restaurants with nearby neighbors to end local hunger and achieve zero food waste.
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
            {/* GOAL #1: ZERO HUNGER */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-xs hover:shadow-xl hover:border-emerald-400 transition-all duration-300 space-y-6 relative overflow-hidden group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-7 h-7 fill-emerald-600 text-emerald-600" />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Primary Mission
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Goal #1: Zero Hunger
                </h2>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Our uncompromising goal is to ensure <strong>no individual or child sleeps hungry</strong> in our city. By making surplus food instantly available for free or deeply discounted rates, fresh meals reach the plates of those who need them most.
              </p>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-extrabold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Immediate access to hot cooked meals & bakery goods</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Discrete & dignified pickup with 4-digit PIN</span>
                </div>
              </div>
            </motion.div>

            {/* GOAL #2: ZERO FOOD WASTE */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 space-y-6 relative overflow-hidden group"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200 group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                  Secondary Objective
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Goal #2: Zero Food Waste
                </h2>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Commercial food waste is a massive environmental tragedy. We provide restaurants and bakeries with a 30-second tool to publish unsold items before closing time—converting potential landfill waste into valuable community nourishment.
              </p>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-extrabold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Real-time WebSocket inventory synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Reduces carbon emissions & landfill methane gas</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 📊 RESEARCHED DATA: WHY BITESHARE MATTERS */}
        <section className="bg-white py-16 border-y border-slate-200/80 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black uppercase tracking-wider border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Research-Backed Reality
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Why BiteShare Matters
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Solving the tragic paradox where massive food waste exists alongside widespread hunger.
              </p>
            </div>

            {/* Researched Data Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              
              {/* Problem Block (Data & Hunger Statistics) */}
              <div className="bg-red-50/70 p-8 sm:p-10 rounded-3xl border border-red-200 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black uppercase tracking-wider">
                    The Challenge: Food Waste & Hunger
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    1/3rd of Food is Wasted While Millions Sleep Hungry
                  </h3>

                  <div className="space-y-3 text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                    <p>
                      According to the <strong>Food Safety and Standards Authority of India (FSSAI)</strong>, nearly <strong>1/3rd of all food produced in India</strong> gets spoiled or wasted before it is consumed. Furthermore, the <strong>UNEP Food Waste Index</strong> estimates that India generates <strong>78 million tonnes of food waste annually</strong>.
                    </p>
                    <p>
                      Globally, over <strong>1 billion meals are thrown away every single day</strong> while <strong>783 million people face chronic hunger</strong>. Every evening, local bakeries, restaurants, and caterers discard trays of fresh, safe meals simply because closing time arrives—while nearby families and night-shift workers struggle with food costs.
                    </p>
                  </div>
                </div>

                {/* Key Research Callouts */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-red-200/60">
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-red-100">
                    <span className="block text-2xl font-black text-red-600">33.3%</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Food Wasted in India (FSSAI)</span>
                  </div>
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-red-100">
                    <span className="block text-2xl font-black text-red-600">1 Billion+</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Meals Wasted Daily Globally (UNEP)</span>
                  </div>
                </div>
              </div>

              {/* Solution Block (BiteShare Technology) */}
              <div className="bg-emerald-50/70 p-8 sm:p-10 rounded-3xl border border-emerald-200 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                    The Innovation: BiteShare Solution
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    Instant Hyper-Local Redistribution Engine
                  </h3>

                  <div className="space-y-3 text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                    <p>
                      BiteShare bridges this gap by creating an instant, hyper-local software marketplace that connects food businesses directly with local citizens in real time:
                    </p>
                    
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>30-Second Store Listings:</strong> Restaurants publish unsold bakery boxes or dinner trays near closing time with a single tap.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span><strong>Live Map & Category Feeds:</strong> Neighbors discover nearby surplus meals on a map and reserve items at 50–80% OFF or FREE.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span><strong>4-Digit PIN Handshake:</strong> Recipients receive a private 4-digit PIN for a dignified, discrete store pickup experience.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Key Solution Impact Callouts */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-200/60">
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-100">
                    <span className="block text-2xl font-black text-emerald-700">100%</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Dignified Handshake Pickup</span>
                  </div>
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-100">
                    <span className="block text-2xl font-black text-emerald-700">Realtime</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">WebSocket Feed Sync</span>
                  </div>
                </div>
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
                    <img
                      src="/founder.jpeg"
                      alt="Ehtisham Husain"
                      className="w-full h-full object-cover rounded-[22px]"
                      onError={(e) => {
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
                    Founder
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
                    "No one in our community should ever have to go to bed hungry when our local stores have surplus fresh food. BiteShare was engineered to make sure food reaches human hands instead of trash bins."
                  </p>
                </div>

                <div className="space-y-3 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                  <p>
                    Ehtisham Husain, the founder of BiteShare, has a strong academic background in technology and a genuine passion for solving real-world problems. While continuing his studies, he has focused on building practical, scalable digital solutions that address meaningful human needs.
                  </p>
                  <p>
                    The idea for BiteShare came from a simple but powerful observation—every day, perfectly good food is thrown away while many people still go to bed hungry. That realization sparked the vision to bridge this gap by turning surplus food into support for those in need through a simple, community-driven platform.
                  </p>
                  <p>
                      At its heart, BiteShare is built on values of responsibility, dignity, and impact. It represents a future where no food is wasted, no person is hungry, and technology is used not just for innovation, but to create real, positive change in communities.
                  </p>
                </div>

                {/* Founder Tech Focus Pillars */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div className="text-sm sm:text-base font-black text-emerald-600">Zero Hunger</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Main Objective</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div className="text-sm sm:text-base font-black text-emerald-600">Zero Waste</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Environmental Goal</div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </section>

        {/* 👥 DUAL IMPACT: WHO BENEFITS? */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-slate-900 space-y-10 border border-slate-200/80 shadow-xs relative overflow-hidden">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase border border-emerald-200">
                Community Impact
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                A Win-Win Ecosystem
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium">
                Creating tangible economic and social value for businesses and community members alike.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              
              {/* For Recipients */}
              <div className="bg-emerald-50/60 p-6 sm:p-8 rounded-2xl border border-emerald-200/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
                    <Heart className="w-6 h-6 fill-emerald-600 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">For Neighbors & Shelters</h3>
                    <p className="text-xs text-emerald-700 font-bold">Food Access</p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Ensures zero neighbors in our community sleep hungry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Access high-quality restaurant meals at 50-80% OFF or FREE</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Dignified, seamless pickup with private 4-digit PIN receipt</span>
                  </li>
                </ul>
              </div>

              {/* For Donors */}
              <div className="bg-teal-50/60 p-6 sm:p-8 rounded-2xl border border-teal-200/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-100 text-teal-700 rounded-xl border border-teal-200">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">For Restaurants & Bakeries</h3>
                    <p className="text-xs text-teal-700 font-bold">Food Donors</p>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Zero waste at closing time—turn surplus into smiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Recover ingredient costs on unsold inventory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Earn certified sustainable community partner status</span>
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
                Help Us End Local Hunger and Food Waste
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                Whether you are a bakery owner with surplus bread, an NGO working to support those in need, or a neighbour looking for fresh, affordable meals—BiteShare is built for you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/feed"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-emerald-900 font-black text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4 text-emerald-700" />
                <span>Browse Live Food Feed</span>
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