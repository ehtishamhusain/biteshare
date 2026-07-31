'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();

  // List of auth pages where the main app Navbar should be hidden
  const authRoutes = ['/login', '/signup', '/forgot-password', '/update-password', '/auth/callback'];

  if (authRoutes.includes(pathname)) {
    return null; // Hide the Navbar entirely during authentication flows
  }

  return <Navbar />;
}