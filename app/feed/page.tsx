'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Utensils,
  MapPin,
  Clock,
  RefreshCw,
  List,
  Map as MapIcon,
  Sparkles,
  Flame,
  Building,
  UserPlus,
  LogIn,
  X,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  ArrowRight,
  HeartHandshake,
  KeyRound,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react';

const RestaurantMapView = dynamic(
  () => import('@/components/RestaurantMapView'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
        <span>Loading Restaurant Map...</span>
      </div>
    ),
  }
);

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const CATEGORIES = ['All', 'Cooked Meals', 'Bakery', 'Groceries', 'Free Items'];

export default function FeedPage() {
  const router = useRouter();

  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [selectedQuantities, setSelectedQuantities] = useState<{ [bundleId: string]: number }>({});
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    pin: string;
    bundleTitle: string;
    storeName: string;
    claimedQty: number;
    pickupDeadline: string;
  } | null>(null);

  // Redirect Donors to Dashboard
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'DONOR') {
          router.push('/donor/dashboard');
        }
      }
    };
    checkRole();
  }, [router]);

  // Fetch active, non-expired food bundles
  const fetchBundles = async () => {
    setLoading(true);
    const nowIso = new Date().toISOString();
    const nowTime = new Date().getTime();

    const { data: rawBundles, error } = await supabase
      .from('food_bundles')
      .select('*')
      .in('status', ['AVAILABLE', 'available'])
      .gt('pickup_window_end', nowIso)
      .order('created_at', { ascending: false });

    if (error || !rawBundles) {
      setBundles([]);
      setLoading(false);
      return;
    }

    const donorIds = Array.from(new Set(rawBundles.map((b) => b.donor_id).filter(Boolean)));
    const donorMap = new Map();

    if (donorIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, organization_name, full_name, street_address, city, state, pincode, latitude, longitude, phone')
        .in('id', donorIds);

      if (profilesData) {
        profilesData.forEach((p) => donorMap.set(p.id, p));
      }
    }

    const processedBundles = rawBundles
      .map((bundle) => {
        const remaining =
          bundle.quantity_remaining !== null && bundle.quantity_remaining !== undefined
            ? Number(bundle.quantity_remaining)
            : Number(bundle.quantity) || 0;

        const profile = donorMap.get(bundle.donor_id);

        return {
          ...bundle,
          donor: profile || null,
          quantity_remaining: remaining,
        };
      })
      .filter((bundle) => {
        const expTime = bundle.pickup_window_end || bundle.expires_at;
        const isNotExpired = expTime ? new Date(expTime).getTime() > nowTime : true;
        const hasStock = bundle.quantity_remaining > 0;

        return hasStock && isNotExpired;
      });

    setBundles(processedBundles);

    const initialQtyMap: { [key: string]: number } = {};
    processedBundles.forEach((b) => {
      initialQtyMap[b.id] = 1;
    });
    setSelectedQuantities(initialQtyMap);
    setLoading(false);
  };

  useEffect(() => {
    fetchBundles();

    const interval = setInterval(() => {
      fetchBundles();
    }, 30000);

    const channel = supabase
      .channel('realtime_feed_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_bundles' }, () => fetchBundles())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => fetchBundles())
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Search & Category Filtering
  const filteredBundles = useMemo(() => {
    const nowTime = new Date().getTime();

    return bundles.filter((bundle) => {
      const expTime = bundle.pickup_window_end || bundle.expires_at;
      if (expTime && new Date(expTime).getTime() <= nowTime) {
        return false;
      }

      const donorName = (
        bundle.restaurant_name ||
        bundle.donor?.organization_name ||
        bundle.donor?.full_name ||
        ''
      ).toLowerCase();
      const title = (bundle.title || '').toLowerCase();
      const description = (bundle.description || '').toLowerCase();
      const address = (bundle.address || bundle.donor?.street_address || '').toLowerCase();
      const category = (bundle.category || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        query === '' ||
        title.includes(query) ||
        donorName.includes(query) ||
        description.includes(query) ||
        address.includes(query) ||
        category.includes(query);

      const isFreeItem = (Number(bundle.price_per_item) === 0 || Number(bundle.price) === 0);

      let matchesCategory = true;
      if (selectedCategory === 'Free Items') {
        matchesCategory = isFreeItem;
      } else if (selectedCategory !== 'All') {
        matchesCategory = category === selectedCategory.toLowerCase();
      }

      return matchesSearch && matchesCategory;
    });
  }, [bundles, searchQuery, selectedCategory]);

  // Restaurant Aggregation for RestaurantMapView
  const restaurantListForMap = useMemo(() => {
    const restaurantMap = new Map<string, any>();

    filteredBundles.forEach((bundle) => {
      const donorId = bundle.donor_id || bundle.donor?.id || bundle.address || 'partner-store';

      if (!restaurantMap.has(donorId)) {
        restaurantMap.set(donorId, {
          id: donorId,
          organization_name: bundle.restaurant_name || bundle.donor?.organization_name || bundle.donor?.full_name || 'Partner Food Store',
          full_name: bundle.donor?.full_name || 'Verified Owner',
          street_address: bundle.address || bundle.donor?.street_address || '',
          city: bundle.city || bundle.donor?.city || 'Bareilly',
          state: bundle.state || bundle.donor?.state || '',
          pincode: bundle.pincode || bundle.donor?.pincode || '',
          latitude: bundle.latitude ? Number(bundle.latitude) : bundle.donor?.latitude ? Number(bundle.donor?.latitude) : null,
          longitude: bundle.longitude ? Number(bundle.longitude) : bundle.donor?.longitude ? Number(bundle.donor?.longitude) : null,
          active_bundles_count: 0,
        });
      }

      const store = restaurantMap.get(donorId);
      store.active_bundles_count += 1;
    });

    return Array.from(restaurantMap.values());
  }, [filteredBundles]);

  // Quantity controls
  const handleQtyChange = (bundleId: string, delta: number, maxQty: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[bundleId] || 1;
      const nextVal = Math.min(Math.max(1, current + delta), maxQty);
      return { ...prev, [bundleId]: nextVal };
    });
  };

  const handleDirectQtyChange = (bundleId: string, inputVal: string, maxQty: number) => {
    if (inputVal === '') {
      setSelectedQuantities((prev) => ({ ...prev, [bundleId]: 0 }));
      return;
    }
    let parsed = parseInt(inputVal, 10);
    if (isNaN(parsed)) parsed = 1;
    if (parsed < 1) parsed = 1;
    if (parsed > maxQty) parsed = maxQty;

    setSelectedQuantities((prev) => ({ ...prev, [bundleId]: parsed }));
  };

  const handleSelectAll = (bundleId: string, maxQty: number) => {
    setSelectedQuantities((prev) => ({ ...prev, [bundleId]: maxQty }));
  };

  // Claim logic
  const handleClaim = async (bundle: any) => {
    if (!bundle) return;
    const bundleId = bundle.id;
    setClaimingId(bundleId);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowAuthModal(true);
      setClaimingId(null);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role === 'DONOR') {
      setMessage({ text: 'Donor accounts cannot claim surplus food bundles.', type: 'error' });
      setClaimingId(null);
      return;
    }

    const remainingQty = Number(bundle.quantity_remaining) || 0;
    const originalQty = Number(bundle.quantity) || remainingQty;
    const claimQty = selectedQuantities[bundleId] || 1;

    if (claimQty <= 0 || claimQty > remainingQty) {
      setMessage({ text: 'Please select a valid claim quantity.', type: 'error' });
      setClaimingId(null);
      return;
    }

    const pricePerUnit = Number(bundle.price_per_item) || Number(bundle.price) || 0;
    const standardCostForSelected = claimQty * pricePerUnit;

    const rawBulkPrice = Number(bundle.bulk_discount_price || bundle.total_price);
    const standardCostForRemainingStock = remainingQty * pricePerUnit;

    const isFullRemainingBatchSelected = claimQty === remainingQty;
    const isEntireOriginalBatchIntact = remainingQty === originalQty;

    const hasValidBulkDiscount =
      isEntireOriginalBatchIntact &&
      pricePerUnit > 0 &&
      !isNaN(rawBulkPrice) &&
      rawBulkPrice > 0 &&
      rawBulkPrice < standardCostForRemainingStock;

    const totalPrice = isFullRemainingBatchSelected && hasValidBulkDiscount ? rawBulkPrice : standardCostForSelected;
    
    // 12% Platform Fee & 88% Donor Payout
    const platformFee = totalPrice > 0 ? totalPrice * 0.12 : 0;
    const donorPayout = totalPrice > 0 ? totalPrice * 0.88 : 0;

    // 4-digit PIN
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

    const { error: claimError } = await supabase.from('claims').insert({
      bundle_id: bundleId,
      recipient_id: user.id,
      claimed_quantity: claimQty,
      total_price: totalPrice,
      platform_fee: platformFee,
      donor_payout: donorPayout,
      pickup_pin: generatedPin,
      status: 'PENDING',
    });

    if (claimError) {
      setMessage({ text: 'Failed to reserve bundle: ' + claimError.message, type: 'error' });
      setClaimingId(null);
      return;
    }

    const newRemaining = remainingQty - claimQty;
    const newStatus = newRemaining <= 0 ? 'CLAIMED' : 'AVAILABLE';

    await supabase
      .from('food_bundles')
      .update({
        quantity_remaining: newRemaining,
        status: newStatus,
      })
      .eq('id', bundleId);

    const storeNameStr = bundle.restaurant_name || bundle.donor?.organization_name || bundle.donor?.full_name || 'Partner Store';

    // Trigger Thank You Pop-up Modal with Instructions
    setSuccessModalData({
      pin: generatedPin,
      bundleTitle: bundle.title,
      storeName: storeNameStr,
      claimedQty: claimQty,
      pickupDeadline: bundle.pickup_window_end
        ? new Date(bundle.pickup_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        : 'Store Closing Time',
    });

    fetchBundles();
    setClaimingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            Live Marketplace Feed
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Explore Active Surplus Food
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            Reserve fresh meals, baked goods, and groceries from local partners at deep discounts or for free.
          </p>
        </div>
      </motion.div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search items, restaurants, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-full md:w-auto justify-center">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4 text-emerald-600" />
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-4 h-4 text-emerald-600" />
              Map View
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl font-semibold text-sm border shadow-xs flex items-center gap-2 ${
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
        </motion.div>
      )}

      {/* View Switcher */}
      {viewMode === 'map' ? (
        <RestaurantMapView restaurants={restaurantListForMap} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 bg-white border border-slate-200 rounded-3xl animate-pulse p-6 space-y-4"
            >
              <div className="h-6 bg-slate-100 rounded-xl w-3/4" />
              <div className="h-4 bg-slate-100 rounded-xl w-1/2" />
              <div className="h-20 bg-slate-100 rounded-2xl w-full" />
              <div className="h-10 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredBundles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">No active listings found</h3>
          <p className="text-slate-600 text-sm">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your search terms or category filters.'
              : 'Check back shortly! New surplus food offerings appear here automatically in real time.'}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
            >
              Reset Search & Filters
            </button>
          )}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {filteredBundles.map((bundle) => {
            const restaurantName =
              bundle.restaurant_name ||
              bundle.donor?.organization_name?.trim() ||
              bundle.donor?.full_name?.trim() ||
              'Partner Restaurant';

            const remainingQty = bundle.quantity_remaining;
            const originalQty = Number(bundle.quantity) || remainingQty;
            const pricePerUnit = Number(bundle.price_per_item) || Number(bundle.price) || 0;
            const isFree = pricePerUnit === 0;

            const currentClaimQty = selectedQuantities[bundle.id] || 1;
            const standardCostForSelected = currentClaimQty * pricePerUnit;

            const standardCostForRemainingStock = remainingQty * pricePerUnit;
            const rawBulkPrice = Number(bundle.bulk_discount_price || bundle.total_price);

            const isFullRemainingBatchSelected = currentClaimQty === remainingQty;
            const isEntireOriginalBatchIntact = remainingQty === originalQty;

            const hasValidBulkDiscount =
              isEntireOriginalBatchIntact &&
              pricePerUnit > 0 &&
              !isNaN(rawBulkPrice) &&
              rawBulkPrice > 0 &&
              rawBulkPrice < standardCostForRemainingStock;

            const discountPercent = hasValidBulkDiscount
              ? Math.round(((standardCostForRemainingStock - rawBulkPrice) / standardCostForRemainingStock) * 100)
              : 0;

            const isBulkAppliedForCurrentSelection = isFullRemainingBatchSelected && hasValidBulkDiscount;

            const finalCalculatedPrice = isBulkAppliedForCurrentSelection
              ? rawBulkPrice
              : standardCostForSelected;

            return (
              <motion.div
                key={bundle.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-4">
                  {/* Top Badges Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider rounded-full border border-slate-200">
                        {bundle.category || 'Surplus Food'}
                      </span>

                      {hasValidBulkDiscount && (
                        <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1 animate-pulse">
                          <Flame className="w-3.5 h-3.5 fill-amber-100" />
                          <span>SAVE {discountPercent}% ON FULL BATCH</span>
                        </span>
                      )}
                    </div>

                    {isFree ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full border border-emerald-200">
                        🎁 FREE
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-black rounded-full border border-emerald-200 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-emerald-600" />
                        <span>₹{pricePerUnit}/item</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Restaurant Name Badge */}
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                      {bundle.title}
                    </h2>

                    <Link
                      href={`/restaurants/${bundle.donor_id || bundle.donor?.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200/60 transition"
                    >
                      <Building className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span className="truncate max-w-[220px]">{restaurantName}</span>
                    </Link>
                  </div>

                  {bundle.description && (
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                      {bundle.description}
                    </p>
                  )}

                  {/* Address & Window End */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {bundle.address || bundle.donor?.street_address || 'Partner Store Location'}
                      </span>
                    </div>

                    {bundle.pickup_window_end && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Collect before:{' '}
                          <strong className="text-slate-800">
                            {new Date(bundle.pickup_window_end).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Selector Controls */}
                  <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/90 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Select Quantity:</span>
                      <span className="text-emerald-700 font-extrabold">
                        {remainingQty} item(s) left
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(bundle.id, -1, remainingQty)}
                          className="px-3 py-1.5 hover:bg-slate-100 font-extrabold text-slate-700 transition"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={currentClaimQty === 0 ? '' : currentClaimQty}
                          onChange={(e) =>
                            handleDirectQtyChange(bundle.id, e.target.value, remainingQty)
                          }
                          className="w-12 text-center text-xs font-black text-slate-900 border-none focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleQtyChange(bundle.id, 1, remainingQty)}
                          className="px-3 py-1.5 hover:bg-slate-100 font-extrabold text-slate-700 transition"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectAll(bundle.id, remainingQty)}
                        className="px-3.5 py-1.5 text-xs font-black bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl border border-emerald-300 transition"
                      >
                        All ({remainingQty})
                      </button>
                    </div>

                    {isBulkAppliedForCurrentSelection && (
                      <div className="text-[11px] font-extrabold text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Full Batch Discount applied! Saved ₹{standardCostForRemainingStock - rawBulkPrice}.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">Total Payable:</span>
                    <div className="text-right">
                      {isBulkAppliedForCurrentSelection && (
                        <span className="text-[11px] text-slate-400 line-through mr-1.5">
                          ₹{standardCostForRemainingStock}
                        </span>
                      )}
                      <span className="text-lg font-black text-slate-900">
                        {isFree ? '₹0 (Free)' : `₹${finalCalculatedPrice}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(bundle)}
                    disabled={claimingId === bundle.id}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-md transition duration-200 flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                  >
                    {claimingId === bundle.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing Reservation...
                      </>
                    ) : isFree ? (
                      '🎁 Claim Free Bundle'
                    ) : (
                      <>
                        <span>Reserve {currentClaimQty} Item(s) for ₹{finalCalculatedPrice}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* 🎉 THANK YOU & INSTRUCTIONS POP-UP MODAL */}
      <AnimatePresence>
        {successModalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 text-center relative my-8"
            >
              <button
                onClick={() => setSuccessModalData(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                <HeartHandshake className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Reservation Confirmed!
                </span>
                <h3 className="text-2xl font-black text-slate-900 pt-1">
                  Thank You for Rescuing Food!
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Reserved <strong className="text-slate-900">{successModalData.claimedQty} item(s)</strong> of{' '}
                  <span className="text-emerald-700 font-bold">{successModalData.bundleTitle}</span> from{' '}
                  <strong className="text-slate-900">{successModalData.storeName}</strong>.
                </p>
              </div>

              {/* Counter PIN Box */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Your Counter Pickup PIN</span>
                </div>
                <div className="text-4xl font-black text-emerald-900 tracking-widest font-mono">
                  {successModalData.pin}
                </div>
              </div>

              {/* Instructions Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" /> Essential Pickup Instructions
                </h4>

                <ul className="text-xs space-y-2.5 text-slate-600 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="bg-emerald-100 text-emerald-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[11px] font-black mt-0.5">
                      1
                    </span>
                    <span>
                      <strong>Arrive on Time:</strong> Collect before{' '}
                      <strong className="text-slate-900">{successModalData.pickupDeadline}</strong>. Unclaimed items expire automatically.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="bg-emerald-100 text-emerald-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[11px] font-black mt-0.5">
                      2
                    </span>
                    <span>
                      <strong>Check Quality First:</strong> Physically inspect food temperature and packaging at the counter <u>BEFORE</u> sharing your PIN.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="bg-amber-100 text-amber-900 rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[11px] font-black mt-0.5">
                      3
                    </span>
                    <span>
                      <strong>Platform Liability Notice:</strong> Once your PIN is verified by counter staff, the order is complete. If food is spoiled upon arrival, click <strong>"Reject at Counter"</strong> on <Link href="/my-claims" className="text-emerald-700 underline font-bold">My Claims</Link> to cancel at ₹0.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/my-claims"
                  className="block w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Go to My Claims Page
                </Link>

                <button
                  type="button"
                  onClick={() => setSuccessModalData(null)}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-700 font-bold text-xs transition"
                >
                  Continue Browsing Feed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 text-center relative"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">
                  Sign In to Reserve Food
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Join BiteShare to reserve surplus food and help prevent food waste.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/signup?role=RECIPIENT"
                  className="block w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Recipient Account
                </Link>

                <Link
                  href="/login"
                  className="block w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Log In to Existing Account
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}