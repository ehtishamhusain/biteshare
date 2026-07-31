'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // 1. Check if session was already established or parsed from URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth Callback Error:', error.message);
          setErrorMsg(error.message);
          return;
        }

        if (session) {
          // Session exists! Instantly redirect to profile
          router.replace('/profile');
          return;
        }

        // 2. Listen for auth changes (PKCE code exchange / Hash token parsing)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          if (currentSession || event === 'SIGNED_IN') {
            router.replace('/profile');
          }
        });

        // 3. Fallback check after 3 seconds
        const timer = setTimeout(async () => {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            router.replace('/profile');
          } else {
            setErrorMsg('Verification link expired or already confirmed. Please log in.');
          }
        }, 3000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err: any) {
        setErrorMsg(err?.message || 'An error occurred during verification.');
      }
    };

    processAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
        {errorMsg ? (
          <>
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Verification Notice</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{errorMsg}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md mt-2"
            >
              Go to Login Page
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <RefreshCw className="w-7 h-7 animate-spin text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Verifying Email...</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Confirming your BiteShare account and activating your session. Redirecting in a moment!
            </p>
          </>
        )}
      </div>
    </div>
  );
}