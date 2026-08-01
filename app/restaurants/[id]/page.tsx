'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Building,
  MapPin,
  Phone,
  Utensils,
  Clock,
  Tag,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Lock,
  UserPlus,
  LogIn,
  X,
  CheckCircle2,
  Star,
  MessageSquare,
  Send,
  AlertCircle,
  Layers,
  HeartHandshake,
  KeyRound,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react';

export default function SingleRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  
  const donorId = params?.id as string;

  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [bundles, setBundles] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);

  const [loading, setLoading] = useState(true);
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

  const [selectedQuantities, setSelectedQuantities] = useState<{ [bundleId: string]: number }>({});

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (donorId) {
      fetchDonorData(donorId);
    }
  }, [donorId]);

  const fetchDonorData = async (id: string) => {
    setLoading(true);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (profile) setDonorProfile(profile);

    let { data: foodItems } = await supabase
      .from('food_bundles')
      .select('*')
      .eq('donor_id', id)
      .in('status', ['AVAILABLE', 'available'])
      .order('created_at', { ascending: false });

    if (foodItems) {
      const nowTime = new Date().getTime();
      const processed = foodItems.filter((b) => {
        const expTime = b.expires_at || b.pickup_window_end;
        const isExpired = expTime ? new Date(expTime).getTime() < nowTime : false;
        const remaining =
          b.quantity_remaining !== null && b.quantity_remaining !== undefined
            ? Number(b.quantity_remaining)
            : Number(b.quantity) || 0;
        return remaining > 0 && !isExpired;
      });

      setBundles(processed);

      const initialQtyMap: { [key: string]: number } = {};
      processed.forEach((b) => {
        initialQtyMap[b.id] = 1;
      });
      setSelectedQuantities(initialQtyMap);
    }

    await fetchReviews(id);
    setLoading(false);
  };

  const fetchReviews = async (id: string) => {
    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles(full_name, organization_name)')
      .eq('donor_id', id)
      .order('created_at', { ascending: false });

    if (reviewData) {
      setReviews(reviewData);

      if (reviewData.length > 0) {
        const total = reviewData.reduce((acc, r) => acc + (r.rating || 0), 0);
        setAvgRating(Number((total / reviewData.length).toFixed(1)));
      } else {
        setAvgRating(0);
      }
    }
  };

  const handleDirectQtyChange = (bundleId: string, inputVal: string, maxQty: number) => {
    if (inputVal === '') {
      setSelectedQuantities((prev) => ({ ...prev, [bundleId]: 0 }));
      return;
    }

    let parsed = parseInt(inputVal, 10);
    if (isNaN(parsed)) parsed = 1;
    if (parsed > maxQty) parsed = maxQty;

    setSelectedQuantities((prev) => ({ ...prev, [bundleId]: parsed }));
  };

  const handleSelectAll = (bundleId: string, maxQty: number) => {
    setSelectedQuantities((prev) => ({ ...prev, [bundleId]: maxQty }));
  };

  const handleClaim = async (bundle: any) => {
    const bundleId = bundle.id;
    const remainingQty =
      Number(
        bundle.quantity_remaining !== null && bundle.quantity_remaining !== undefined
          ? bundle.quantity_remaining
          : bundle.quantity
      ) || 1;
    const originalQty = Number(bundle.quantity) || remainingQty;
    const rawSelectedQty = selectedQuantities[bundleId] || 1;
    const claimQty = Math.max(1, Math.min(rawSelectedQty, remainingQty));

    const pricePerUnit = Number(bundle.price_per_item ?? bundle.price ?? 0);
    const rawBulkPrice = Number(bundle.bulk_discount_price ?? bundle.total_price ?? bundle.price ?? 0);

    const isFullRemainingBatch = claimQty === remainingQty;
    const isOriginalBatchIntact = remainingQty === originalQty;

    const hasBulkDiscount =
      isOriginalBatchIntact &&
      isFullRemainingBatch &&
      rawBulkPrice > 0 &&
      pricePerUnit > 0 &&
      rawBulkPrice < originalQty * pricePerUnit;

    const totalPrice = hasBulkDiscount ? rawBulkPrice : claimQty * pricePerUnit;

    const platformFee = totalPrice > 0 ? totalPrice * 0.12 : 0;
    const donorPayout = totalPrice > 0 ? totalPrice * 0.88 : 0;

    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

    setClaimingId(bundleId);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowAuthModal(true);
      setClaimingId(null);
      return;
    }

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
      setMessage({ text: 'Failed to claim item: ' + claimError.message, type: 'error' });
      setClaimingId(null);
      return;
    }

    const newRemaining = remainingQty - claimQty;
    await supabase
      .from('food_bundles')
      .update({
        quantity_remaining: newRemaining,
        status: newRemaining <= 0 ? 'CLAIMED' : 'AVAILABLE',
      })
      .eq('id', bundleId);

    const storeNameStr = donorProfile?.organization_name || donorProfile?.full_name || 'Partner Store';

    // Open Thank You Instructions Modal
    setSuccessModalData({
      pin: generatedPin,
      bundleTitle: bundle.title,
      storeName: storeNameStr,
      claimedQty: claimQty,
      pickupDeadline: bundle.pickup_window_end
        ? new Date(bundle.pickup_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        : 'Store Closing Time',
    });

    if (donorId) fetchDonorData(donorId);
    setClaimingId(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowReviewModal(false);
      setShowAuthModal(true);
      setSubmittingReview(false);
      return;
    }

    if (!commentInput.trim()) {
      setReviewError('Please write a brief comment regarding your experience.');
      setSubmittingReview(false);
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      donor_id: donorId,
      recipient_id: user.id,
      rating: ratingInput,
      comment: commentInput.trim(),
    });

    if (error) {
      setReviewError(error.message);
      setSubmittingReview(false);
    } else {
      setCommentInput('');
      setRatingInput(5);
      setShowReviewModal(false);
      setSubmittingReview(false);
      setMessage({ text: '🌟 Thank you! Your review has been submitted.', type: 'success' });
      fetchReviews(donorId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-slate-500 text-sm font-semibold">Loading store storefront...</p>
        </div>
      </div>
    );
  }

  const storeName = donorProfile?.organization_name || donorProfile?.full_name || 'Food Partner';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Back Link */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Feed</span>
        </Link>

        {/* Store Banner Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified BiteShare Store</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900">{storeName}</h1>
              
              <div className="flex items-center gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{avgRating > 0 ? avgRating : 'New'}</span>
                </div>
                <span className="text-slate-500 font-medium">
                  ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-black uppercase tracking-wider border border-emerald-200 transition flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 text-emerald-600" />
                <span>Write Review</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-600 pt-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                {donorProfile?.street_address
                  ? `${donorProfile.street_address}, ${donorProfile.city}, ${donorProfile.state}, ${donorProfile.pincode}`
                  : donorProfile?.city || 'Bareilly'}
              </span>
            </div>

            {donorProfile?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{donorProfile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl font-semibold text-sm border shadow-xs ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Live Available Food Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" /> Available Surplus Food from {storeName}
          </h2>

          {bundles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No active surplus food right now</h3>
              <p className="text-slate-500 text-xs">
                {storeName} has no published surplus food at this exact moment. Please check back near store closing hours!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.map((bundle) => {
                const remainingQty =
                  Number(
                    bundle.quantity_remaining !== null && bundle.quantity_remaining !== undefined
                      ? bundle.quantity_remaining
                      : bundle.quantity
                  ) || 1;
                const originalQty = Number(bundle.quantity) || remainingQty;

                const selectedQty = Math.max(1, Math.min(selectedQuantities[bundle.id] ?? 1, remainingQty));
                const pricePerUnit = Number(bundle.price_per_item ?? bundle.price ?? 0);
                const rawBulkPrice = Number(bundle.bulk_discount_price ?? bundle.total_price ?? bundle.price ?? 0);

                const isFullRemainingBatchSelected = selectedQty === remainingQty;
                const isOriginalBatchIntact = remainingQty === originalQty;

                const hasBulkDiscountDeal =
                  isOriginalBatchIntact &&
                  rawBulkPrice > 0 &&
                  pricePerUnit > 0 &&
                  rawBulkPrice < originalQty * pricePerUnit;

                const hasBulkDiscountApplied = isFullRemainingBatchSelected && hasBulkDiscountDeal;

                const calculatedTotal = hasBulkDiscountApplied ? rawBulkPrice : selectedQty * pricePerUnit;

                return (
                  <div
                    key={bundle.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Tag className="w-3.5 h-3.5" /> {remainingQty} Servings Left
                        </span>

                        <div className="text-right space-y-1">
                          <span
                            className={`font-black text-sm px-2.5 py-0.5 rounded-lg border inline-block ${
                              pricePerUnit === 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {pricePerUnit === 0 ? '🎁 FREE' : `₹${pricePerUnit} / item`}
                          </span>

                          {hasBulkDiscountDeal && (
                            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              All {originalQty} for ₹{rawBulkPrice} Deal
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{bundle.title}</h3>
                      <p className="text-slate-600 text-xs line-clamp-2">
                        {bundle.description || 'Fresh surplus food prepared with quality standards.'}
                      </p>

                      {(bundle.pickup_window_end || bundle.expires_at) && (
                        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>
                            Pickup ends:{' '}
                            {new Date(bundle.pickup_window_end || bundle.expires_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Quantity</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Available: <span className="font-extrabold text-emerald-700">{remainingQty} items</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={remainingQty}
                            value={selectedQuantities[bundle.id] ?? 1}
                            onChange={(e) =>
                              handleDirectQtyChange(bundle.id, e.target.value, remainingQty)
                            }
                            className="w-16 px-2 py-1.5 text-center font-black text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          />

                          <button
                            type="button"
                            onClick={() => handleSelectAll(bundle.id, remainingQty)}
                            className="px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl border border-emerald-300 transition shadow-xs"
                            title="Select all available items"
                          >
                            All ({remainingQty})
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaim(bundle)}
                        disabled={claimingId === bundle.id}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl transition shadow-xs text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {claimingId === bundle.id
                          ? 'Reserving...'
                          : calculatedTotal > 0
                          ? hasBulkDiscountApplied
                            ? `💥 Claim All ${selectedQty} for ₹${calculatedTotal} (Bulk Discount!)`
                            : `Claim ${selectedQty} item(s) for ₹${calculatedTotal}`
                          : `Claim ${selectedQty} Free Item(s)`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* REVIEWS & RATINGS SECTION */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> Customer Reviews & Ratings
            </h2>
            <button
              onClick={() => setShowReviewModal(true)}
              className="text-xs font-extrabold text-emerald-700 hover:underline flex items-center gap-1"
            >
              + Write a Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
              <Star className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No reviews submitted yet</h3>
              <p className="text-xs text-slate-500">
                Be the first recipient to leave feedback after claiming food from {storeName}!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {rev.reviewer?.full_name || rev.reviewer?.organization_name || 'Community Recipient'}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>

                  <span className="block text-[10px] text-slate-400 pt-1">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

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

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Your Counter Pickup PIN</span>
                </div>
                <div className="text-4xl font-black text-emerald-900 tracking-widest font-mono">
                  {successModalData.pin}
                </div>
              </div>

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
                  Close & Continue
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