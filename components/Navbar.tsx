'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Utensils, LogOut, Menu, X, User, BarChart2, Star } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'DONOR' | 'RECIPIENT' | null>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchRoleAndProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name, organization_name')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        setRole(data.role || null);
        setProfileName(data.full_name || data.organization_name || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Initial session check
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchRoleAndProfile(session.user.id);
      } else {
        setUser(null);
        setRole(null);
        setProfileName('');
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchRoleAndProfile(session.user.id);
      } else {
        setUser(null);
        setRole(null);
        setProfileName('');
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setProfileName('');
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
      isActive(path)
        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
        : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-sm">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight">BiteShare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link href="/" className={linkClass('/')}>
              Home
            </Link>
            <Link href="/feed" className={linkClass('/feed')}>
              Explore Feed
            </Link>
            <Link href="/reviews" className={linkClass('/reviews')}>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              Reviews
            </Link>

            {role === 'DONOR' && (
              <>
                <Link href="/donor/dashboard" className={linkClass('/donor/dashboard')}>
                  Publish Bundle
                </Link>
                <Link href="/donor/manage" className={linkClass('/donor/manage')}>
                  Manage Pickups
                </Link>
                <Link href="/donor/analytics" className={linkClass('/donor/analytics')}>
                  <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                  Analytics
                </Link>
              </>
            )}

            {role === 'RECIPIENT' && (
              <Link href="/my-claims" className={linkClass('/my-claims')}>
                My Claims
              </Link>
            )}

            <Link href="/about" className={linkClass('/about')}>
              About Us
            </Link>
            <Link href="/contact" className={linkClass('/contact')}>
              Contact
            </Link>
          </div>

          {/* User Profile / Auth Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                    isActive('/profile')
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                    {profileName ? profileName[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="max-w-[120px] truncate">{profileName || 'My Profile'}</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="text-xs font-bold text-slate-500 hover:text-red-600 p-2 rounded-xl transition hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-emerald-600 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <Link
            href="/feed"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/feed') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Explore Feed
          </Link>
          <Link
            href="/reviews"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/reviews') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Reviews
          </Link>

          {role === 'DONOR' && (
            <>
              <Link
                href="/donor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                  isActive('/donor/dashboard') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Publish Bundle
              </Link>
              <Link
                href="/donor/manage"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                  isActive('/donor/manage') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Manage Pickups
              </Link>
              <Link
                href="/donor/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                  isActive('/donor/analytics') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Analytics
              </Link>
            </>
          )}

          {role === 'RECIPIENT' && (
            <Link
              href="/my-claims"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                isActive('/my-claims') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              My Claims
            </Link>
          )}

          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/about') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            About Us
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/contact') ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Contact
          </Link>

          {user ? (
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between px-3">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-emerald-700 flex items-center gap-2"
              >
                <User className="w-4 h-4" /> {profileName || 'My Profile'}
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 mt-2 border-t border-slate-100 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 text-xs font-bold border rounded-xl text-slate-700"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}