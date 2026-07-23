'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { 
  MapPin, 
  Package, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee, 
  Gift, 
  Tag, 
  Building,
  Navigation,
  Globe
} from 'lucide-react';

export default function DonorDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [pickupHours, setPickupHours] = useState('2');

  // Structured Address State
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  
  // Real GPS Coordinates
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  // Pricing State
  const [isFree, setIsFree] = useState<boolean>(true);
  const [price, setPrice] = useState<number>(0);
  
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUserAndFetchProfile();
  }, []);

  const checkUserAndFetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      
      // Auto-prefill address breakdown from Donor Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('street_address, city, state, pincode, country')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.street_address) setStreetAddress(profile.street_address);
        if (profile.city) setCity(profile.city);
        if (profile.state) setStateName(profile.state);
        if (profile.pincode) setPincode(profile.pincode);
        if (profile.country) setCountry(profile.country);
      }
    } else {
      window.location.href = '/login';
    }
  };

  const handleGetLocation = () => {
    setLocationStatus('Fetching live GPS coordinates...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setLocationStatus(`📍 GPS Captured: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        },
        (error) => {
          console.error('Geolocation Error:', error);
          setLatitude(null);
          setLongitude(null);
          setLocationStatus('❌ Could not fetch GPS location. Please allow location permissions in your browser.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus('❌ Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (latitude === null || longitude === null) {
      setMessage({ 
        type: 'error', 
        text: '📍 Real GPS Location is required! Please click "Capture Live GPS Location" before publishing.' 
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const pickupEnd = new Date(Date.now() + parseInt(pickupHours) * 3600000).toISOString();
    const finalPrice = isFree ? 0 : parseFloat(price.toString()) || 0;
    const fullCombinedAddress = `${streetAddress}, ${city}, ${stateName} - ${pincode}, ${country}`;

    const { error } = await supabase.from('food_bundles').insert([
      {
        donor_id: user.id,
        title,
        description,
        street_address: streetAddress,
        city,
        state: stateName,
        pincode,
        country,
        address: fullCombinedAddress,
        quantity: parseInt(quantity) || 1,
        price: finalPrice,
        pickup_window_end: pickupEnd,
        latitude: latitude,
        longitude: longitude,
        location: `POINT(${longitude} ${latitude})`,
        status: 'AVAILABLE',
      },
    ]);

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to publish bundle: ' + error.message });
    } else {
      setMessage({ type: 'success', text: '🎉 Surplus food bundle published successfully with your exact store address!' });
      
      // Reset non-location form fields
      setTitle('');
      setDescription('');
      setQuantity('1');
      setPrice(0);
      setIsFree(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-7 h-7 text-green-600" />
              Publish Surplus Food Bundle
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              List available surplus food items with detailed address information and pickup timers.
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Bundle Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10 Samosa & Pastry Box"
                className="w-full p-3 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                required
              />
            </div>

            {/* Address Breakdown */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-green-600" /> Pickup Store Address Breakdown
              </label>

              <div>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Street Address / Landmark (e.g. Gupta Sweet, Near Hartmann College)"
                  className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City / District (e.g. Bareilly)"
                  className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                  required
                />

                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="State (e.g. Uttar Pradesh)"
                  className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                  required
                />

                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode (e.g. 243001)"
                  className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                  required
                />

                {/* Text input format for Country */}
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country (e.g. India)"
                    className="w-full pl-9 pr-3 py-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Freshly made snacks, best picked up within 2 hours."
                className="w-full p-3 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
              />
            </div>

            {/* Quantity & Pickup Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Quantity (Bundles)</label>
                <div className="relative">
                  <Package className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Pickup Deadline (Hours)</label>
                <div className="relative">
                  <Clock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={pickupHours}
                    onChange={(e) => setPickupHours(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Listing Type & Price Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Listing Type & Pricing</label>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => { setIsFree(true); setPrice(0); }}
                  className={`py-2.5 px-4 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition ${
                    isFree 
                      ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Gift className="w-4 h-4" /> Free Donation (₹0)
                </button>
                <button
                  type="button"
                  onClick={() => setIsFree(false)}
                  className={`py-2.5 px-4 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition ${
                    !isFree 
                      ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Tag className="w-4 h-4" /> Discounted Sale
                </button>
              </div>

              {!isFree && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    Discounted Price per Bundle (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      step="5"
                      min="10"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 99"
                      className="w-full pl-9 pr-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                      required={!isFree}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Geolocation Input */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                GPS Location Tagging <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                className={`w-full border py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 ${
                  latitude !== null 
                    ? 'bg-green-50 border-green-300 text-green-800' 
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MapPin className="w-4 h-4 text-green-600" /> 
                {latitude !== null ? 'Refresh Live GPS Location' : 'Capture Live GPS Location'}
              </button>
              {locationStatus && (
                <p className={`text-xs mt-2 font-medium text-center ${
                  latitude !== null ? 'text-green-700' : 'text-amber-600'
                }`}>
                  {locationStatus}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition shadow-md disabled:opacity-50 text-sm"
            >
              {loading ? 'Publishing Bundle...' : 'Publish Surplus Bundle'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}