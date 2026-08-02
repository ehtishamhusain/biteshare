'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  ShieldAlert,
  Download,
  Search,
  Filter,
  RefreshCw,
  IndianRupee,
  TrendingUp,
  Building,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  KeyRound,
  ShoppingBag,
  ArrowLeft,
  PieChart,
  FileSpreadsheet,
  Mail,
  Receipt,
  Store,
  Send,
  Copy,
  Check,
  X,
  ExternalLink,
  CheckCircle,
  CreditCard,
  Calculator,
  Wallet,
  AlertCircle,
} from 'lucide-react';

export default function AdminFinancePage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'RESTAURANTS'>('RESTAURANTS');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'EXPIRED'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Email Modal States
  const [selectedStoreForEmail, setSelectedStoreForEmail] = useState<any | null>(null);
  const [copiedType, setCopiedType] = useState<'INVOICE' | 'EMAIL' | null>(null);

  // Partial Payment Settlement States (FIFO Modal)
  const [paymentModalStore, setPaymentModalStore] = useState<any | null>(null);
  const [paymentInputAmount, setPaymentInputAmount] = useState<string>('');
  const [settlingStoreId, setSettlingStoreId] = useState<string | null>(null);
  const [settlementSuccessMsg, setSettlementSuccessMsg] = useState<string | null>(null);

  // Verify Admin Security & Load All Claims
  const checkAdminAndFetchData = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // 1. Verify User Profile Role in Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'ADMIN') {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    // 2. Fetch All Claims from Supabase
    const { data: rawClaims, error: claimsErr } = await supabase
      .from('claims')
      .select('*')
      .order('created_at', { ascending: false });

    if (claimsErr || !rawClaims) {
      setClaims([]);
      setLoading(false);
      return;
    }

    // 3. Fetch all associated food bundles
    const bundleIds = Array.from(new Set(rawClaims.map((c) => c.bundle_id).filter(Boolean)));
    let bundleMap = new Map();

    if (bundleIds.length > 0) {
      const { data: bundlesData } = await supabase
        .from('food_bundles')
        .select('*')
        .in('id', bundleIds);

      if (bundlesData) {
        bundlesData.forEach((b) => bundleMap.set(b.id, b));
      }
    }

    // 4. Fetch all associated profiles (Recipients and Donors)
    const recipientIds = rawClaims.map((c) => c.recipient_id).filter(Boolean);
    const donorIds = Array.from(
      new Set(Array.from(bundleMap.values()).map((b) => b.donor_id).filter(Boolean))
    );
    const allProfileIds = Array.from(new Set([...recipientIds, ...donorIds]));

    let profileMap = new Map();
    if (allProfileIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, organization_name, phone, email, role')
        .in('id', allProfileIds);

      if (profilesData) {
        profilesData.forEach((p) => profileMap.set(p.id, p));
      }
    }

    // 5. Combine and resolve full entity details
    const processedClaims = rawClaims.map((claim) => {
      const bundle = bundleMap.get(claim.bundle_id) || {};
      const recipient = profileMap.get(claim.recipient_id) || {};
      const donorProfile = profileMap.get(bundle.donor_id) || {};

      const restaurantName =
        bundle.restaurant_name ||
        donorProfile.organization_name ||
        donorProfile.full_name ||
        'Partner Restaurant';

      const donorOwnerName = donorProfile.full_name || donorProfile.organization_name || 'Verified Owner';
      const donorEmail = donorProfile.email || 'N/A';
      const donorPhone = donorProfile.phone || 'N/A';
      const donorId = bundle.donor_id || donorProfile.id || 'partner-store';

      const recipientName =
        claim.recipient_name ||
        recipient.full_name ||
        recipient.organization_name ||
        'Community Recipient';

      const isCancelledOrExpired = claim.status === 'CANCELLED' || claim.status === 'EXPIRED';

      return {
        ...claim,
        bundle,
        recipient,
        donorProfile,
        donorId,
        restaurantName,
        donorOwnerName,
        donorEmail,
        donorPhone,
        recipientName,
        recipientPhone: recipient.phone || 'N/A',
        recipientEmail: recipient.email || 'N/A',
        isFeePaid: Boolean(claim.is_fee_paid),
        totalPrice: isCancelledOrExpired ? 0 : Number(claim.total_price || 0),
        platformFee: isCancelledOrExpired ? 0 : Number(claim.platform_fee || 0),
        donorPayout: isCancelledOrExpired ? 0 : Number(claim.donor_payout || 0),
      };
    });

    setClaims(processedClaims);
    setLoading(false);
  };

  useEffect(() => {
    checkAdminAndFetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin_finance_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => checkAdminAndFetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_bundles' }, () => checkAdminAndFetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtered Transaction Claims
  const filteredClaims = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return claims.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) {
        return false;
      }

      const claimTime = new Date(c.created_at).getTime();
      if (dateFilter === 'TODAY' && claimTime < todayStart) return false;
      if (dateFilter === 'WEEK' && claimTime < weekStart) return false;
      if (dateFilter === 'MONTH' && claimTime < monthStart) return false;

      const q = searchQuery.trim().toLowerCase();
      if (q === '') return true;

      const title = (c.bundle?.title || '').toLowerCase();
      const resName = (c.restaurantName || '').toLowerCase();
      const ownerName = (c.donorOwnerName || '').toLowerCase();
      const recName = (c.recipientName || '').toLowerCase();
      const recPhone = (c.recipientPhone || '').toLowerCase();
      const pin = (c.pickup_pin || '').toLowerCase();
      const claimId = (c.id || '').toLowerCase();

      return (
        title.includes(q) ||
        resName.includes(q) ||
        ownerName.includes(q) ||
        recName.includes(q) ||
        recPhone.includes(q) ||
        pin.includes(q) ||
        claimId.includes(q)
      );
    });
  }, [claims, searchQuery, statusFilter, dateFilter]);

  // Grouped Restaurant Earnings & Platform Fee Summary
  const restaurantLedger = useMemo(() => {
    const map = new Map<string, any>();

    filteredClaims.forEach((c) => {
      const key = c.donorId || c.restaurantName;

      if (!map.has(key)) {
        map.set(key, {
          donorId: c.donorId,
          restaurantName: c.restaurantName,
          ownerName: c.donorOwnerName,
          email: c.donorEmail,
          phone: c.donorPhone,
          totalOrders: 0,
          completedOrders: 0,
          grossGMV: 0,
          donorEarnings: 0,
          totalPlatformFee: 0,    // Total 12% Fee Earned
          platformFeeDue: 0,      // Rolling Unpaid Balance
          settledFeeTotal: 0,     // Total Settled/Paid Fee
          unpaidClaimIds: [] as string[],
        });
      }

      const store = map.get(key);
      store.totalOrders += 1;

      if (c.status === 'COMPLETED' || c.status === 'PENDING') {
        store.grossGMV += c.totalPrice;
        store.donorEarnings += c.donorPayout;
        store.totalPlatformFee += c.platformFee;

        if (!c.isFeePaid) {
          store.platformFeeDue += c.platformFee;
          store.unpaidClaimIds.push(c.id);
        } else {
          store.settledFeeTotal += c.platformFee;
        }
      }

      if (c.status === 'COMPLETED') {
        store.completedOrders += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.platformFeeDue - a.platformFeeDue);
  }, [filteredClaims]);

  // Total Outstanding Rolling Balance Across All Stores
  const totalGlobalRollingDue = useMemo(() => {
    return restaurantLedger.reduce((acc, store) => acc + store.platformFeeDue, 0);
  }, [restaurantLedger]);

  const totalGlobalSettledFees = useMemo(() => {
    return restaurantLedger.reduce((acc, store) => acc + store.settledFeeTotal, 0);
  }, [restaurantLedger]);

  // Open Payment Modal
  const handleOpenPaymentModal = (store: any) => {
    setPaymentModalStore(store);
    setPaymentInputAmount(store.platformFeeDue.toFixed(2));
  };

  // FIFO (First-In, First-Out) Partial Payment Settlement Engine
  const handleSettleDonorFeesFIFO = async (donorId: string, amountToPay: number) => {
    if (amountToPay <= 0) {
      alert('Please enter a valid payment amount greater than 0.');
      return;
    }

    setSettlingStoreId(donorId);
    setSettlementSuccessMsg(null);

    try {
      // 1. Query food bundle IDs published by this donor
      const { data: donorBundles } = await supabase
        .from('food_bundles')
        .select('id')
        .eq('donor_id', donorId);

      const bundleIds = donorBundles ? donorBundles.map((b) => b.id) : [];

      if (!bundleIds || bundleIds.length === 0) {
        alert('No food bundles found for this store.');
        setSettlingStoreId(null);
        return;
      }

      // 2. Query unpaid claims ordered by created_at ASC (Oldest Claims First -> FIFO)
      const { data: unpaidClaims, error: fetchErr } = await supabase
        .from('claims')
        .select('id, total_price, platform_fee, created_at')
        .eq('is_fee_paid', false)
        .in('bundle_id', bundleIds)
        .in('status', ['COMPLETED', 'PENDING'])
        .order('created_at', { ascending: true });

      if (fetchErr) throw fetchErr;

      if (!unpaidClaims || unpaidClaims.length === 0) {
        alert('No unpaid claims found for this store.');
        setSettlingStoreId(null);
        return;
      }

      let remainingToSettle = amountToPay;
      const claimsToMarkPaid: string[] = [];

      // 3. FIFO Loop: Mark oldest claims paid until payment amount is exhausted
      for (const claim of unpaidClaims) {
        if (remainingToSettle <= 0) break;

        const fee = claim.platform_fee !== null && claim.platform_fee !== undefined
          ? Number(claim.platform_fee)
          : Number(claim.total_price || 0) * 0.12;

        if (remainingToSettle >= fee - 0.01) {
          claimsToMarkPaid.push(claim.id);
          remainingToSettle -= fee;
        } else {
          // Break if remaining payment cannot cover the next full claim fee
          break;
        }
      }

      if (claimsToMarkPaid.length === 0) {
        alert(`Entered amount (₹${amountToPay}) is lower than the smallest unpaid claim fee. Please enter a higher amount.`);
        setSettlingStoreId(null);
        return;
      }

      // 4. Batch update database
      const { error: updateErr } = await supabase
        .from('claims')
        .update({ is_fee_paid: true })
        .in('id', claimsToMarkPaid);

      if (updateErr) throw updateErr;

      setSettlementSuccessMsg(
        `🎉 Successfully settled ₹${amountToPay.toFixed(2)} across ${claimsToMarkPaid.length} order(s) for ${paymentModalStore?.restaurantName}!`
      );
      setTimeout(() => setSettlementSuccessMsg(null), 5000);

      setPaymentModalStore(null);
      checkAdminAndFetchData();
    } catch (err: any) {
      console.error('Failed to settle fee payment:', err);
      alert('Failed to settle fee payment: ' + err.message);
    } finally {
      setSettlingStoreId(null);
    }
  };

  // Financial Metrics Calculations
  const metrics = useMemo(() => {
    let grossGMV = 0;
    let totalPlatformFees = 0;
    let totalDonorPayouts = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;
    let expiredCount = 0;

    filteredClaims.forEach((c) => {
      if (c.status === 'COMPLETED' || c.status === 'PENDING') {
        grossGMV += c.totalPrice;
        totalPlatformFees += c.platformFee;
        totalDonorPayouts += c.donorPayout;
      }

      if (c.status === 'COMPLETED') completedCount++;
      if (c.status === 'PENDING') pendingCount++;
      if (c.status === 'CANCELLED') cancelledCount++;
      if (c.status === 'EXPIRED') expiredCount++;
    });

    const totalClaims = filteredClaims.length;
    const conversionRate = totalClaims > 0 ? Math.round((completedCount / totalClaims) * 100) : 0;

    return {
      grossGMV,
      totalPlatformFees,
      totalDonorPayouts,
      completedCount,
      pendingCount,
      cancelledCount,
      expiredCount,
      totalClaims,
      conversionRate,
    };
  }, [filteredClaims]);

  // Universal CSV Cell Escaper
  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredClaims.length === 0) return;

    const headers = [
      'Order ID',
      'Created Date',
      'Created Time',
      'Food Bundle Title',
      'Restaurant Name',
      'Donor Owner Name',
      'Recipient Name',
      'Recipient Phone',
      'Claimed Quantity',
      'Claim Status',
      'Fee Paid Status',
      'Gross Total (INR)',
      'BiteShare Fee 12% (INR)',
      'Donor Payout 88% (INR)',
      'Counter Pickup PIN',
    ];

    const csvRows = filteredClaims.map((c) => {
      const claimDate = new Date(c.created_at);
      const dateStr = claimDate.toISOString().slice(0, 10);
      const timeStr = claimDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

      return [
        c.id,
        dateStr,
        timeStr,
        c.bundle?.title || 'Food Item',
        c.restaurantName || 'Restaurant',
        c.donorOwnerName || 'N/A',
        c.recipientName || 'Recipient',
        c.recipientPhone || 'N/A',
        c.claimed_quantity || 1,
        c.status || 'PENDING',
        c.isFeePaid ? 'PAID' : 'UNPAID',
        c.totalPrice.toFixed(2),
        c.platformFee.toFixed(2),
        c.donorPayout.toFixed(2),
        c.pickup_pin || 'N/A',
      ].map(escapeCSV);
    });

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCSV).join(','), ...csvRows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `biteshare_financial_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generates Full Itemized Invoice Text for Clipboard Copy
  const generateFullInvoiceText = (store: any) => {
    if (!store) return '';

    const feeToPay = store.platformFeeDue > 0 ? store.platformFeeDue : store.settledFeeTotal;

    return `Dear ${store.ownerName || 'Restaurant Owner'},

