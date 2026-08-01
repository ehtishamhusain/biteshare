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
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 🔢 Quantity selector state for each food bundle
  const [selectedQuantities, setSelectedQuantities] = useState<{ [bundleId: string]: number }>({});

  // Review Form Modal States
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

    // 1. Fetch Donor Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (profile) setDonorProfile(profile);

    // 2. Fetch Surplus Food Bundles
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

      // Initialize selected quantities map to 1 for each bundle
      const initialQtyMap: { [key: string]: number } = {};
      processed.forEach((b) => {
        initialQtyMap[b.id] = 1;
      });
      setSelectedQuantities(initialQtyMap);
    }

    // 3. Fetch Reviews
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

  // 🔢 Quantity Handler Functions
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

  // 🛍️ Claim Food with Custom Quantity and Financial Calculation
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

    // Bulk discount applies ONLY IF 100% of original batch is intact AND full remaining batch is selected
    const hasBulkDiscount =
      isOriginalBatchIntact &&
      isFullRemainingBatch &&
      rawBulkPrice > 0 &&
      pricePerUnit > 0 &&
      rawBulkPrice < originalQty * pricePerUnit;

    const totalPrice = hasBulkDiscount ? rawBulkPrice : claimQty * pricePerUnit;

    // 💰 Calculate 10% Platform Fee and 90% Donor Payout
    const platformFee = totalPrice > 0 ? totalPrice * 0.10 : 0;
    const donorPayout = totalPrice > 0 ? totalPrice * 0.90 : 0;

    setClaimingId(bundleId);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowAuthModal(true);
      setClaimingId(null);
      return;
    }

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

    setMessage({
      text: `🎉 Reserved ${claimQty} item(s) for ₹${totalPrice}! PIN: ${generatedPin}. Check "My Claims" for details.`,
      type: 'success',
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
          href="/restaurants"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Restaurants</span>
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
              
              {/* Star Rating Badge */}
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

                // Bulk deal is valid ONLY IF 100% of original batch is intact
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

                          {/* Deal badge displays ONLY IF 100% of original batch is intact */}
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

                    {/* Quantity Selection Bar & Dynamic Claim Button */}
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

      {/* WRITE A REVIEW MODAL */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <h3 className="text-lg font-black text-slate-900">Review {storeName}</h3>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {reviewError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Your Rating
                  </label>
                  <div className="flex gap-2 justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="p-1 transition hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= ratingInput
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Your Review Feedback
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Describe food quality, packaging hygiene, or store pickup speed..."
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guest Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-5 z-10"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Sign In Required</h3>
                <p className="text-slate-500 text-xs">
                  Please log in or create a recipient account to claim food or leave reviews.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/signup"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </Link>

                <Link
                  href="/login"
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>Log In</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}