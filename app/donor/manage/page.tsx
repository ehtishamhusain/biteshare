'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { 
  ClipboardCheck, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Package, 
  Check 
} from 'lucide-react';

export default function DonorManagePage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinInputs, setPinInputs] = useState<{ [key: string]: string }>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDonorListings();

    // Listen for auth state changes (e.g. Sign Out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchDonorListings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Strict Auth Guard
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      // 1. Fetch donor's food bundles
      const { data: bundlesData, error: bundlesError } = await supabase
        .from('food_bundles')
        .select('*')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      if (bundlesError || !bundlesData) {
        setLoading(false);
        return;
      }

      if (bundlesData.length === 0) {
        setBundles([]);
        setLoading(false);
        return;
      }

      // 2. Fetch associated claims with recipient profiles
      const bundleIds = bundlesData.map((b) => b.id);
      const { data: claimsData } = await supabase
        .from('claims')
        .select('*, profiles:recipient_id(full_name, phone, email)')
        .in('bundle_id', bundleIds);

      const claimsMap = new Map((claimsData || []).map((c) => [c.bundle_id, c]));

      const combinedListings = bundlesData.map((bundle) => ({
        ...bundle,
        claim: claimsMap.get(bundle.id) || null,
      }));

      setBundles(combinedListings);
    } catch (err: any) {
      console.error('Error loading donor listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async (bundleId: string, expectedPin: string) => {
    const enteredPin = pinInputs[bundleId]?.trim();

    if (!enteredPin) {
      setMessage({ type: 'error', text: 'Please enter the 4-digit PIN presented by the recipient.' });
      return;
    }

    if (enteredPin !== expectedPin) {
      setMessage({ type: 'error', text: '❌ Invalid PIN! Please check the recipient screen and try again.' });
      return;
    }

    setVerifyingId(bundleId);
    setMessage(null);

    // Update claim and food_bundle status to COMPLETED
    await supabase
      .from('claims')
      .update({ status: 'COMPLETED' })
      .eq('bundle_id', bundleId);

    await supabase
      .from('food_bundles')
      .update({ status: 'COMPLETED' })
      .eq('id', bundleId);

    setMessage({ type: 'success', text: '🎉 Pickup verified successfully! Order marked as completed.' });
    setVerifyingId(null);
    fetchDonorListings();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-7 h-7 text-green-600" /> Store Pickup Verification
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify recipient pickup PINs and manage your store's surplus listings.
            </p>
          </div>
          <a
            href="/donor/dashboard"
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition"
          >
            + Post New Bundle
          </a>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            Loading active store listings...
          </div>
        ) : bundles.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No active surplus food listings found.</p>
            <a href="/donor/dashboard" className="inline-block text-xs font-bold text-green-600 hover:underline">
              Click here to publish a bundle
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bundles.map((bundle) => {
              const claim = bundle.claim;
              const recipient = claim?.profiles;
              const isCompleted = bundle.status === 'COMPLETED' || claim?.status === 'COMPLETED';

              return (
                <div 
                  key={bundle.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{bundle.title}</h3>
                      <p className="text-xs text-slate-500">
                        {bundle.address || 'No specific address listed.'}
                      </p>
                    </div>

                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      isCompleted 
                        ? 'bg-slate-100 text-slate-700' 
                        : claim 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isCompleted ? '✓ PICKED UP' : claim ? '⏳ CLAIMED (PENDING PICKUP)' : '🟢 AVAILABLE'}
                    </span>
                  </div>

                  {/* Recipient Details */}
                  {claim && recipient && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold uppercase block text-[10px]">Reserved By</span>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                          <User className="w-3.5 h-3.5 text-green-600" />
                          <span>{recipient.full_name || 'Community Member'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold uppercase block text-[10px]">Contact Phone</span>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-green-600" />
                          <span>{recipient.phone || 'No phone provided'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PIN Verification Handshake Form */}
                  {claim && !isCompleted && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Enter Recipient's 4-Digit Pickup PIN
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Enter PIN (e.g. 4829)"
                            value={pinInputs[bundle.id] || ''}
                            onChange={(e) => setPinInputs({ ...pinInputs, [bundle.id]: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white font-mono font-bold"
                          />
                        </div>
                        <button
                          onClick={() => handleVerifyPin(bundle.id, claim.pickup_pin)}
                          disabled={verifyingId === bundle.id}
                          className="bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition flex items-center gap-1.5 shrink-0"
                        >
                          <Check className="w-4 h-4" /> Verify & Complete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}