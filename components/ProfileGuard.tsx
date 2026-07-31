'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface ProfileGuardProps {
  children: React.ReactNode;
}

export default function ProfileGuard({ children }: ProfileGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isIncomplete, setIsIncomplete] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [checking, setChecking] = useState(true);

  // Pages that don't require an active profile
  const publicRoutes = ['/', '/login', '/signup', '/auth/callback', '/api'];

  useEffect(() => {
    checkProfileCompletion();

    // 💡 Listen for instant Profile Update signal across the app
    const handleProfileUpdate = () => {
      checkProfileCompletion();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [pathname]);

  const checkProfileCompletion = async () => {
    // Skip check on public static pages
    if (publicRoutes.some((route) => pathname === route || pathname.startsWith('/api'))) {
      setChecking(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is not logged in, let standard login guards handle it
    if (!user) {
      setIsIncomplete(false);
      setShowPopup(false);
      setChecking(false);
      return;
    }

    // Check if user has a completed profile row in Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('id', user.id)
      .maybeSingle();

    // Profile is incomplete if no profile row exists or required fields are blank
    const incomplete = !profile || !profile.full_name || !profile.phone;
    setIsIncomplete(incomplete);

    if (!incomplete) {
      setShowPopup(false);
    }

    // If user is trying to navigate to a protected page while profile is incomplete
    if (incomplete && pathname !== '/profile') {
      setShowPopup(true);
      router.replace('/profile');
    }

    setChecking(false);
  };

  return (
    <>
      {children}

      {/* POPUP MODAL: Profile Required */}
      {showPopup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">
                Profile Setup Required 🔒
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                You must complete your profile details and click <strong className="text-slate-800">"Save Profile Changes"</strong> before accessing other pages on BiteShare.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowPopup(false);
                  router.push('/profile');
                }}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Complete Profile Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}