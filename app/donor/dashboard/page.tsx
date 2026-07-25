'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Utensils,
  MapPin,
  Tag,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  Calculator,
  Percent,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function DonorDashboardPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('10');

  // 💰 Pricing States
  const [pricePerItem, setPricePerItem] = useState('30');
  const [totalPrice, setTotalPrice] = useState('220'); // Allows custom bulk discount!

  const [pickupWindowEnd, setPickupWindowEnd] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchDonorProfile();
  }, []);

  // 🧮 Auto-suggest standard total, but allow custom editing
  const handleQuantityChange = (newQty: string) => {
    setQuantity(newQty);
    const qty = parseInt(newQty) || 1;
    setTotalPrice((parseFloat(pricePerItem || '0') * qty).toString());
  };

  const handlePricePerItemChange = (val: string) => {
    setPricePerItem(val);
    const qty = parseInt(quantity) || 1;
    setTotalPrice((parseFloat(val || '0') * qty).toString());
  };

  // 🏷️ Donor can freely set any custom bulk discount price!
  const handleTotalPriceChange = (val: string) => {
    setTotalPrice(val);
  };

  const fetchDonorProfile = async () => {
    setFetchingProfile(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        const addressParts = [
          profile.organization_name,
          profile.street_address,
          profile.city,
          profile.state,
          profile.pincode,
          profile.country,
        ].filter(Boolean);

        if (addressParts.length > 0) {
          setAddress(addressParts.join(', '));
        }
      }
    }
    setFetchingProfile(false);
  };

  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setMessage({ text: '📍 Live GPS location attached successfully!', type: 'success' });
        },
        () => {
          setMessage({
            text: 'Unable to access GPS location. Address manually populated.',
            type: 'error',
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage({ text: 'Please log in to publish surplus food bundles.', type: 'error' });
      setLoading(false);
      return;
    }

    const isoPickupEnd = pickupWindowEnd
      ? new Date(pickupWindowEnd).toISOString()
      : new Date().toISOString();

    const parsedQuantity = parseInt(quantity) || 1;
    const parsedPricePerItem = parseFloat(pricePerItem) || 0;
    const parsedTotalPrice = parseFloat(totalPrice) || 0;

    const { error } = await supabase.from('food_bundles').insert([
      {
        donor_id: user.id,
        title,
        description,
        quantity: parsedQuantity,
        quantity_remaining: parsedQuantity,
        price: parsedTotalPrice, // Bulk deal price for whole bundle
        price_per_item: parsedPricePerItem, // Standard individual item price
        pickup_window_end: isoPickupEnd,
        address,
        latitude: latitude || '28.3670',
        longitude: longitude || '79.4304',
        status: 'AVAILABLE',
      },
    ]);

    if (error) {
      setMessage({ text: 'Error publishing bundle: ' + error.message, type: 'error' });
    } else {
      setMessage({
        text: '🎉 Food bundle published successfully to the live feed!',
        type: 'success',
      });
      setTitle('');
      setDescription('');
      setQuantity('10');
      setPricePerItem('0');
      setTotalPrice('0');
      setPickupWindowEnd('');
      setTimeout(() => {
        router.push('/donor/manage');
      }, 1500);
    }
    setLoading(false);
  };

  // 📊 Calculate live bulk discount metrics
  const standardTotal = (parseFloat(pricePerItem) || 0) * (parseInt(quantity) || 1);
  const customTotal = parseFloat(totalPrice) || 0;
  const isDiscounted = customTotal > 0 && customTotal < standardTotal;
  const discountAmount = standardTotal - customTotal;
  const discountPercent = standardTotal > 0 ? Math.round((discountAmount / standardTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div
          className="text-center space-y-2"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Donor Publishing Station</span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-3xl font-black text-slate-900 tracking-tight"
          >
            Publish Surplus Food Bundle
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-slate-600 text-sm max-w-md mx-auto">
            Set single item pricing or give recipients a special bulk discount for clearing the entire batch!
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm"
        >
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl mb-6 font-semibold text-sm border flex items-center gap-2 ${
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
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Bundle Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 10 Fresh Personal Pizzas & Garlic Bread"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe dietary details, packaging, or allergen info..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50 transition"
              />
            </div>

            {/* Total Items Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Total Servings / Items Available
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="10"
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50 transition"
                />
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 💲 FLEXIBLE BULK DISCOUNT PRICING SECTION */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Flexible Pricing & Bulk Offer</span>
                </div>

                {/* Discount Badge */}
                {isDiscounted && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                    <Percent className="w-3 h-3 text-amber-600" />
                    <span>{discountPercent}% OFF Bulk Discount!</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Price Per Item */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Standard Price Per Item (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      value={pricePerItem}
                      onChange={(e) => handlePricePerItemChange(e.target.value)}
                      className="w-full px-4 py-2.5 pl-9 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-extrabold text-slate-800 bg-white"
                    />
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Total Price for Whole Bundle (Freely Editable!) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Offer Price for ALL {quantity || 1} Items (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={totalPrice}
                      onChange={(e) => handleTotalPriceChange(e.target.value)}
                      className="w-full px-4 py-2.5 pl-9 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-extrabold text-slate-800 bg-white"
                    />
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic pt-1">
                💡 Recipients can buy individual items at <span className="font-bold text-slate-800">₹{pricePerItem || 0}</span> each, or reserve all <span className="font-bold text-slate-800">{quantity}</span> items at once for <span className="font-bold text-emerald-700">₹{totalPrice || 0}</span>
                {isDiscounted && ` (saving ₹${discountAmount}!)`}.
              </p>
            </div>

            {/* Timing & Address Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Pickup Window Closes At
                </label>
                <input
                  type="datetime-local"
                  required
                  value={pickupWindowEnd}
                  onChange={(e) => setPickupWindowEnd(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50 transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Store Pickup Address
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                    {fetchingProfile ? 'Fetching profile...' : 'Auto-filled from profile'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop #12, Civil Lines, Bareilly, UP, 243001, India"
                    className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50 transition"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleFetchLocation}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200 transition hover:bg-emerald-100"
              >
                <MapPin className="w-4 h-4" />
                <span>Attach Current GPS Location</span>
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl transition shadow-md text-sm disabled:opacity-50"
            >
              {loading ? 'Publishing Bundle...' : 'Publish to Live Feed'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}