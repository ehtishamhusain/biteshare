'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  User,
  Building,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Globe,
  RefreshCw,
  Store,
  Navigation,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Profile Form States
  const [role, setRole] = useState<'DONOR' | 'RECIPIENT'>('RECIPIENT');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const autoDetectDonorGPS = () => {
    if ('geolocation' in navigator) {
      setDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setDetectingGps(false);
        },
        (err) => {
          console.warn('Auto GPS detection failed or permission denied:', err.message);
          setDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Determine initial role from Auth metadata or default
    let activeRole: 'DONOR' | 'RECIPIENT' = 'RECIPIENT';
    if (user.user_metadata?.role) {
      const metaRole = String(user.user_metadata.role).toUpperCase();
      activeRole = metaRole === 'DONOR' ? 'DONOR' : 'RECIPIENT';
      setRole(activeRole);
    }

    // Fetch existing profile row if it exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && !error) {
      const fetchedRole = String(profile.role || user.user_metadata?.role || 'RECIPIENT').toUpperCase();
      activeRole = fetchedRole === 'DONOR' ? 'DONOR' : 'RECIPIENT';
      setRole(activeRole);
      setFullName(profile.full_name || '');
      setOrganizationName(profile.organization_name || '');
      setPhone(profile.phone || '');
      setStreetAddress(profile.street_address || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      
      // Clean and format fetched pincode to digits only (max 6)
      const cleanPincode = (profile.pincode || profile.postal_code || '').replace(/\D/g, '').slice(0, 6);
      setPincode(cleanPincode);
      setCountry(profile.country || 'India');
      
      if (profile.latitude && profile.longitude) {
        setLatitude(Number(profile.latitude));
        setLongitude(Number(profile.longitude));
      }
    }

    // ⚡ Automatic GPS detection on page load ONLY for Donors / Restaurants
    if (activeRole === 'DONOR') {
      autoDetectDonorGPS();
    }

    setLoading(false);
  };

  const handleSaveProfile = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage({ text: 'Session expired. Please log in again.', type: 'error' });
      setSaving(false);
      return;
    }

    // 🔒 Validation Check 1: Full Name
    if (!fullName.trim()) {
      setMessage({ text: 'Please enter your Full Name before saving.', type: 'error' });
      setSaving(false);
      return;
    }

    // 🔒 Validation Check 2: Phone Number
    if (!phone.trim()) {
      setMessage({ text: 'Please enter your Phone Number before saving.', type: 'error' });
      setSaving(false);
      return;
    }

    // 🔒 Validation Check 3: Restaurant / Business Name for Donors
    if (role === 'DONOR' && !organizationName.trim()) {
      setMessage({
        text: 'Please enter your Restaurant / Business Name before saving.',
        type: 'error',
      });
      setSaving(false);
      return;
    }

    // 🔒 Validation Check 4: Strict 6-Digit Pincode Requirement
    const cleanPincode = pincode.replace(/\D/g, '').slice(0, 6);
    if (cleanPincode.length !== 6) {
      setMessage({
        text: 'Please enter a valid 6-digit Pincode.',
        type: 'error',
      });
      setSaving(false);
      return;
    }

    let finalLat = latitude;
    let finalLng = longitude;

    // 🌍 For Donors: Auto-geocode address if GPS coordinates are missing
    if (role === 'DONOR' && (!finalLat || !finalLng)) {
      const fullQuery = [streetAddress.trim(), city.trim(), state.trim(), cleanPincode, country.trim()]
        .filter(Boolean)
        .join(', ');

      if (fullQuery) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              fullQuery
            )}&limit=1`
          );
          const geocodeData = await res.json();
          if (geocodeData && geocodeData.length > 0) {
            finalLat = parseFloat(geocodeData[0].lat);
            finalLng = parseFloat(geocodeData[0].lon);
            setLatitude(finalLat);
            setLongitude(finalLng);
          }
        } catch (err) {
          console.error('Auto-geocoding error:', err);
        }
      }
    }

    // For Recipients / NGOs: Ensure latitude and longitude are explicitly null
    if (role === 'RECIPIENT') {
      finalLat = null;
      finalLng = null;
    }

    const upsertPayload: any = {
      id: user.id,
      email: user.email,
      role: role,
      full_name: fullName.trim(),
      organization_name: organizationName.trim(),
      phone: phone.trim(),
      street_address: streetAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: cleanPincode,
      postal_code: cleanPincode,
      country: country.trim(),
      latitude: finalLat,
      longitude: finalLng,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(upsertPayload);

    if (error) {
      setMessage({ text: 'Error saving profile: ' + error.message, type: 'error' });
      setSaving(false);
    } else {
      // 💡 INSTANT SIGNAL: Tell Navbar & ProfileGuard across the app that profile was saved!
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profileUpdated'));
      }

      setMessage({ text: '🎉 Profile saved successfully! Redirecting...', type: 'success' });

      setTimeout(() => {
        if (role === 'DONOR') {
          router.push('/donor/dashboard');
        } else {
          router.push('/feed');
        }
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Account & Profile Settings
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage your personal or business details and address information for BiteShare.
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-slate-500 text-sm">Loading profile details...</p>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            {message && (
              <div
                className={`p-4 rounded-2xl font-semibold text-sm border flex items-center gap-2 ${
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

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* READ-ONLY ACCOUNT TYPE BADGE */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Account Type:
                  </span>
                </div>
                <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200">
                  {role === 'DONOR' ? 'Food Donor / Restaurant' : 'Recipient / NGO'}
                </span>
              </div>

              {/* Personal / Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 👤 FULL NAME (REQUIRED) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Faizan"
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* 🏬 RESTAURANT / ORGANIZATION NAME */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {role === 'DONOR' ? (
                      <span>
                        Restaurant / Bakery Name <span className="text-red-500">*</span>
                      </span>
                    ) : (
                      <span>Organization / Shelter Name</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={role === 'DONOR'}
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder={
                        role === 'DONOR'
                          ? 'e.g. Royal Bakery & Cafe'
                          : 'e.g. Community Shelter'
                      }
                      className={`w-full px-4 py-3 pl-10 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50 ${
                        role === 'DONOR' && !organizationName.trim()
                          ? 'border-amber-300'
                          : 'border-slate-200'
                      }`}
                    />
                    {role === 'DONOR' ? (
                      <Store className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
              </div>

              {/* 📞 PHONE NUMBER (REQUIRED) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Structured Address Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Structured Address Details</span>
                  </div>

                  {/* Automatic GPS status indicator ONLY for Donors / Restaurants */}
                  {role === 'DONOR' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold">
                      {detectingGps ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                          <span>Detecting Store GPS...</span>
                        </>
                      ) : latitude && longitude ? (
                        <>
                          <Navigation className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                          <span>📍 GPS Location Auto-Captured</span>
                        </>
                      ) : (
                        <span className="text-slate-500">Auto-Detecting Location...</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. House #12, Civil Lines"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bareilly"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Uttar Pradesh"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50"
                    />
                  </div>

                  {/* 📮 PINCODE (STRICT 6-DIGIT NUMERIC ONLY) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Pincode <span className="text-slate-400 font-medium">(6 digits)</span>
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        // Strips any non-digit character and restricts length to max 6
                        const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPincode(numericOnly);
                      }}
                      placeholder="e.g. 223001"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50 tracking-wider font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Country
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g. India"
                        className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800 bg-slate-50/50"
                      />
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl transition shadow-md inline-flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}