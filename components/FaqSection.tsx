'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles, Store, Users, ShieldCheck } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

type FaqItem = {
  question: string;
  answer: string;
  category: 'ALL' | 'DONOR' | 'RECIPIENT';
};

const faqs: FaqItem[] = [
  {
    question: 'Is surplus food listed on BiteShare safe and fresh to eat?',
    answer:
      'Yes, absolutely. All food listed on BiteShare consists of fresh, unconsumed commercial surplus (such as same-day bakery items, fresh meals, or packaged goods nearing close-of-business) prepared under strict kitchen hygiene standards by verified local partner eateries.',
    category: 'ALL',
  },
  {
    question: 'How does counter pickup and 4-digit PIN verification work?',
    answer:
      'When a recipient reserves a meal on the feed, BiteShare instantly generates a unique 4-digit security PIN. The recipient simply visits the store counter before the closing window, provides the 4-digit PIN to the staff, and collects their meal smoothly and respectfully.',
    category: 'RECIPIENT',
  },
  {
    question: 'How do restaurants and bakeries receive their earnings?',
    answer:
      'For paid surplus listings, BiteShare automatically records 90% of the sale to the restaurant and 10% as a platform fee. Store owners can enter their UPI ID or Bank details in their "Earnings" page to receive direct weekly automated payouts.',
    category: 'DONOR',
  },
  {
    question: 'Who can claim food on BiteShare? Is it open to everyone?',
    answer:
      'BiteShare is open to all community members—including students, local workers, families, and neighborhood shelters! Rescuing surplus food helps eliminate local hunger while protecting the environment from landfill carbon emissions.',
    category: 'RECIPIENT',
  },
  {
    question: 'Why do some listings cost a small amount while others are 100% Free?',
    answer:
      'Food businesses have the option to list surplus food at deep discounts (allowing them to recover raw ingredient costs) or as 🎁 100% Free donations. BiteShare charges 0% platform commission on all 100% free charity donations.',
    category: 'ALL',
  },
  {
    question: 'How long does it take for a bakery or restaurant to publish a listing?',
    answer:
      'Publishing takes less than 30 seconds! Donors simply log into their dashboard, type the title, select the quantity and discounted price, and set a pickup closing time. The listing goes live on the neighborhood feed instantly in real time.',
    category: 'DONOR',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default
  const [filter, setFilter] = useState<'ALL' | 'DONOR' | 'RECIPIENT'>('ALL');

  const filteredFaqs = filter === 'ALL' ? faqs : faqs.filter((f) => f.category === 'ALL' || f.category === filter);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeInUp}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Got Questions? We Have Answers</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Everything you need to know about rescuing food, partner payouts, and our zero-waste mission.
          </p>

          {/* Filter Pills */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mt-2">
            <button
              onClick={() => {
                setFilter('ALL');
                setOpenIndex(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === 'ALL'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Questions
            </button>

            <button
              onClick={() => {
                setFilter('DONOR');
                setOpenIndex(0);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === 'DONOR'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>For Restaurants</span>
            </button>

            <button
              onClick={() => {
                setFilter('RECIPIENT');
                setOpenIndex(0);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === 'RECIPIENT'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>For Recipients</span>
            </button>
          </div>
        </motion.div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-50 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-6 flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-3">
                    <HelpCircle
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        isOpen ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    {faq.question}
                  </span>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'bg-emerald-100 text-emerald-700 rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-200/60 font-normal">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}