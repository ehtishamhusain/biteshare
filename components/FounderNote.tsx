'use client';

import { motion, Variants } from 'framer-motion';
import { Quote, Heart, Sparkles, Utensils, CheckCircle2 } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function FounderNote() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Soft Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeInUp}
          className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm relative overflow-hidden space-y-8"
        >
          {/* Decorative Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>A Note From The Founder</span>
            </div>

            <Quote className="w-10 h-10 text-emerald-200/80 hidden sm:block" />
          </div>

          {/* Deep Quotation Banner */}
          <blockquote className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight italic border-l-4 border-emerald-600 pl-4 sm:pl-6 py-1">
            “Food is not just sustenance—it is a basic human need that should never be wasted. Yet every day, nourishing meals are wasted while people go to bed hungry. This is not merely inefficiency, it is a moral responsibility we can no longer ignore.”
          </blockquote>

          {/* Personal Message Body */}
          <div className="space-y-4 text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
            <p>
              <strong>Dear Visitor,</strong>
            </p>

            <p>
              Walking past local bakeries and eateries late at night, I used to notice two contrasting realities happening just a few hundred meters apart. On one side, trays of perfectly fresh, delicious surplus food were being prepared for trash bins. On the other side, hardworking individuals and families were struggling to secure a evening meal.
            </p>

            <p>
              It hit me deeply: <strong className="text-slate-900">hunger in our neighborhoods isn't a food shortage problem—it’s a connection problem.</strong>
            </p>

            <p>
              That realization became the spark for <strong>BiteShare</strong>. I engineered this platform with a single mission: to build a seamless real-time bridge so that no wholesome surplus meal is ever wasted when it could bring warmth, nutrition, and dignity to someone nearby.
            </p>

            <p>
              Whether you are a local business owner clearing stock responsibly, a community member grabbing a discounted bite, or someone picking up food for a local shelter—<strong className="text-emerald-700">you are the heart of this movement.</strong>
            </p>
          </div>

          {/* Founder Signature Footer Card */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Founder Avatar Circle */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20">
                <Utensils className="w-6 h-6" />
              </div>

              <div>
                <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span>Ehtisham Husain: Founder of BiteShare</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Building tech for Zero Hunger & Zero Waste
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 self-start sm:self-auto">
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Made for local communities</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}