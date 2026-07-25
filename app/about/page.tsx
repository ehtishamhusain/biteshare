'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  Heart,
  Utensils,
  Users,
  Sparkles,
  ArrowRight,
  Mail,
  Code2,
  Award,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
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
    transition: { staggerChildren: 0.15 },
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header Hero */}
        <motion.div
          className="text-center space-y-4"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Our Mission & Vision</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900"
          >
            Rescuing Food, Nourishing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Communities
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
          >
            BiteShare is a hyper-local redistribution platform bridging the gap
            between local food businesses with surplus inventory and community
            members or shelters in real time.
          </motion.p>
        </motion.div>

        {/* 3 Core Value Pillars */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -6 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition text-center space-y-4"
          >
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <Utensils className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Zero Food Waste
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Helping restaurants, bakeries, and grocery stores rescue unsold
              edible food before it reaches municipal landfills.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -6 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition text-center space-y-4"
          >
            <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Community Support
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Ensuring neighborhood shelters and families get access to fresh,
              high-quality surplus meals at zero or deeply discounted cost.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -6 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition text-center space-y-4"
          >
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Real-Time Connectivity
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Powered by geospatial distance queries and WebSockets so transfers
              happen in minutes before store pickup windows close.
            </p>
          </motion.div>
        </motion.div>

        {/* 👨‍💻 MEET THE FOUNDER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Founder Photo & Title */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-xl border-4 border-emerald-500/20 mb-4">
                <img
                  src="/founder.jpeg"
                  alt="Ehtisham Husain"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Ehtisham Husain
              </h3>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mt-1">
                Founder & Lead Architect
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-4">
                <a
                  href="https://github.com/ehtishamhusain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-700 rounded-xl transition"
                  title="GitHub Profile"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.300-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.300-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="mailto:support@biteshare.app"
                  className="p-2.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-700 rounded-xl transition"
                  title="Email Me"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Founder Short Introduction & Vision */}
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Architected with Purpose</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                "Tech should solve real problems in our immediate surroundings."
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed">
                Ehtisham is a dedicated full-stack software engineer driven by a passion
                for building technology that creates measurable social impact.
                Specializing in Next.js, Supabase, and real-time WebSockets, he designed and
                architected BiteShare to eliminate urban food waste and empower local food donors and community shelters.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Full-Stack Next.js 14 & Supabase Architecture</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Real-Time WebSockets & Geolocation Integration</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl space-y-6"
        >
          <h2 className="text-2xl sm:text-3xl font-black">
            Ready to make an impact in your neighborhood?
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto">
            Join hundreds of local donors and community members reducing food
            waste today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href="/feed"
              className="px-8 py-3.5 bg-white text-emerald-800 font-extrabold text-sm rounded-xl hover:bg-slate-100 transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Explore Available Food</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm rounded-xl transition border border-emerald-500/30 flex items-center justify-center"
            >
              Become a Partner Donor
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}