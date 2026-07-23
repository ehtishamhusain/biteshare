'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MapView from '@/components/MapView';
import { Utensils, MapPin, Clock, Tag, RefreshCw, List, Map as MapIcon, Sparkles } from 'lucide-react';

export default function FeedPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchBundles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('food_bundles')
      .select('*')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBundles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBundles();

    // ⚡ Supabase Realtime Subscription Listener (Type-Safe)
    const channel = supabase
      .channel('realtime_food_bundles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_bundles' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            if (payload.new && payload.new.status === 'AVAILABLE') {
              setBundles((prev) => [payload.new, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new && payload.new.status === 'AVAILABLE') {
              setBundles((prev) =>
                prev.some((b) => b.id === payload.new.id)
                  ? prev.map((b) => (b.id === payload.new.id ? payload.new : b))
                  : [payload.new, ...prev]
              );
            } else if (payload.new) {
              setBundles((prev) => prev.filter((item) => item.id !== payload.new.id));
            }
          } else if (payload.eventType === 'DELETE') {
            if (payload.old && payload.old.id) {
              setBundles((prev) => prev.filter((item) => item.id !== payload.old.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClaim = async (bundleId: string) => {
    setClaimingId(bundleId);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage({ text: 'Please log in as a recipient to reserve bundles.', type: 'error' });
      setClaimingId(null);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'DONOR') {
      setMessage({ text: 'Donor accounts cannot claim food bundles.', type: 'error' });
      setClaimingId(null);
      return;
    }

    const { error: claimError } = await supabase
      .from('claims')
      .insert([{ bundle_id: bundleId, recipient_id: user.id, status: 'PENDING' }]);

    if (claimError) {
      setMessage({ text: 'Failed to claim bundle: ' + claimError.message, type: 'error' });
      setClaimingId(null);
      return;
    }

    await supabase
      .from('food_bundles')
      .update({ status: 'CLAIMED' })
      .eq('id', bundleId);

    setMessage({ text: '🎉 Food bundle reserved successfully! Check "My Claims" for details.', type: 'success' });
    setBundles((prev) => prev.filter((b) => b.id !== bundleId));
    setClaimingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/30 backdrop-blur-md border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" /> Realtime Live Feed
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Active Surplus Food Near You</h1>
              <p className="text-emerald-100 text-sm sm:text-base mt-1">
                Real-time surplus offerings from local bakeries, restaurants, and grocery stores.
              </p>
            </div>

            {/* List / Map View Switcher */}
            <div className="flex bg-emerald-800/50 backdrop-blur-md p-1 rounded-xl border border-emerald-500/30">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  viewMode === 'list' ? 'bg-white text-emerald-800 shadow-md' : 'text-emerald-100 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" /> List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  viewMode === 'map' ? 'bg-white text-emerald-800 shadow-md' : 'text-emerald-100 hover:text-white'
                }`}
              >
                <MapIcon className="w-4 h-4" /> Map View
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 font-medium text-sm border shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* View Selection */}
        {viewMode === 'map' ? (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <MapView bundles={bundles} onClaim={handleClaim} />
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-medium">Loading live surplus food listings...</p>
          </div>
        ) : bundles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No active food bundles found</h3>
            <p className="text-slate-500 text-sm mt-1">
              Check back shortly! New surplus food listings appear here automatically in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      <Tag className="w-3.5 h-3.5" /> Quantity: {bundle.quantity}
                    </span>
                    <span
                      className={`font-black text-lg px-3 py-0.5 rounded-lg border ${
                        bundle.price === 0 || !bundle.price
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {bundle.price === 0 || !bundle.price ? '🎁 FREE' : `₹${bundle.price}`}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{bundle.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{bundle.description || 'Fresh surplus food available for pickup.'}</p>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{bundle.address || 'Address provided upon reservation'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Pickup Window Closes: {new Date(bundle.pickup_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => handleClaim(bundle.id)}
                    disabled={claimingId === bundle.id}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-sm hover:shadow disabled:opacity-50 text-sm"
                  >
                    {claimingId === bundle.id ? 'Reserving...' : bundle.price > 0 ? `Reserve Bundle (₹${bundle.price})` : 'Claim Free Bundle'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}