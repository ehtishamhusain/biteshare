'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Building,
  MapPin,
  Search,
  Utensils,
  ChevronRight,
  RefreshCw,
  X,
  Store,
  CheckCircle2,
  Star,
  User,
  Map,
  LayoutGrid,
} from 'lucide-react';

// ⚡ Dynamically import RestaurantMapView with SSR disabled
const RestaurantMapView = dynamic(() => import('@/components/RestaurantMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-100 rounded-3xl flex flex-col items-center justify-center space-y-2 border border-slate-200 animate-pulse">
      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="text-xs font-bold text-slate-500">Loading Google Restaurant Map Engine...</span>
    </div>
  ),
});

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function RestaurantsDirectoryPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    fetchRestaurantsWithMetrics();
  }, []);

  const fetchRestaurantsWithMetrics = async () => {
    setLoading(true);

    // 1. Fetch DONOR profiles
    const { data: donors, error: donorError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'DONOR');

    // 2. Fetch AVAILABLE food bundles
    const { data: bundles } = await supabase
      .from('food_bundles')
      .select('donor_id, quantity_remaining')
      .eq('status', 'AVAILABLE');

    // 3. Fetch Reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('donor_id, rating');

    if (donors && !donorError) {
      // Aggregate active food bundle counts
      const bundleCountMap: { [donorId: string]: number } = {};
      if (bundles) {
        bundles.forEach((b) => {
          const qty = Number(b.quantity_remaining) || 1;
          if (qty > 0) {
            bundleCountMap[b.donor_id] = (bundleCountMap[b.donor_id] || 0) + 1;
          }
        });
      }

      // Aggregate ratings
      const ratingMap: { [donorId: string]: { total: number; count: number } } = {};
      if (reviews) {
        reviews.forEach((r) => {
          if (!ratingMap[r.donor_id]) {
            ratingMap[r.donor_id] = { total: 0, count: 0 };
          }
          ratingMap[r.donor_id].total += r.rating || 0;
          ratingMap[r.donor_id].count += 1;
        });
      }

      const formatted = donors.map((donor) => {
        const ratingData = ratingMap[donor.id];
        const count = ratingData?.count || 0;
        const avg = count > 0 ? Number((ratingData.total / count).toFixed(1)) : 0;

        return {
          ...donor,
          active_bundles_count: bundleCountMap[donor.id] || 0,
          avg_rating: avg,
          review_count: count,
        };
      });

      setRestaurants(formatted);
    }
    setLoading(false);
  };

  // 🔍 Enhanced Search Filter
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const query = searchQuery.toLowerCase().trim();
      const orgName = (r.organization_name || '').toLowerCase();
      const ownerName = (r.full_name || '').toLowerCase();
      const city = (r.city || '').toLowerCase();
      const street = (r.street_address || '').toLowerCase();
      const state = (r.state || '').toLowerCase();
      const pincode = (r.pincode || r.postal_code || '').toString().toLowerCase();

      return (
        query === '' ||
        orgName.includes(query) ||
        ownerName.includes(query) ||
        city.includes(query) ||
        street.includes(query) ||
        state.includes(query) ||
        pincode.includes(query)
      );
    });
  }, [restaurants, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Banner & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-center sm:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero-Waste Food Partners</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Explore Partner Restaurants & Bakeries
            </h1>
            <p className="text-slate-600 text-sm max-w-xl leading-relaxed">
              Discover local businesses sharing surplus food in your community. Check store owner details, complete address, ratings, and active food.
            </p>
          </div>

          {/* View Toggle Buttons */}
          <div className="flex items-center justify-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs self-center sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid View</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>

        {/* 🔍 Search Input Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by restaurant name, owner name, city, address, or pincode..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Directory Content */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-slate-500 text-sm font-semibold">Loading partner restaurants...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <Building className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No restaurants match your search</h3>
            <p className="text-slate-500 text-xs">Try searching for a different owner name, business, or location.</p>
          </div>
        ) : viewMode === 'map' ? (
          /* 🗺️ INTERACTIVE GOOGLE MAP VIEW */
          <div className="space-y-4">
            <RestaurantMapView restaurants={filteredRestaurants} />
          </div>
        ) : (
          /* 🍱 GRID VIEW CARDS */
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {filteredRestaurants.map((restaurant) => {
              const storeName = restaurant.organization_name || restaurant.full_name || 'Partner Store';
              const ownerName = restaurant.full_name || 'Verified Owner';
              const hasActiveFood = restaurant.active_bundles_count > 0;

              // Format Complete Address
              const fullAddress = [
                restaurant.street_address,
                restaurant.city,
                restaurant.state,
                restaurant.pincode || restaurant.postal_code,
              ]
                .filter(Boolean)
                .join(', ');

              return (
                <motion.div
                  key={restaurant.id}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    
                    {/* Live Availability & Star Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{restaurant.avg_rating > 0 ? restaurant.avg_rating : 'New'}</span>
                        <span className="text-[10px] text-amber-700 font-medium">({restaurant.review_count})</span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          hasActiveFood
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${hasActiveFood ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                        {hasActiveFood ? `${restaurant.active_bundles_count} Active Box(es)` : 'No Surplus Right Now'}
                      </span>
                    </div>

                    {/* Restaurant Business Name */}
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900 line-clamp-1">{storeName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Verified Food Partner</span>
                      </div>
                    </div>

                    {/* Owner Name & Complete Address Details */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600 font-medium">
                      
                      {/* Owner Name */}
                      <div className="flex items-center gap-2 text-slate-700">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Owner</span>
                          <span className="font-extrabold text-slate-900">{ownerName}</span>
                        </div>
                      </div>

                      {/* Complete Address */}
                      <div className="flex items-start gap-2 text-slate-600">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Complete Address</span>
                          <span className="line-clamp-2 text-slate-800 font-semibold leading-relaxed mt-0.5">
                            {fullAddress || 'Address details available on profile'}
                          </span>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* View Live Storefront Link */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <Link
                      href={`/restaurants/${restaurant.id}`}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-2 text-xs"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>View Food & Reviews</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

      </div>
    </div>
  );
}