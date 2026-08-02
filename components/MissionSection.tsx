'use client';

import { motion, Variants } from 'framer-motion';
import {
  Heart,
  Utensils,
  Leaf,
  IndianRupee,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function MissionSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 overflow-hidden">
      {/* 🌟 Ambient Light Glow Background Effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-4 max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Driven By Purpose</span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900"
          >
            Our Mission: Turn Surplus Food Into <span className="text-emerald-600">Zero Hunger</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-slate-600 text-sm sm:text-base leading-relaxed"
          >
            BiteShare bridges the gap between commercial surplus food and local communities. We transform potential food waste into immediate nutrition, environmental recovery, and social dignity.
          </motion.p>
        </motion.div>

        {/* 🌟 BENTO-GRID MISSION LAYOUT */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
        >
          {/* ======================================================== */}
          {/* 🔴 HERO COLUMN (7 Cols): CORE MISSION - REDUCE HUNGER    */}
          {/* ======================================================== */}
          <motion.div
            variants={fadeInUp}
            className="md:col-span-7 bg-white border border-emerald-200/80 rounded-3xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group"
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-100/50 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <Heart className="w-7 h-7 fill-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full">
                  Primary Objective
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  1. Eliminate Local Hunger & Malnutrition
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Food is a basic human right, not a privilege. Our platform ensures that perfectly wholesome, fresh surplus meals from local bakeries and restaurants reach citizens, families, and neighborhood shelters before going to waste.
                </p>
              </div>

              {/* 📊 Crisis Stats Box */}
              <div className="p-5 rounded-2xl bg-slate-100/80 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>The Ground Reality We Are Fighting</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xl font-black text-amber-600">735 Million+</div>
                    <div className="text-slate-600 font-medium">
                      People chronically hungry globally <span className="text-[10px] text-slate-400">(UN FAO Data)</span>
                    </div>
                  </div>

                  <div className="space-y-1 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xl font-black text-emerald-600">190 Million+</div>
                    <div className="text-slate-600 font-medium">
                      Undernourished individuals in India despite massive food production
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Direct Neighborhood Distribution</span>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* 🟢 COLUMN 2 (5 Cols): PILLAR 2 - ZERO FOOD WASTAGE       */}
          {/* ======================================================== */}
          <motion.div
            variants={fadeInUp}
            className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <Utensils className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-slate-900">
                2. Zero Commercial Food Wastage
              </h3>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                In India alone, an estimated <strong className="text-slate-800">68 million tonnes of food</strong> is wasted every year in urban areas. BiteShare turns commercial surplus into live real-time listings, giving eateries a seamless way to clear stock responsibly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Diverts edible surplus away from dumpsters into kitchens.</span>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* 🔵 ROW 2 - PILLAR 3: AFFORDABLE & FREE MEALS (4 Cols)     */}
          {/* ======================================================== */}
          <motion.div
            variants={fadeInUp}
            className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <IndianRupee className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              3. Deep Discounts & 100% Free Items
            </h3>

            <p className="text-slate-600 text-xs leading-relaxed">
              Donors can list meals at deep bulk discounts or 🎁 100% Free. Community members access quality bakery goods, meals, and produce at prices everyone can afford.
            </p>
          </motion.div>

          {/* ======================================================== */}
          {/* 🟢 ROW 2 - PILLAR 4: CO2 & CLIMATE REDUCTION (4 Cols)    */}
          {/* ======================================================== */}
          <motion.div
            variants={fadeInUp}
            className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Leaf className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              4. Reduce CO₂ & Methane Emissions
            </h3>

            <p className="text-slate-600 text-xs leading-relaxed">
              Rotting food in landfills accounts for <strong className="text-slate-800">8–10% of global greenhouse emissions</strong>. Rescuing food directly combats climate change and lowers carbon footprint.
            </p>
          </motion.div>

          {/* ======================================================== */}
          {/* 🟣 ROW 2 - PILLAR 5: HYPER-LOCAL DIGNITY (4 Cols)        */}
          {/* ======================================================== */}
          <motion.div
            variants={fadeInUp}
            className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              5. Dignified Counter Verification
            </h3>

            <p className="text-slate-600 text-xs leading-relaxed">
              Our 4-digit PIN verification ensures order accuracy, security, and respectful counter pickup without awkwardness or bureaucracy for recipients.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}