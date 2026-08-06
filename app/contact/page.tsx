'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Sparkles,
  Clock,
  MessageSquare,
  Building,
  Heart,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const inquiryCategories = [
  { id: 'GENERAL', label: 'General Inquiry', icon: MessageSquare },
  { id: 'DONOR', label: 'Restaurant / Business Partner', icon: Building },
  { id: 'SHELTER', label: 'NGO / Shelter Partner', icon: Heart },
  { id: 'SUPPORT', label: 'Report an Issue', icon: HelpCircle },
];

const faqs = [
  {
    q: 'How do restaurants list surplus food?',
    a: 'Registered store owners can publish a surplus batch in 30 seconds from their Donor Dashboard, specifying quantity, discounted or free price, and pickup cutoff time.',
  },
  {
    q: 'Are food claims free for shelters and community members?',
    a: 'Yes! Food donors can mark bundles as 100% FREE or offer them at 50–80% cost recovery discounts. Community members reserve them instantly.',
  },
  {
    q: 'How does pickup verification work?',
    a: 'When a food bundle is reserved, the recipient gets a private 4-digit PIN receipt. Showing this PIN at the store guarantees a fast, dignified pickup handshake.',
  },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    const fullPayload = {
      name: name.trim(),
      email: email.trim(),
      category,
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('contact_messages').insert([fullPayload]);

    if (error) {
      setStatusMsg({
        text: 'Failed to send message: ' + error.message,
        type: 'error',
      });
    } else {
      setStatusMsg({
        text: '🎉 Thank you for reaching out! Our team has received your message and will respond shortly.',
        type: 'success',
      });
      setName('');
      setEmail('');
      setMessage('');
      setCategory('GENERAL');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* 🌟 Background Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* 🚀 HERO HEADER */}
        <motion.div
          className="text-center space-y-4 max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>We'd Love to Hear From You</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Get in Touch with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              BiteShare
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-medium"
          >
            Have questions, feedback, or want to partner with us as a restaurant, bakery, or NGO shelter? Send us a message and our team will get back to you promptly.
          </motion.p>
        </motion.div>

        {/* 📬 MAIN CONTENT GRID */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
        >
          {/* LEFT SIDE: Contact Information & Commitment Cards */}
          <motion.div variants={fadeInUp} className="lg:col-span-5 space-y-6">
            
            {/* Quick Details Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">
                Direct Channels
              </h3>

              <div className="space-y-5">
                {/* Email Channel */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Email Support
                    </h4>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      support@biteshare.in
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      For general queries & partnerships
                    </p>
                  </div>
                </div>

                {/* Location Channel */}
                <div className="flex items-start gap-4 border-t border-slate-100 pt-5">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Headquarters
                    </h4>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      Bareilly, Uttar Pradesh, India
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Hyper-local operations center
                    </p>
                  </div>
                </div>

                {/*
                {/* Hours Channel */}
                {/*
                <div className="flex items-start gap-4 border-t border-slate-100 pt-5">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Operational Hours
                    </h4>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      Mon – Sun: 8:00 AM – 10:00 PM IST
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Live store monitoring during closing windows
                    </p>
                  </div>
                </div>
                */}
              </div>
            </div>

            {/* Commitment Badge Box */}
            {/*
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 sm:p-8 rounded-3xl text-white space-y-3 shadow-md relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" /> Fast Response
              </div>
              <h4 className="text-lg font-black leading-snug">
                Guaranteed Support in Under 24 Hours
              </h4>
              <p className="text-emerald-100 text-xs leading-relaxed font-medium">
                Whether you are a bakery trying to post surplus meals or a local shelter needing assistance, our local logistics team monitors incoming queries every day.
              </p>
            </div>
            */}
          </motion.div>

          {/* RIGHT SIDE: Interactive Message Form */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6"
          >
            <div>
              <h3 className="text-xl font-black text-slate-900">Send Us a Message</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Fill out the form below and we will route your query to the right department.
              </p>
            </div>

            {/* Status Feedback Notification */}
            {statusMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl text-xs font-extrabold border flex items-center gap-2.5 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Category Pills Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Select Topic
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inquiryCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2 text-left ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Faizan"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. your@example.com"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Message Textarea */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you or collaborate with your business?"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm font-medium text-slate-800 bg-slate-50/50"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-8 rounded-2xl transition shadow-md inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>

        {/* ❓ QUICK FAQ SECTION */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase border border-emerald-200">
              Frequently Asked Questions
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Quick Answers
            </h3>
            <p className="text-slate-500 text-xs font-medium">
              Common inquiries from partner stores and community members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-black text-slate-900 flex items-start gap-2">
                  <span className="text-emerald-600 font-extrabold">Q:</span> {faq.q}
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              <span>Browse Active Surplus Food Listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}