Greetings from BiteShare Technologies!

Below is your official surplus food sales summary and platform fee billing statement for ${store.restaurantName}:

--------------------------------------------------
📊 REVENUE & FEE STATEMENT
--------------------------------------------------
• Restaurant: ${store.restaurantName}
• Total Orders Processed: ${store.totalOrders} order(s)
• Gross Sales Volume (GMV): ₹${store.grossGMV.toFixed(2)}
• Your Net Store Earnings (88%): ₹${store.donorEarnings.toFixed(2)}
• BiteShare Platform Fee (12%): ₹${feeToPay.toFixed(2)} (${store.platformFeeDue === 0 ? 'PAID ✓' : 'DUE UNPAID ROLLING BALANCE'})
--------------------------------------------------

💳 PAYMENT INSTRUCTIONS:
Please remit the platform fee amount of ₹${feeToPay.toFixed(2)} using any of the following details:

1. UPI Payment:
   UPI ID: biteshare@upi

2. Bank Transfer:
   Account Name: BiteShare Technologies Pvt Ltd
   Account Number: 987654321012
   IFSC Code: HDFC0001234
   Bank: HDFC Bank, Bareilly Branch

After completing the payment, please reply with the payment screenshot or Transaction Ref ID for instant account reconciliation.

Thank you for partnering with BiteShare to eliminate food waste!

