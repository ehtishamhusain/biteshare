'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Loader2,
  Sparkles,
  ArrowRight,
  Globe,
  Navigation
} from 'lucide-react';

function ProfileForm() {
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState<string>('RECIPIENT');

  // Multi-step Structured Address State
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login';
      return;
    }
    setUser(user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setOrganizationName(profile.organization_name || '');
      setRole(profile.role || 'RECIPIENT');

      // Populate structured address or fallback
      setStreetAddress(profile.street_address || '');
      setCity(profile.city || '');
      setStateName(profile.state || '');
      setPincode(profile.pincode || '');
      setCountry(profile.country || 'India');
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    // Compute composite formatted address string
    const fullCombinedAddress = `${streetAddress}, ${city}, ${stateName} - ${pincode}, ${country}`;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        organization_name: organizationName,
        street_address: streetAddress,
        city,
        state: stateName,
        pincode,
        country,
        address: fullCombinedAddress,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update profile: ' + error.message });
    } else {
      if (isOnboarding) {
        if (role === 'DONOR') {
          window.location.href = '/donor/dashboard';
        } else {
          window.location.href = '/feed';
        }
      } else {
        setMessage({ type: 'success', text: '🎉 Profile details updated successfully!' });
      }
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Onboarding Welcome Banner */}
      {isOnboarding && (
        <div className="bg-gradient-to-r from-green-700 to-emerald-800 text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-200 bg-green-950/60 px-3 py-1 rounded-full border border-green-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Account Created
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome to BiteShare!</h1>
          <p className="text-green-100 text-sm">
            Please fill in your contact and location details to complete your account setup.
          </p>
        </div>
      )}

      {/* Profile Header Badge */}
      {!isOnboarding && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-extrabold text-2xl shrink-0">
              {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {fullName || 'User Profile'}
              </h1>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-800 border border-green-200 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            {role === 'DONOR' ? 'Food Donor Account' : 'Recipient Account'}
          </span>
        </div>
      )}

      {/* Feedback Alert */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Section */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading your profile information...</p>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-8">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* 1. Contact Information Section */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" /> Personal & Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Full Name / Contact Person
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ehtisham Husain"
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    {role === 'DONOR' ? 'Store / Bakery / Business Name' : 'Organization / Shelter Name (Optional)'}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder={role === 'DONOR' ? 'e.g. Gupta Sweets & Bakery' : 'e.g. City Hope Shelter'}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                      required={role === 'DONOR'}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Structured Address Section */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" /> Address Breakdown
              </h2>

              <div className="space-y-4">
                {/* Street Address / Landmark */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Street Address & Landmark
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. Shop #12, Near Hartmann College, Civil Lines"
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      City / District
                    </label>
                    <div className="relative">
                      <Navigation className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bareilly"
                        className="w-full pl-9 pr-3 py-2.5 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Uttar Pradesh"
                      className="w-full px-3 py-2.5 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                      required
                    />
                  </div>

                  {/* Pincode / Postal Code */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Pincode / Postal Code
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 243001"
                      className="w-full px-3 py-2.5 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                      required
                    />
                  </div>

                  {/* Country Field (Text Input format) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Country
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g. India"
                        className="w-full pl-9 pr-3 py-2.5 border rounded-xl border-slate-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-50 mt-4"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile...
                </>
              ) : isOnboarding ? (
                <>
                  Complete Setup & Continue <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Details
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <Suspense fallback={
        <div className="text-center py-20 text-slate-500 text-sm">
          Loading profile...
        </div>
      }>
        <ProfileForm />
      </Suspense>
    </div>
  );
}