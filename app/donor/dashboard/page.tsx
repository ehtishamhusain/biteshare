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
  MapPin,
  Sparkles,
  ShoppingBag,
  Flame,
  Navigation,
  Loader2,
} from 'lucide-react';

export default function DonorDashboardPage() {
  const [publishedBundles, setPublishedBundles] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Food Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'COOKED' | 'BAKERY' | 'GROCERY' | 'SHELTER_FREE'>('COOKED');
  const [quantity, setQuantity] = useState<number | ''>(5);
  const [pricePerItem, setPricePerItem] = useState<number | ''>(40);
  const [bundlePrice, setBundlePrice] = useState<number | ''>(200);
  const [isManualEdited, setIsManualEdited] = useState(false);
  const [pickupEnd, setPickupEnd] = useState('');

  // 📍 Location States (Pre-filled from Donor Profile)
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [country, setCountry] = useState('');
  const [fullPickupAddress, setFullPickupAddress] = useState('');
  
  // Dynamic Lat/Lng
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isManualEdited) {
      const q = quantity === '' ? 0 : Number(quantity);
      const p = pricePerItem === '' ? 0 : Number(pricePerItem);
      setBundlePrice(q * p);
    }
  }, [quantity, pricePerItem, isManualEdited]);

  useEffect(() => {
    fetchDonorProfileAndBundles();

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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        const street = profile.street_address || profile.address || '';
        const c = profile.city || '';
        const pin = profile.pincode || '';
        const st = profile.state || '';
        const cntry = profile.country || '';

        setStreetAddress(street);
        setCity(c);
        setPincode(pin);
        setStateVal(st);
        setCountry(cntry);

        if (profile.latitude && !isNaN(Number(profile.latitude))) {
          setLatitude(Number(profile.latitude));
        }
        if (profile.longitude && !isNaN(Number(profile.longitude))) {
          setLongitude(Number(profile.longitude));
        }

        const fullAddr =
          profile.address || [street, c, pin, st, cntry].filter(Boolean).join(', ');
        setFullPickupAddress(fullAddr || street || c);
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

  // 📍 GPS Live Geolocation Button Handler
  const handleGetGpsLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setMessage({ text: 'Geolocation is not supported by your browser.', type: 'error' });
      return;
    }

    setDetectingLocation(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const road = [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(', ');
            const detectedCity = addr.city || addr.town || addr.village || '';
            const detectedPin = addr.postcode || '';
            const detectedState = addr.state || '';
            const detectedCountry = addr.country || '';

            if (road) setStreetAddress(road);
            if (detectedCity) setCity(detectedCity);
            if (detectedPin) setPincode(detectedPin);
            if (detectedState) setStateVal(detectedState);
            if (detectedCountry) setCountry(detectedCountry);

            const newFull = [road, detectedCity, detectedPin, detectedState, detectedCountry]
              .filter(Boolean)
              .join(', ');
            if (newFull) setFullPickupAddress(newFull);
          }
        } catch (err) {
          console.log('Reverse geocoding error:', err);
        }

        setMessage({ text: '📍 Live GPS coordinates & address attached!', type: 'success' });
        setDetectingLocation(false);
      },
      (error) => {
        setDetectingLocation(false);
        setMessage({ text: 'Unable to fetch GPS location: ' + error.message, type: 'error' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const geocodeAddressString = async (addressQuery: string) => {
    if (!addressQuery.trim()) return null;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    } catch (err) {
      console.error('Dynamic geocoding error:', err);
    }
    return null;
  };

  const numQty = quantity === '' ? 0 : Number(quantity);
  const numPrice = pricePerItem === '' ? 0 : Number(pricePerItem);
  const stdTotal = numQty * numPrice;
  const numBundlePrice = bundlePrice === '' ? 0 : Number(bundlePrice);
  const savings = stdTotal - numBundlePrice;
  const discountPercent = stdTotal > 0 && savings > 0 ? Math.round((savings / stdTotal) * 100) : 0;

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

    let finalPickupEnd = pickupEnd;
    if (!finalPickupEnd) {
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 3);
      finalPickupEnd = defaultTime.toISOString();
    } else {
      finalPickupEnd = new Date(pickupEnd).toISOString();
    }

    const finalQty = quantity === '' ? 1 : Number(quantity);
    const finalPricePerItem = pricePerItem === '' ? 0 : Number(pricePerItem);
    const finalBundlePrice = bundlePrice === '' ? finalQty * finalPricePerItem : Number(bundlePrice);

    const finalAddress =
      fullPickupAddress.trim() ||
      [streetAddress, city, pincode, stateVal, country].filter(Boolean).join(', ') ||
      'Store Location';

    let finalLat = latitude;
    let finalLng = longitude;

    if (!finalLat || !finalLng) {
      const searchQuery = [streetAddress, city, stateVal, country].filter(Boolean).join(', ') || city;
      if (searchQuery) {
        const geoResult = await geocodeAddressString(searchQuery);
        if (geoResult) {
          finalLat = geoResult.lat;
          finalLng = geoResult.lng;
        }
      }
    }

    const newBundlePayload = {
      donor_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category: category,
      quantity: finalQty,
      quantity_remaining: finalQty,
      price_per_item: finalPricePerItem,
      price: finalPricePerItem,
      total_price: finalBundlePrice,
      address: finalAddress,
      city: city.trim() || 'Delhi',
      pincode: pincode.trim(),
      state: stateVal.trim(),
      country: country.trim(),
      latitude: finalLat,
      longitude: finalLng,
      pickup_window_end: finalPickupEnd, // ⚡ Uses existing schema column
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('food_bundles').insert(newBundlePayload);

    if (error) {
      setMessage({ text: 'Failed to publish bundle: ' + error.message, type: 'error' });
    } else {
      setMessage({ text: '🎉 Surplus Food Bundle Published Successfully!', type: 'success' });
      setTitle('');
      setDescription('');
      setQuantity(5);
      setPricePerItem(40);
      setBundlePrice(200);
      setIsManualEdited(false);
      setPickupEnd('');

      fetchPublishedBundles();
    }
    setSubmitting(false);
  };

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Publish Form */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Total Items Available
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuantity(val === '' ? '' : Number(val));
                    setIsManualEdited(false);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Single Item Price (₹) <span className="text-[10px] text-emerald-600">(0 = Free)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={pricePerItem}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPricePerItem(val === '' ? '' : Number(val));
                    setIsManualEdited(false);
                  }}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Price for All Items (₹) <span className="text-[10px] text-emerald-600">(Editable)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={bundlePrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBundlePrice(val === '' ? '' : Number(val));
                    setIsManualEdited(true);
                  }}
                  placeholder="0"
                  className={`w-full px-4 py-3 rounded-2xl border focus:ring-2 focus:ring-emerald-500 outline-none text-xs sm:text-sm font-bold text-slate-800 transition ${
                    discountPercent > 0
                      ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            {discountPercent > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>{discountPercent}% OFF Bulk Discount Applied!</strong> Standard Total: <span className="line-through text-slate-400">₹{stdTotal}</span> → Discounted Buy-All Price: <strong>₹{numBundlePrice}</strong>
                  </span>
                </div>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-lg font-black flex-shrink-0">
                  Recipient saves ₹{savings}
                </span>
              </div>
            ) : stdTotal > 0 ? (
              <div className="text-[11px] text-slate-500 font-medium italic">
                💡 Tip: Lower the "Price for All Items" box to offer a special discount when a recipient buys the complete batch!
              </div>
            ) : null}

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

            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Pickup Location Details
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pre-filled directly from your user profile.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGetGpsLocation}
                  disabled={detectingLocation}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center gap-1.5 flex-shrink-0"
                >
                  {detectingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      <span>Detecting GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Use GPS Location</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Street Address / Landmark
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStreetAddress(v);
                      setFullPickupAddress([v, city, pincode, stateVal, country].filter(Boolean).join(', '));
                    }}
                    placeholder="e.g. Connaught Place, Shop #12"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCity(v);
                      setFullPickupAddress([streetAddress, v, pincode, stateVal, country].filter(Boolean).join(', '));
                    }}
                    placeholder="e.g. Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPincode(v);
                      setFullPickupAddress([streetAddress, city, v, stateVal, country].filter(Boolean).join(', '));
                    }}
                    placeholder="e.g. 110001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={stateVal}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStateVal(v);
                      setFullPickupAddress([streetAddress, city, pincode, v, country].filter(Boolean).join(', '));
                    }}
                    placeholder="e.g. Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCountry(v);
                      setFullPickupAddress([streetAddress, city, pincode, stateVal, v].filter(Boolean).join(', '));
                    }}
                    placeholder="e.g. India"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold text-slate-800 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Full Compiled Pickup Address
                </label>
                <input
                  type="text"
                  required
                  value={fullPickupAddress}
                  onChange={(e) => setFullPickupAddress(e.target.value)}
                  placeholder="Full store location displayed to buyers..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-semibold text-slate-800 bg-slate-50/50"
                />
              </div>

              {latitude && longitude && (
                <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>GPS Lat/Lng Coordinates Attached: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                </div>
              )}
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

        {/* Published Food Items List */}
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
                
                const isExpired = bundle.pickup_window_end 
                  ? new Date(bundle.pickup_window_end).getTime() < new Date().getTime() 
                  : false;

                const isClaimedOut = remaining <= 0 || bundle.status === 'CLAIMED';
                const price = bundle.price_per_item ?? bundle.price ?? 0;
                const totalBatchPrice = bundle.total_price;
                const bundleStdTotal = (bundle.quantity || 1) * price;
                const hasDiscount = totalBatchPrice && totalBatchPrice < bundleStdTotal && price > 0;
                const pctOff = hasDiscount ? Math.round(((bundleStdTotal - totalBatchPrice) / bundleStdTotal) * 100) : 0;

                return (
                  <div
                    key={bundle.id}
                    className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                      isExpired && !isClaimedOut ? 'border-red-200 bg-red-50/20' : isClaimedOut ? 'border-slate-200 opacity-75' : 'border-slate-200'
                    }`}
                  >
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${
                            isExpired && !isClaimedOut
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : isClaimedOut
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isExpired && !isClaimedOut ? 'bg-red-500' : isClaimedOut ? 'bg-slate-400' : 'bg-emerald-600 animate-pulse'}`} />
                          {isExpired && !isClaimedOut ? 'Expired' : isClaimedOut ? 'Fully Reserved' : `${remaining} Remaining`}
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

                      {hasDiscount && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-[10px] font-black">
                          <Flame className="w-3 h-3 text-amber-600" />
                          <span>Buy All ({bundle.quantity} items): {pctOff}% OFF (₹{totalBatchPrice})</span>
                        </div>
                      )}

                      <div>
                        <h3 className="text-base font-black text-slate-900 line-clamp-1">{bundle.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {bundle.description || 'Fresh surplus food item.'}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{bundle.address || 'Store Pickup Location'}</span>
                        </div>

                        {bundle.pickup_window_end && (
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isExpired && !isClaimedOut ? 'text-red-500' : 'text-amber-600'}`} />
                            <span className={isExpired && !isClaimedOut ? 'text-red-600 font-bold' : ''}>
                              {isExpired && !isClaimedOut ? 'Expired at: ' : 'Ends: '}
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