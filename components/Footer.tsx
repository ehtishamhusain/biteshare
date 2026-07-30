'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  Utensils,
  Heart,
  Sparkles,
  ArrowUp,
  ArrowUpRight,
  Mail,
  MapPin,
  Shield,
  FileText,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// 🌟 Custom Inline SVG Social Icons (Fixes missing brand exports in lucide-react)
const SocialIcons = {
  Twitter: (props: any) => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Linkedin: (props: any) => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  ),
  Github: (props: any) => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" {...props}>
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
    </svg>
  ),
  Instagram: (props: any) => (
    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
};

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-slate-900 text-slate-300 overflow-hidden border-t border-slate-800 pt-16 pb-12">
      {/* 🌟 Background Ambient Light Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
        >
          {/* 🟢 Column 1: Brand Info & Tagline (5 Cols) */}
          <motion.div variants={fadeInUp} className="md:col-span-5 space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-black text-2xl text-white group"
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-600/30"
              >
                <Utensils className="w-6 h-6" />
              </motion.div>
              <span>
                Bite<span className="text-emerald-500">Share</span>
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Connecting local bakeries, restaurants, and grocery stores with community members and neighborhood shelters in real time to end food waste and move closer to zero hunger.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3.5 py-2 rounded-xl w-fit">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Zero Food Waste • Zero Hunger • Hyper-Local Direct Impact</span>
            </div>

            {/* Social Icons with Inline SVGs */}
            <div className="pt-2 flex items-center gap-3">
              {[
                { icon: SocialIcons.Twitter, href: 'https://twitter.com', label: 'Twitter / X' },
                { icon: SocialIcons.Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                { icon: SocialIcons.Github, href: 'https://github.com', label: 'GitHub' },
                { icon: SocialIcons.Instagram, href: 'https://instagram.com', label: 'Instagram' },
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-emerald-600 text-slate-400 hover:text-white border border-slate-700/60 transition-colors flex items-center justify-center shadow-sm"
                  >
                    <Icon />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* 🔵 Column 2: Quick Links (3 Cols) */}
          <motion.div variants={fadeInUp} className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              {[
                { label: 'Home', href: '/' },
                { label: 'Explore Feed', href: '/feed' },
                { label: 'Explore Restaurants', href: '/restaurants' },
                { label: 'Reviews', href: '/reviews' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    <motion.span whileHover={{ x: 4 }} className="inline-block">
                      {link.label}
                    </motion.span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-emerald-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ⚖️ Column 3: Platform Trust & Legal (4 Cols) */}
          <motion.div variants={fadeInUp} className="md:col-span-4 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Trust & Transparency
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link
                  href="/privacy"
                  className="group flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <motion.span whileHover={{ x: 4 }} className="inline-block">
                    Privacy Policy
                  </motion.span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="group flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <motion.span whileHover={{ x: 4 }} className="inline-block">
                    Terms of Service
                  </motion.span>
                </Link>
              </li>
            </ul>

            {/* Quick Contact Micro Box */}
            <div className="pt-2">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bareilly, Uttar Pradesh, India</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>support@biteshare.app</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 📑 Bottom Bar: Copyright & Back To Top */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <span>© 2026 BiteShare. Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>for communities</span>
          </div>

          {/* Smooth Back-to-Top Button */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all font-semibold shadow-sm"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
}