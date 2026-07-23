'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { QRCodeSVG } from 'qrcode.react';
import { 
  PackageCheck, 
  MapPin, 
  Clock, 
  Tag, 
  Gift, 
  CheckCircle2, 
  ShoppingBag,
  AlertCircle,
  QrCode,
  KeyRound
} from 'lucide-react';

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      // 1. Fetch claims for logged-in recipient
      const { data: claimsData, error: claimsError } = await supabase
        .from('claims')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (claimsError) {
        setErrorMessage(claimsError.message);
        setLoading(false);
        return;
      }

      if (!claimsData || claimsData.length === 0) {
        setClaims([]);
        setLoading(false);
        return;
      }

      // 2. Fetch corresponding bundle details
      const bundleIds = claimsData.map((c) => c.bundle_id).filter(Boolean);

      const { data: bundlesData } = await supabase
        .from('food_bundles')
        .select('*')
        .in('id', bundleIds);

      // 3. Map bundle data onto claims array
      const bundlesMap = new Map((bundlesData || []).map((b) => [b.id, b]));
      const formattedClaims = claimsData.map((claim) => ({
        ...claim,
        food_bundles: bundlesMap.get(claim.bundle_id) || null,
      }));

      setClaims(formattedClaims);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load claims.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-7 h-7 text-green-600" /> My Food Reservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Show your QR Code or 4-Digit Pickup PIN to the donor staff upon arrival.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            Loading your food reservations...
          </div>
        ) : claims.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">You haven't claimed any food bundles yet.</p>
            <a 
              href="/feed" 
              className="inline-block bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-green-700 transition mt-2"
            >
              Browse Surplus Feed
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => {
              const bundle = claim.food_bundles;
              if (!bundle) return null;

              const isCompleted = claim.status === 'COMPLETED' || bundle.status === 'COMPLETED';
              const formattedPrice = bundle.price === 0 || !bundle.price 
                ? '🎁 FREE' 
                : `₹${Number(bundle.price).toFixed(0)}`;

              return (
                <div 
                  key={claim.id} 
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5"
                >
                  <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{bundle.title}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${
                        isCompleted ? 'bg-slate-100 text-slate-700' : 'bg-green-50 text-green-700'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> 
                        {isCompleted ? 'Pickup Completed' : 'Reserved & Ready for Pickup'}
                      </span>
                    </div>

                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 ${
                      bundle.price === 0 || !bundle.price
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {bundle.price === 0 || !bundle.price ? <Gift className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5" />}
                      {formattedPrice}
                    </span>
                  </div>

                  {/* QR Verification Handshake Box */}
                  {!isCompleted && (
                    <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
                      <div className="space-y-2 text-center sm:text-left">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-950/80 px-3 py-1 rounded-full border border-green-800">
                          <QrCode className="w-3.5 h-3.5" /> Store Pickup Pass
                        </div>
                        <p className="text-xs text-slate-300">
                          Show this QR code or PIN to the donor staff at checkout:
                        </p>
                        <div className="pt-1 flex items-center gap-2 justify-center sm:justify-start">
                          <KeyRound className="w-5 h-5 text-amber-400" />
                          <span className="text-2xl font-black tracking-widest text-amber-400 font-mono">
                            {claim.pickup_pin || '1234'}
                          </span>
                        </div>
                      </div>

                      {/* QR Code Graphic */}
                      <div className="bg-white p-3 rounded-xl shadow-md shrink-0">
                        <QRCodeSVG 
                          value={claim.pickup_pin ? `BITESHARE-PIN:${claim.pickup_pin}` : claim.id} 
                          size={110} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Pickup Address */}
                  {bundle.address && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Location</p>
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                        <span>{bundle.address}</span>
                      </p>
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 pt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>
                        Pickup Deadline: <strong>{new Date(bundle.pickup_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}