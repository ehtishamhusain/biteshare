'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Utensils,
  Heart,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'DONOR' | 'RECIPIENT'>('RECIPIENT');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // 1. Strict email validation regex
  const isValidEmail = (emailStr: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailStr.trim());
  };

  // 2. Real-time Password Strength Criteria
  const passwordCriteria = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);

  // Triggers when user submits form -> validates form and opens modal
  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();

    if (!isValidEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid, correctly formatted email address (e.g., name@gmail.com).');
      return;
    }

    if (!isPasswordStrong) {
      setErrorMsg('Please fulfill all password security requirements listed below.');
      return;
    }

    // Reset agreement state and show modal
    setAgreedToTerms(false);
    setShowModal(true);
  };

  // Triggers inside modal when user agrees and clicks proceed
  const handleFinalSignUp = async () => {
    if (!agreedToTerms) return;

    setLoading(true);
    setErrorMsg('');

    const cleanEmail = email.trim();

    // 1. Submit to Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          role,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setShowModal(false);
      setLoading(false);
      return;
    }

    // Check if account already exists
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErrorMsg('An account with this email address already exists. Please log in.');
      setShowModal(false);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Pre-create initial profile row to prevent foreign key errors
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: cleanEmail,
        role: role,
        updated_at: new Date().toISOString(),
      });

      // 3. STEP 1 COMPLETE: Direct user to Profile Setup first
      setShowModal(false);
      router.push('/profile');
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-2">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-md">
            <Utensils className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
          Create Your BiteShare Account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-500">
            Log in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleOpenModal}>
            {/* Account Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                I want to register as a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('RECIPIENT')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-2 ${
                    role === 'RECIPIENT'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className="w-5 h-5 text-emerald-600" />
                  <span>Recipient / Shelter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('DONOR')}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-2 ${
                    role === 'DONOR'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Utensils className="w-5 h-5 text-emerald-600" />
                  <span>Food Donor / Business</span>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Authentic Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition focus:outline-none p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Password Requirements Checklist */}
              {password.length > 0 && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                    Password Security Requirements:
                  </div>

                  <div className={`flex items-center gap-2 ${passwordCriteria.minLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordCriteria.minLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    <span>At least 8 characters long</span>
                  </div>

                  <div className={`flex items-center gap-2 ${passwordCriteria.hasUppercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordCriteria.hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    <span>At least one uppercase letter (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-2 ${passwordCriteria.hasLowercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordCriteria.hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    <span>At least one lowercase letter (a-z)</span>
                  </div>

                  <div className={`flex items-center gap-2 ${passwordCriteria.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordCriteria.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    <span>At least one number (0-9)</span>
                  </div>

                  <div className={`flex items-center gap-2 ${passwordCriteria.hasSpecialChar ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {passwordCriteria.hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                    <span>At least one special character (!@#$%^&*)</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={password.length > 0 && !isPasswordStrong}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <span>Continue to Guidelines</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* IMPORTANT POINTS & GUIDELINES POPUP MODAL                                 */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="overflow-y-auto pr-1 space-y-5">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl text-white ${role === 'DONOR' ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                    {role === 'DONOR' ? <ShieldAlert className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {role === 'DONOR' ? 'Food Donor Guidelines & Safety Standards' : 'Recipient Food Safety Guidelines'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Please read and acknowledge before completing signup
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Guidelines Content */}
              {role === 'DONOR' ? (
                /* DONOR GUIDELINES */
                <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900 font-medium">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">Legal Responsibility Warning:</strong> As a food donor, you are legally accountable for the quality and safety of food items listed on BiteShare.
                    </span>
                  </div>

                  <ul className="space-y-2.5 pl-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold text-slate-900">Fresh & Edible Ingredients Only:</strong> Food must be freshly prepared or safely stored. Spoiled, expired, or contaminated items are strictly prohibited.
                      </span>
                    </li>

                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold text-slate-900">Hygiene & Sanitary Packaging:</strong> Food must be prepared and packaged in clean, food-grade containers following proper hygiene protocols.
                      </span>
                    </li>

                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold text-slate-900">Accurate Preparation Timestamps:</strong> You must accurately report preparation time and expected shelf life when publishing food bundles.
                      </span>
                    </li>

                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold text-slate-900">Zero Tolerance for Negligence:</strong> Providing unfit or unsafe food will result in immediate account termination and potential legal action under food safety regulations.
                      </span>
                    </li>
                  </ul>
                </div>
              ) : (
                /* RECIPIENT GUIDELINES */
                <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">Safe Handling Notice:</strong> To ensure community well-being, recipients are required to inspect and handle claimed food responsibly.
                    </span>
                  </div>

                  <ul className="space-y-2.5 pl-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold text-slate-900">Inspect Food Upon Pickup:</strong> Always check packaging integrity, smell, and visual appearance before accepting food items from the donor.
                      </span>
                    </li>

                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold text-slate-900">Proper Storage & Refrigeration:</strong> Perishable items must be refrigerated or stored at safe temperatures immediately after pickup.
                      </span>
                    </li>

                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold text-slate-900">Timely Consumption:</strong> Consume or distribute claimed meals within the recommended timeframe specified by the donor.
                      </span>
                    </li>

                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-bold text-slate-900">Respectful Coordination:</strong> Arrive on time for agreed pickup slots and maintain professional communication with local businesses and donors.
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer with Required Checkbox & Action Button */}
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  I have read, understood, and agree to strictly comply with all the food safety guidelines listed above.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!agreedToTerms || loading}
                  onClick={handleFinalSignUp}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  <span>{loading ? 'Registering Account...' : 'I Agree & Setup Profile'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}