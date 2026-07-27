'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Utensils,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  BarChart2,
  ListCheck,
  PlusCircle,
  HeartHandshake,
  Star,
  Info,
  Home as HomeIcon,
  Mail,
  AlertTriangle,
  IndianRupee,
  ChevronDown,
  Store,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'DONOR' | 'RECIPIENT' | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🔽 "More" Dropdown State & Ref (ONLY FOR DONORS)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔐 Logout Confirmation Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    checkUser();

    // ⚡ Listen for Auth changes in real time
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 🖱️ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkUser = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (currentUser) {
      setUser(currentUser);
      fetchProfile(currentUser.id);
    } else {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      setRole(profile.role);
    }
    setLoading(false);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setMobileMenuOpen(false);
    setShowLogoutModal(false);
    setLoggingOut(false);

    router.push('/');
    router.refresh();
  };

  const isMoreActive = ['/reviews', '/about', '/contact', '/restaurants'].some(
    (path) => pathname === path || pathname.startsWith('/restaurants/')
  );

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 font-black text-xl text-slate-900 group">
              <div className="bg-emerald-600 text-white p-2 rounded-xl group-hover:scale-105 transition shadow-md shadow-emerald-600/20">
                <Utensils className="w-5 h-5" />
              </div>
              <span>
                Bite<span className="text-emerald-600">Share</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 sm:gap-1.5">
              {/* 🏠 Home Link */}
              <Link
                href="/"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  pathname === '/'
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <HomeIcon className="w-4 h-4 text-emerald-600" />
                <span>Home</span>
              </Link>

              {/* 🟢 DONOR SPECIFIC LINKS (With "More" Dropdown) */}
              {user && role === 'DONOR' ? (
                <>
                  <Link
                    href="/donor/dashboard"
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathname === '/donor/dashboard'
                        ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>Publish Bundle</span>
                  </Link>

                  <Link
                    href="/donor/manage"
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathname === '/donor/manage'
                        ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ListCheck className="w-4 h-4 text-emerald-600" />
                    <span>Manage Pickups</span>
                  </Link>

                  <Link
                    href="/donor/earnings"
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathname === '/donor/earnings'
                        ? 'bg-amber-500 text-white font-extrabold shadow-sm'
                        : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <IndianRupee className="w-4 h-4 text-amber-600" />
                    <span>Earnings</span>
                  </Link>

                  <Link
                    href="/donor/analytics"
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathname === '/donor/analytics'
                        ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4 text-emerald-600" />
                    <span>Analytics</span>
                  </Link>

                  {/* 🔽 "MORE" DROPDOWN MENU ONLY FOR DONORS */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        isMoreActive
                          ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>More</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          moreDropdownOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {moreDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 space-y-0.5"
                        >
                          <Link
                            href="/restaurants"
                            onClick={() => setMoreDropdownOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition ${
                              pathname === '/restaurants' || pathname.startsWith('/restaurants/')
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Store className="w-4 h-4 text-emerald-600" />
                            <span>Explore Restaurants</span>
                          </Link>

                          <Link
                            href="/reviews"
                            onClick={() => setMoreDropdownOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition ${
                              pathname === '/reviews'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Star className="w-4 h-4 text-amber-500" />
                            <span>Reviews</span>
                          </Link>

                          <Link
                            href="/about"
                            onClick={() => setMoreDropdownOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition ${
                              pathname === '/about'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Info className="w-4 h-4 text-emerald-600" />
                            <span>About Us</span>
                          </Link>

                          <Link
                            href="/contact"
                            onClick={() => setMoreDropdownOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition ${
                              pathname === '/contact'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Mail className="w-4 h-4 text-teal-600" />
                            <span>Contact Us</span>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                /* 🔵 RECIPIENT & GUEST LINKS (Direct Links, No "More" Dropdown) */
                <>
                  <Link
                    href="/feed"
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathname === '/feed'
                        ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Explore Feed</span>
                  </Link>

                  {/* 🏬 NEW: EXPLORE RESTAURANTS LINK FOR GUESTS & RECIPIENTS */}
                  <Link
                    href="/restaurants"
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathname === '/restaurants' || pathname.startsWith('/restaurants/')
                        ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span>Explore Restaurants</span>
                  </Link>

                  {user && role === 'RECIPIENT' && (
                    <Link
                      href="/my-claims"
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        pathname === '/my-claims'
                          ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <HeartHandshake className="w-4 h-4 text-emerald-600" />
                      <span>My Claims</span>
                    </Link>
                  )}

                  {/* Public Links Direct in Navbar for Guests & Recipients */}
                  <Link
                    href="/reviews"
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathname === '/reviews'
                        ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Star className="w-4 h-4 text-emerald-600" />
                    <span>Reviews</span>
                  </Link>

                  <Link
                    href="/about"
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathname === '/about'
                        ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span>About Us</span>
                  </Link>

                  <Link
                    href="/contact"
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathname === '/contact'
                        ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Contact Us</span>
                  </Link>
                </>
              )}

              {/* Auth Actions */}
              <div className="pl-2 flex items-center gap-2 border-l border-slate-200 ml-1">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        pathname === '/profile'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </Link>

                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              🏠 Home
            </Link>

            {user && role === 'DONOR' && (
              <>
                <Link
                  href="/donor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  📤 Publish Bundle
                </Link>
                <Link
                  href="/donor/manage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  🛍️ Manage Pickups
                </Link>
                <Link
                  href="/donor/earnings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-xs font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                >
                  💰 Revenue & Earnings
                </Link>
                <Link
                  href="/donor/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  📊 Impact Analytics
                </Link>
              </>
            )}

            {(!user || role === 'RECIPIENT') && (
              <>
                <Link
                  href="/feed"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  🥗 Explore Feed
                </Link>

                <Link
                  href="/restaurants"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  🏬 Explore Restaurants
                </Link>
              </>
            )}

            {user && role === 'RECIPIENT' && (
              <Link
                href="/my-claims"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                🎟️ My Claims
              </Link>
            )}

            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                ⭐ Reviews
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                ℹ️ About Us
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                📩 Contact Us
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 bg-slate-100 text-slate-800 font-bold rounded-xl text-xs"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 bg-slate-100 text-slate-800 font-bold rounded-xl text-xs"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 🔴 LOGOUT CONFIRMATION POPUP MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-5 z-10"
            >
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900">Sign Out of BiteShare?</h3>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Are you sure you want to log out of your account? You will need to log back in to manage or claim food.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  disabled={loggingOut}
                  className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{loggingOut ? 'Signing Out...' : 'Yes, Log Out'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}