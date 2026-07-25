'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Utensils, Heart, ArrowRight, AlertCircle, Mail, Eye, EyeOff, Check, X } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'DONOR' | 'RECIPIENT'>('RECIPIENT');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // 1. Strict email validation regex
  const isValidEmail = (emailStr: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailStr.trim());
  };

  // 2. Password Strength Requirements Checkers
  const passwordCriteria = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanEmail = email.trim();

    // Validate Email
    if (!isValidEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid, correctly formatted email address (e.g., name@gmail.com).');
      setLoading(false);
      return;
    }

    // Validate Password Strength
    if (!isPasswordStrong) {
      setErrorMsg('Please enter a strong password that fulfills all security requirements below.');
      setLoading(false);
      return;
    }

    // Submit to Supabase Auth
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
      setLoading(false);
      return;
    }

    if (data.user) {
      setEmailSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {emailSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verify Your Email Address</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We sent a confirmation link to <span className="font-bold text-slate-800">{email}</span>. Please check your inbox and click the link to activate your BiteShare account.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  <span>Proceed to Log In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSignUp}>
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

                {/* Password Input with Show/Hide Toggle */}
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

                  {/* Real-time Password Strength Requirements Checklist */}
                  {password.length > 0 && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                        Password Requirements:
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
                  disabled={loading || (password.length > 0 && !isPasswordStrong)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <span>{loading ? 'Validating...' : 'Send Verification Email'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}