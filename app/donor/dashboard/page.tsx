'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Utensils,
  Clock,
  Tag,
  CheckCircle2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Building,
  MapPin,
  IndianRupee,
  Sparkles,
  Layers,
  ShoppingBag,
} from 'lucide-react';

export default function DonorDashboardPage() {
  const [publishedBundles, setPublishedBundles] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'COOKED' | 'BAKERY' | 'GROCERY' | 'SHELTER_FREE'>('COOKED');
  const [quantity, setQuantity] = useState<number>(5);
  const [pricePerItem, setPricePerItem] = useState<number>(0);
  const [address, setAddress] = useState('');
  const [pickupEnd, setPickupEnd] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchDonorProfileAndBundles();

    // Real-time synchronization whenever claims or inventory change
    const channel = supabase
      .channel('donor_my_bundles_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_bundles' },
        () => fetchPublishedBundles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDonorProfileAndBundles = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Pre-fill street address from donor profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('street_address, city')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        const fullAddr = [profile.street_address, profile.city].filter(Boolean).join(', ');
        setAddress(fullAddr);
      }

      fetchPublishedBundles();
    }
  };

  const fetchPublishedBundles = async () => {
    setLoadingList(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoadingList(false);
      return;
    }

    const { data, error } = await supabase
      .from('food_bundles')
      .select('*')
      .eq('donor_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPublishedBundles(data);
    }
    setLoadingList(false);
  };

  // Submit New Surplus Food Bundle
  const handlePublishBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage({ text: 'Session expired. Please log in again.', type: 'error' });
      setSubmitting(false);
      return;
    }

    if (!title.trim()) {
      setMessage({ text: 'Please enter a valid title for the food item.', type: 'error' });
      setSubmitting(false);
      return;
    }

    // Default pickup end time to 3 hours from now if not specified
    let finalPickupEnd = pickupEnd;
    if (!finalPickupEnd) {
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 3);
      finalPickupEnd = defaultTime.toISOString();
    } else {
      finalPickupEnd = new Date(pickupEnd).toISOString();
    }

    const newBundlePayload = {
      donor_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category: category,
      quantity: Number(quantity),
      quantity_remaining: Number(quantity),
      price_per_item: Number(pricePerItem),
      price: Number(pricePerItem), // total item base price
      address: address.trim(),
      pickup_window_end: finalPickupEnd,
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('food_bundles').insert(newBundlePayload);

    if (error) {
      setMessage({ text: 'Failed to publish bundle: ' + error.message, type: 'error' });
    } else {
      setMessage({ text: '🎉 Surplus Food Bundle Published Successfully!', type: 'success' });
      // Reset form fields
      setTitle('');
      setDescription('');
      setQuantity(5);
      setPricePerItem(0);
      setPickupEnd('');

      // Refresh listings
      fetchPublishedBundles();
    }
    setSubmitting(false);
  };

  // Delete / Cancel Published Listing
  const handleDeleteBundle = async (bundleId: string) => {
    if (!confirm('Are you sure you want to remove this published food item?')) return;

    const { error } = await supabase.from('food_bundles').delete().eq('id', bundleId);

    if (error) {
      setMessage({ text: 'Error removing listing: ' + error.message, type: 'error' });
    } else {
      setMessage({ text: 'Listing removed successfully.', type: 'success' });
      fetchPublishedBundles();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* ========================================================================= */}
        {/* 📤 PUBLISH SURPLUS FOOD FORM                                             */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200 mb-2">
              <PlusCircle className="w-4 h-4 text-emerald-600" /> Donor Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Publish Surplus Food Bundle
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              List extra freshly prepared food, bakery items, or grocery boxes so local recipients and shelters can claim them.
            </p>
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
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handlePublishBundle} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Food Item Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fresh Veg Biryani & Paneer Meal Trays"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm text-slate-800 bg-slate-50/50"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Food Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm text-slate-800 bg-slate-50/50 font-bold"
                >
                  <option value="COOKED">🍲 Cooked Hot Meals</option>
                  <option value="BAKERY">🥖 Bakery & Snacks</option>
                  <option value="GROCERY">🍎 Fresh Groceries & Fruits</option>
                  <option value="SHELTER_FREE">❤️ 100% Free Shelter Donation</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Food Description & Packaging Details
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention ingredient freshness, allergen notes, or packaging condition..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm text-slate-800 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Total Available Items
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50"
                />
              </div>

              {/* Price per Item */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Price per Item (₹) <span className="text-[10px] text-emerald-600">(0 = Free)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={pricePerItem}
                  onChange={(e) => setPricePerItem(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50"
                />
              </div>

              {/* Pickup Until */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Pickup Window Close Time
                </label>
                <input
                  type="datetime-local"
                  value={pickupEnd}
                  onChange={(e) => setPickupEnd(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm font-medium text-slate-800 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Pickup Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Store address where recipients can collect the food..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm text-slate-800 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl transition shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Publishing Food Item...' : 'Publish Surplus Bundle'}</span>
            </button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* 📋 YOUR PUBLISHED FOOD ITEMS LIST                                        */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-emerald-600" /> Your Published Food Items
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live surplus listings published under your store profile.
              </p>
            </div>

            <button
              onClick={fetchPublishedBundles}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Refresh List</span>
            </button>
          </div>

          {loadingList ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-slate-500 text-sm font-semibold">Loading your published items...</p>
            </div>
          ) : publishedBundles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No published items found</h3>
              <p className="text-slate-500 text-xs">Use the form above to publish your first surplus food bundle!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedBundles.map((bundle) => {
                const remaining = bundle.quantity_remaining ?? bundle.quantity ?? 0;
                const isClaimedOut = remaining <= 0 || bundle.status === 'CLAIMED';
                const price = bundle.price_per_item ?? bundle.price ?? 0;

                return (
                  <div
                    key={bundle.id}
                    className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                      isClaimedOut ? 'border-slate-200 opacity-75' : 'border-slate-200'
                    }`}
                  >
                    <div className="p-6 space-y-3">
                      {/* Status & Price Badges */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${
                            isClaimedOut
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isClaimedOut ? 'bg-slate-400' : 'bg-emerald-600 animate-pulse'}`} />
                          {isClaimedOut ? 'Fully Reserved' : `${remaining} Remaining`}
                        </span>

                        <span
                          className={`font-black text-xs px-2.5 py-0.5 rounded-lg border ${
                            price === 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {price === 0 ? '🎁 FREE' : `₹${price} / item`}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-black text-slate-900 line-clamp-1">{bundle.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {bundle.description || 'Fresh surplus food item.'}
                        </p>
                      </div>

                      {/* Address & Expiry */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{bundle.address || 'Store Pickup Location'}</span>
                        </div>

                        {bundle.pickup_window_end && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>
                              Ends:{' '}
                              {new Date(bundle.pickup_window_end).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        Total Quantity: <strong className="text-slate-800">{bundle.quantity}</strong>
                      </span>

                      <button
                        onClick={() => handleDeleteBundle(bundle.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}