Best regards,
BiteShare Platform Finance Team
support@biteshare.in | https://biteshare.in`;
  };

  const getGmailWebComposeUrl = (store: any) => {
    if (!store) return '#';
    const emailTarget = store.email && store.email !== 'N/A' ? store.email : '';
    const subject = encodeURIComponent(`BiteShare Platform Fee Statement - ${store.restaurantName}`);
    const body = encodeURIComponent(generateFullInvoiceText(store));

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailTarget)}&su=${subject}&body=${body}`;
  };

  const handleCopyText = (text: string, type: 'INVOICE' | 'EMAIL') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-slate-500 text-sm font-semibold">Loading Admin Financial Audit Logs...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900">Access Restricted</h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              This financial ledger is restricted to BiteShare Platform Administrators.
            </p>
          </div>
          <Link
            href="/feed"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Marketplace Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full border border-emerald-200 mb-1">
              <PieChart className="w-3.5 h-3.5 text-emerald-600" /> Admin Financial Control & Audit
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              BiteShare Financial Ledger
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Live audit of all reservations, platform commission breakdown (12%), and rolling fee settlement.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={checkAdminAndFetchData}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600" /> Refresh Data
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredClaims.length === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV Audit
            </button>
          </div>
        </div>

        {settlementSuccessMsg && (
          <div className="p-4 rounded-2xl font-bold text-xs sm:text-sm bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{settlementSuccessMsg}</span>
          </div>
        )}

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-100 text-xs font-bold uppercase tracking-wider">
              <span>BiteShare Revenue (12%)</span>
              <TrendingUp className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="text-3xl font-black tracking-tight">
              ₹{metrics.totalPlatformFees.toFixed(2)}
            </div>
            <p className="text-[11px] text-emerald-100 font-medium pt-1 border-t border-white/10">
              Net platform commission accrued
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Gross Order GMV</span>
              <IndianRupee className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              ₹{metrics.grossGMV.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
              Total transaction value processed
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Store Payouts (88%)</span>
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              ₹{metrics.totalDonorPayouts.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
              Allocated to partner restaurants
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Fulfillment Rate</span>
              <ShoppingBag className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{metrics.completedCount}</span>
              <span className="text-xs font-bold text-slate-400">/ {metrics.totalClaims} orders</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
              {metrics.conversionRate}% completion success rate
            </p>
          </div>
        </div>

        {/* VIEW SWITCHER TABS */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 w-full sm:w-auto self-start">
          <button
            onClick={() => setActiveTab('RESTAURANTS')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === 'RESTAURANTS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Restaurant Fee Ledger & Rolling Balance ({restaurantLedger.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Order Audit Log</span>
          </button>
        </div>

        {/* TAB 1: RESTAURANT EARNINGS & ROLLING BALANCE LEDGER */}
        {activeTab === 'RESTAURANTS' && (
          <div className="space-y-4">
            
            {/* 🔥 ROLLING BALANCE SUMMARY BANNER */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-100">
                  <Wallet className="w-4 h-4" /> Live Rolling Balance Tracker
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Outstanding Platform Fee Due: ₹{totalGlobalRollingDue.toFixed(2)}
                </h3>
                <p className="text-xs text-amber-100 font-medium">
                  Total unpaid 12% BiteShare commission across all partner stores. Enter partial or full payments using the FIFO settlement modal.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right shrink-0">
                <div className="text-[10px] font-bold uppercase text-amber-200">Total Settled Fees</div>
                <div className="text-xl font-black text-white">₹{totalGlobalSettledFees.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-emerald-600" /> Partner Restaurant Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time breakdown of gross sales, store payouts (88%), settled fees, and current rolling unpaid balance.
                  </p>
                </div>
              </div>

              {restaurantLedger.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Store className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800">No partner restaurants found</h3>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-4 px-6">Restaurant Store</th>
                        <th className="py-4 px-6">Owner Name</th>
                        <th className="py-4 px-6">Contact Details</th>
                        <th className="py-4 px-6 text-center">Orders</th>
                        <th className="py-4 px-6 text-right">Gross GMV</th>
                        <th className="py-4 px-6 text-right">Store Net (88%)</th>
                        <th className="py-4 px-6 text-right">Total Fee (12%)</th>
                        <th className="py-4 px-6 text-right">Rolling Due Balance</th>
                        <th className="py-4 px-6 text-center">Billing & Settlement Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {restaurantLedger.map((store) => {
                        const hasUnpaidDue = store.platformFeeDue > 0;
                        const isFullyPaid = store.platformFeeDue === 0 && store.settledFeeTotal > 0;

                        return (
                          <tr key={store.donorId || store.restaurantName} className="hover:bg-slate-50/80 transition">
                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{store.restaurantName}</span>
                              </div>
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap font-bold text-slate-800">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{store.ownerName}</span>
                              </div>
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{store.email}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{store.phone}</span>
                              </div>
                            </td>

                            <td className="py-4 px-6 text-center whitespace-nowrap font-bold text-slate-800">
                              <span className="px-2.5 py-1 bg-slate-100 rounded-xl border border-slate-200">
                                {store.totalOrders} total ({store.completedOrders} completed)
                              </span>
                            </td>

                            <td className="py-4 px-6 text-right whitespace-nowrap font-black text-slate-900">
                              ₹{store.grossGMV.toFixed(2)}
                            </td>

                            <td className="py-4 px-6 text-right whitespace-nowrap font-black text-slate-800">
                              ₹{store.donorEarnings.toFixed(2)}
                            </td>

                            {/* TOTAL FEE COLUMN */}
                            <td className="py-4 px-6 text-right whitespace-nowrap font-black text-slate-700">
                              ₹{store.totalPlatformFee.toFixed(2)}
                            </td>

                            {/* 🔥 ITEMISED ROLLING BALANCE DUE COLUMN */}
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              {hasUnpaidDue ? (
                                <div className="space-y-0.5">
                                  <div className="font-black text-amber-900 bg-amber-100/90 border border-amber-300 px-3 py-1 rounded-xl inline-block text-xs shadow-2xs">
                                    ₹{store.platformFeeDue.toFixed(2)}
                                  </div>
                                  <div className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                                    ROLLING UNPAID DUE
                                  </div>
                                  {store.settledFeeTotal > 0 && (
                                    <div className="text-[10px] text-emerald-700 font-bold">
                                      (₹{store.settledFeeTotal.toFixed(2)} Settled)
                                    </div>
                                  )}
                                </div>
                              ) : isFullyPaid ? (
                                <div className="space-y-0.5">
                                  <div className="font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl inline-block text-xs">
                                    ₹{store.settledFeeTotal.toFixed(2)}
                                  </div>
                                  <div className="text-[10px] font-black text-emerald-700 uppercase tracking-wider flex items-center justify-end gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" /> ALL FEES PAID
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-bold">₹0.00</span>
                              )}
                            </td>

                            {/* Action Buttons Column */}
                            <td className="py-4 px-6 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStoreForEmail(store)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[11px] rounded-xl transition"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Invoice</span>
                                </button>

                                {hasUnpaidDue ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPaymentModal(store)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Record Payment / Settle Balance</span>
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-xl border border-emerald-300">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Fully Settled</span>
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ALL TRANSACTIONS TABLE */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search restaurant, donor owner, recipient, PIN, item..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-800 bg-slate-50/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 w-full md:w-auto overflow-x-auto">
                  <button
                    onClick={() => setDateFilter('ALL')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      dateFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setDateFilter('TODAY')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      dateFilter === 'TODAY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDateFilter('WEEK')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      dateFilter === 'WEEK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setDateFilter('MONTH')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      dateFilter === 'MONTH' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    This Month
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
                {[
                  { id: 'ALL', label: 'All Statuses', count: claims.length },
                  { id: 'COMPLETED', label: 'Completed', count: metrics.completedCount },
                  { id: 'PENDING', label: 'Pending Pickup', count: metrics.pendingCount },
                  { id: 'CANCELLED', label: 'Cancelled at Counter', count: metrics.cancelledCount },
                  { id: 'EXPIRED', label: 'Expired / Unclaimed', count: metrics.expiredCount },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition border ${
                      statusFilter === f.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              {filteredClaims.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800">No financial records found</h3>
                  <p className="text-slate-500 text-xs">
                    Try resetting your search query or selecting a different status filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-4 px-6">Date & Time</th>
                        <th className="py-4 px-6">Item & Store</th>
                        <th className="py-4 px-6">Donor Owner</th>
                        <th className="py-4 px-6">Recipient Customer</th>
                        <th className="py-4 px-6">Status & Fee Paid</th>
                        <th className="py-4 px-6 text-right">Gross Total</th>
                        <th className="py-4 px-6 text-right">12% Fee</th>
                        <th className="py-4 px-6 text-right">88% Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {filteredClaims.map((claim) => {
                        const isCompleted = claim.status === 'COMPLETED';
                        const isCancelled = claim.status === 'CANCELLED';
                        const isExpired = claim.status === 'EXPIRED';

                        return (
                          <tr key={claim.id} className="hover:bg-slate-50/80 transition duration-150">
                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="font-bold text-slate-900">
                                {new Date(claim.created_at).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {new Date(claim.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                })}
                              </div>
                            </td>

                            <td className="py-4 px-6 max-w-xs">
                              <div className="font-black text-slate-900 line-clamp-1">
                                {claim.bundle?.title || 'Surplus Food Bundle'}
                              </div>
                              <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 shrink-0" />
                                <span className="line-clamp-1">{claim.restaurantName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-semibold">
                                Qty: {claim.claimed_quantity || 1} item(s)
                              </div>
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{claim.donorOwnerName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {claim.donorPhone}
                              </div>
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{claim.recipientName}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{claim.recipientPhone}</span>
                              </div>
                            </td>

                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${
                                      isCompleted
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                        : isCancelled
                                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                                        : isExpired
                                        ? 'bg-red-100 text-red-800 border-red-200'
                                        : 'bg-amber-100 text-amber-900 border-amber-200'
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                                      </>
                                    ) : isCancelled ? (
                                      <>
                                        <Ban className="w-3 h-3 text-slate-500" /> Cancelled
                                      </>
                                    ) : isExpired ? (
                                      <>
                                        <XCircle className="w-3 h-3 text-red-600" /> Expired
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-3 h-3 text-amber-600" /> Pending Pickup
                                      </>
                                    )}
                                  </span>

                                  {/* Fee Paid Badge */}
                                  {claim.isFeePaid ? (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black border border-emerald-300">
                                      FEE PAID ✓
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[10px] font-bold border border-amber-200">
                                      UNPAID
                                    </span>
                                  )}
                                </div>

                                {claim.pickup_pin && (
                                  <div className="text-[10px] font-extrabold text-slate-600 flex items-center gap-1 font-mono">
                                    <KeyRound className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>PIN: {claim.pickup_pin}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-6 text-right whitespace-nowrap font-black text-slate-900">
                              {isCancelled || isExpired ? (
                                <span className="text-slate-400">₹0.00</span>
                              ) : (
                                `₹${claim.totalPrice.toFixed(2)}`
                              )}
                            </td>

                            <td className="py-4 px-6 text-right whitespace-nowrap font-black text-emerald-700 bg-emerald-50/40">
                              {isCancelled || isExpired ? (
                                <span className="text-slate-400">₹0.00</span>
                              ) : (
                                `₹${claim.platformFee.toFixed(2)}`
                              )}
                            </td>

                            <td className="py-4 px-6 text-right whitespace-nowrap font-black text-slate-800">
                              {isCancelled || isExpired ? (
                                <span className="text-slate-400">₹0.00</span>
                              ) : (
                                `₹${claim.donorPayout.toFixed(2)}`
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
                <div>
                  Showing <strong>{filteredClaims.length}</strong> of <strong>{claims.length}</strong> total claim records
                </div>

                <div className="flex items-center gap-4 font-bold">
                  <span>Gross GMV: ₹{metrics.grossGMV.toFixed(2)}</span>
                  <span className="text-emerald-700">Platform Revenue (12%): ₹{metrics.totalPlatformFees.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 💳 PARTIAL PAYMENT SETTLEMENT MODAL (FIFO Engine) */}
      <AnimatePresence>
        {paymentModalStore && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative my-8"
            >
              <button
                onClick={() => setPaymentModalStore(null)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full border border-emerald-200">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Record Partial or Full Payment
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {paymentModalStore.restaurantName}
                </h3>
                <p className="text-slate-500 text-xs">
                  Owner: <strong className="text-slate-800">{paymentModalStore.ownerName}</strong>
                </p>
              </div>

              {/* Total Unpaid Rolling Balance Display */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-amber-900 font-bold">
                  <span>Current Unpaid Rolling Due:</span>
                  <span className="text-lg font-black text-amber-900">₹{paymentModalStore.platformFeeDue.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                  Enter the payment amount received from the store. The system will mark the oldest orders paid first (First-In, First-Out) and carry forward any remaining balance.
                </p>
              </div>

              {/* Custom Payment Amount Input Field */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Payment Received (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={paymentModalStore.platformFeeDue}
                    value={paymentInputAmount}
                    onChange={(e) => setPaymentInputAmount(e.target.value)}
                    placeholder="Enter paid amount (e.g. 100)"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-base font-black text-slate-900 bg-slate-50"
                  />
                </div>

                {/* Quick Select Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setPaymentInputAmount(paymentModalStore.platformFeeDue.toFixed(2))}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] rounded-lg border border-slate-200 transition"
                  >
                    Full Amount (₹{paymentModalStore.platformFeeDue.toFixed(2)})
                  </button>
                  {paymentModalStore.platformFeeDue > 100 && (
                    <button
                      type="button"
                      onClick={() => setPaymentInputAmount('100')}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] rounded-lg border border-slate-200 transition"
                    >
                      ₹100
                    </button>
                  )}
                  {paymentModalStore.platformFeeDue > 50 && (
                    <button
                      type="button"
                      onClick={() => setPaymentInputAmount('50')}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] rounded-lg border border-slate-200 transition"
                    >
                      ₹50
                    </button>
                  )}
                </div>
              </div>

              {/* Calculation Preview */}
              {Number(paymentInputAmount) > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Amount Being Paid:</span>
                    <span className="font-bold text-emerald-700">₹{Number(paymentInputAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1">
                    <span>New Remaining Rolling Balance:</span>
                    <span className="font-black text-amber-800">
                      ₹{Math.max(0, paymentModalStore.platformFeeDue - Number(paymentInputAmount)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalStore(null)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSettleDonorFeesFIFO(
                      paymentModalStore.donorId,
                      Number(paymentInputAmount)
                    )
                  }
                  disabled={
                    settlingStoreId === paymentModalStore.donorId ||
                    !paymentInputAmount ||
                    Number(paymentInputAmount) <= 0
                  }
                  className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {settlingStoreId === paymentModalStore.donorId ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Settling FIFO...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Settle Payment</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📧 FEE PAYMENT REQUEST & BILLING INVOICE MODAL */}
      <AnimatePresence>
        {selectedStoreForEmail && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative my-8"
            >
              <button
                onClick={() => setSelectedStoreForEmail(null)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full border border-emerald-200">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Platform Fee Billing Invoice
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {selectedStoreForEmail.restaurantName}
                </h3>
                <p className="text-slate-500 text-xs">
                  Owner: <strong className="text-slate-800">{selectedStoreForEmail.ownerName}</strong> ({selectedStoreForEmail.email})
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Total Orders Processed:</span>
                  <span className="font-bold text-slate-900">{selectedStoreForEmail.totalOrders} order(s)</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Gross Sales Volume (GMV):</span>
                  <span className="font-bold text-slate-900">₹{selectedStoreForEmail.grossGMV.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Net Store Earnings (88%):</span>
                  <span className="font-bold text-slate-900">₹{selectedStoreForEmail.donorEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-extrabold text-sm pt-2 border-t border-slate-200">
                  <span>Current Rolling Due Fee (12%):</span>
                  <span className="text-base text-emerald-700 font-black">
                    ₹{(selectedStoreForEmail.platformFeeDue > 0 ? selectedStoreForEmail.platformFeeDue : selectedStoreForEmail.settledFeeTotal).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Invoice & Payment Request Message
                </label>
                <textarea
                  readOnly
                  rows={7}
                  value={generateFullInvoiceText(selectedStoreForEmail)}
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 bg-slate-50 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={getGmailWebComposeUrl(selectedStoreForEmail)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Web Gmail</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(generateFullInvoiceText(selectedStoreForEmail), 'INVOICE')
                    }
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {copiedType === 'INVOICE' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Invoice Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>Copy Invoice Text</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {selectedStoreForEmail.platformFeeDue > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const store = selectedStoreForEmail;
                        setSelectedStoreForEmail(null);
                        handleOpenPaymentModal(store);
                      }}
                      className="text-xs font-extrabold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Record Fee Payment Directly
                    </button>
                  )}

                  {selectedStoreForEmail.email && selectedStoreForEmail.email !== 'N/A' && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(selectedStoreForEmail.email, 'EMAIL')
                      }
                      className="text-slate-500 hover:text-slate-800 font-bold text-[11px] flex items-center gap-1 transition ml-auto"
                    >
                      {copiedType === 'EMAIL' ? (
                        <span className="text-emerald-600 font-extrabold">✓ Email Copied</span>
                      ) : (
                        <span>Copy Email ({selectedStoreForEmail.email})</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}