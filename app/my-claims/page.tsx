'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Utensils,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Building,
  Tag,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function MyClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch claims made by this recipient with bundle and donor details
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        bundle:food_bundles (
          id,
          title,
          description,
          quantity,
          price,
          address,
          pickup_window_end,
          donor:profiles (
            organization_name,
            full_name,
            phone
          )
        )
      `)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClaims(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Animated Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Reservations</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Claimed Food Bundles
          </h1>
          <p className="text-slate-600 text-sm">
            Show your 4-Digit Security PIN or QR Code at the store counter to collect your fresh surplus food.
          </p>
        </motion.div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-slate-500 text-sm">Loading your reservations...</p>
          </div>
        ) : claims.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto space-y-3"
          >
            <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No food claims found</h3>
            <p className="text-slate-500 text-sm">
              You haven't reserved any surplus food bundles yet. Visit the Explore Feed to find fresh food near you!
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {claims.map((claim) => {
              const bundle = claim.bundle;
              const donor = bundle?.donor;
              const storeName = donor?.organization_name || donor?.full_name || 'Partner Store';

              return (
                <motion.div
                  key={claim.id}
                  variants={fadeInUp}
                  whileHover={{ y: -3 }}
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-3 flex-grow">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          claim.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {claim.status === 'COMPLETED' ? 'Picked Up & Completed' : 'Pending Counter Pickup'}
                      </span>
                      <span className="font-black text-sm text-slate-900">
                        {bundle?.price === 0 || !bundle?.price ? '🎁 FREE' : `₹${bundle?.price}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <Building className="w-3.5 h-3.5" />
                      <span>{storeName}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">{bundle?.title}</h3>
                    <p className="text-slate-600 text-xs line-clamp-2">
                      {bundle?.description || 'Surplus food reserved for pickup.'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{bundle?.address || 'Address provided by donor'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          Closes:{' '}
                          {bundle?.pickup_window_end
                            ? new Date(bundle.pickup_window_end).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 🔑 Security Verification PIN Box */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center w-full md:w-auto min-w-[220px] space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Counter Pickup PIN</span>
                    </div>

                    <div className="text-3xl font-black font-mono tracking-widest text-emerald-700 bg-emerald-100/60 py-2.5 px-4 rounded-xl border border-emerald-200">
                      {claim.pickup_pin || '1234'}
                    </div>

                    <p className="text-[10px] text-slate-500 font-semibold">
                      Present this 4-digit code to store staff
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}