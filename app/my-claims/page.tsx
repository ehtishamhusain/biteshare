'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Utensils,
} from 'lucide-react';

export default function MyClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchMyClaims = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push('/login');
      return;
    }

    // 1. Primary joined query: claims -> food_bundles -> donor profile
    let { data, error } = await supabase
      .from('claims')
      .select('*, bundle:food_bundles(*, donor:profiles(organization_name, full_name, street_address, city, phone))')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });

    // 2. Standalone Fallback engine if joined query returns empty or fails
    if (error || !data || data.length === 0) {
      const fallbackClaimsRes = await supabase
        .from('claims')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (!fallbackClaimsRes.error && fallbackClaimsRes.data && fallbackClaimsRes.data.length > 0) {
        const rawClaims = fallbackClaimsRes.data;

        // Fetch associated bundles manually
        const bundleIds = rawClaims.map((c) => c.bundle_id).filter(Boolean);
        if (bundleIds.length > 0) {
          const { data: bundlesData } = await supabase
            .from('food_bundles')
            .select('*')
            .in('id', bundleIds);

          const bundleMap = new Map();
          (bundlesData || []).forEach((b) => bundleMap.set(b.id, b));

          // Fetch donor profiles manually
          const donorIds = (bundlesData || []).map((b) => b.donor_id).filter(Boolean);
          const donorMap = new Map();
          if (donorIds.length > 0) {
            const { data: donorsData } = await supabase
              .from('profiles')
              .select('id, organization_name, full_name, street_address, city, phone')
              .in('id', donorIds);
            (donorsData || []).forEach((d) => donorMap.set(d.id, d));
          }

          // Combine data manually
          data = rawClaims.map((claim) => {
            const b = bundleMap.get(claim.bundle_id) || {};
            const d = donorMap.get(b.donor_id) || {};
            return {
              ...claim,
              bundle: {
                ...b,
                donor: d,
              },
            };
          });
        } else {
          data = rawClaims;
        }
      }
    }

    setClaims(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMyClaims();

    // Real-time subscription to claims table
    const channel = supabase
      .channel('realtime_my_claims_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => fetchMyClaims())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="space-y-1">
            <Link
              href="/feed"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Feed
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-7 h-7 text-emerald-600" /> My Active Reservations
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Track your food claims, pickup locations, and counter verification details.
            </p>
          </div>

          <button
            onClick={fetchMyClaims}
            className="self-start sm:self-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            Refresh Reservations
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl font-semibold text-xs sm:text-sm border flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 animate-pulse">
                <div className="h-6 bg-slate-100 rounded-xl w-3/4" />
                <div className="h-4 bg-slate-100 rounded-xl w-1/2" />
                <div className="h-16 bg-slate-100 rounded-2xl w-full" />
                <div className="h-10 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No active claims found</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              You haven't reserved any surplus food items yet. Visit the Explore Feed to reserve fresh meals!
            </p>
            <Link
              href="/feed"
              className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-md"
            >
              Browse Food Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claims.map((claim) => {
              const bundle = claim.bundle || {};
              const donor = bundle.donor || {};
              const donorName = donor.organization_name || donor.full_name || 'Partner Store';
              const pickupAddress = bundle.address || donor.street_address || 'Store Location';
              const totalPrice = claim.total_price ?? 0;
              const isFree = totalPrice === 0;

              return (
                <div
                  key={claim.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Status & Price Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider rounded-full border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {claim.status || 'CONFIRMED'}
                      </span>

                      <span className="text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
                        {isFree ? '🎁 FREE' : `₹${totalPrice}`}
                      </span>
                    </div>

                    {/* Bundle Title & Business Name */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-900 line-clamp-1">
                        {bundle.title || 'Reserved Surplus Bundle'}
                      </h3>
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{donorName}</span>
                      </div>
                    </div>

                    {/* Pickup Verification PIN (if available) */}
                    {claim.pickup_pin && (
                      <div className="bg-emerald-50/80 border-2 border-dashed border-emerald-300 rounded-2xl p-3.5 text-center space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                          Pickup Verification PIN
                        </span>
                        <div className="text-2xl font-black text-emerald-900 tracking-widest">
                          {claim.pickup_pin}
                        </div>
                      </div>
                    )}

                    {/* Claim Details */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                      <div className="flex items-center justify-between">
                        <span>Quantity Reserved:</span>
                        <span className="font-black text-slate-800">
                          {claim.claimed_quantity || 1} item(s)
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{pickupAddress}</span>
                      </div>

                      {bundle.pickup_window_end && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            Collect before:{' '}
                            <strong>
                              {new Date(bundle.pickup_window_end).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </strong>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Claimed on:{' '}
                          {new Date(claim.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Card Action */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold">
                      Order ID: #{claim.id.slice(0, 8)}
                    </span>

                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Ready for Pickup
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}