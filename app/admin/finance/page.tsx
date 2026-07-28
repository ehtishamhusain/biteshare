'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  Building,
  TrendingUp,
  Percent,
  RefreshCw,
  Search,
  Download,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function AdminFinancePage() {
  const [loading, setLoading] = useState(true);
  const [restaurantLedger, setRestaurantLedger] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminFinanceData();
  }, []);

  const fetchAdminFinanceData = async () => {
    setLoading(true);

    // Fetch aggregated data from our Supabase view
    const { data, error } = await supabase
      .from('admin_restaurant_fees')
      .select('*');

    if (!error && data) {
      setRestaurantLedger(data);
    } else {
      console.error('Error fetching admin finance view:', error);
    }

    setLoading(false);
  };

  // 📊 CALCULATE GLOBAL PLATFORM METRICS
  const totalGrossGMV = restaurantLedger.reduce(
    (sum, r) => sum + (Number(r.total_gross_sales) || 0),
    0
  );
  const totalBiteShareCut = totalGrossGMV * 0.12; // 12% platform fee
  const totalRestaurantPayouts = totalGrossGMV * 0.88; // 88% net to stores
  const totalOrdersCount = restaurantLedger.reduce(
    (sum, r) => sum + (Number(r.total_completed_pickups) || 0),
    0
  );

  // Filtered by search query
  const filteredLedger = restaurantLedger.filter((r) =>
    String(r.restaurant_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(r.city).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CSV Export Handler
  const exportToCSV = () => {
    const headers = ['Restaurant Name', 'City', 'UPI ID', 'Completed Orders', 'Gross Sales (INR)', 'BiteShare Fee 12% (INR)', 'Store Payout 88% (INR)'];
    const rows = filteredLedger.map((r) => [
      `"${r.restaurant_name}"`,
      `"${r.city || ''}"`,
      `"${r.store_upi_id || 'Not Set'}"`,
      r.total_completed_pickups,
      r.total_gross_sales,
      r.biteshare_12_pct_fee,
      r.restaurant_88_pct_payout,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BiteShare_Commission_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200 mb-2">
              <Percent className="w-4 h-4 text-emerald-600" /> Executive Admin Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              BiteShare Platform Commission & Settlement Engine
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Live automated financial calculations across all 100+ partner restaurants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={filteredLedger.length === 0}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>

            <button
              onClick={fetchAdminFinanceData}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Your Total 12% Revenue */}
          <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg shadow-emerald-600/20 space-y-2">
            <div className="flex items-center justify-between text-emerald-100 text-xs font-bold uppercase tracking-wider">
              <span>BiteShare Profit (12%)</span>
              <div className="p-2 rounded-xl bg-emerald-500/30 text-white border border-emerald-400/30">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">₹{totalBiteShareCut.toFixed(0)}</div>
            <p className="text-[11px] text-emerald-100 font-medium">Your platform revenue across all stores</p>
          </div>

          {/* Gross Market Volume */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Total Food GMV</span>
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">₹{totalGrossGMV.toFixed(0)}</div>
            <p className="text-[11px] text-slate-500">Gross transaction value processed</p>
          </div>

          {/* Total Store Settlements */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Total Partner Payouts (88%)</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">₹{totalRestaurantPayouts.toFixed(0)}</div>
            <p className="text-[11px] text-slate-500">Owed to partner restaurants</p>
          </div>

          {/* Partner Count */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Active Partners</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">{restaurantLedger.length} Stores</div>
            <p className="text-[11px] text-emerald-700 font-bold">{totalOrdersCount} Completed Orders</p>
          </div>
        </div>

        {/* Restaurant Breakdown Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-black text-slate-900">All Restaurant Fee & Settlement Ledger</h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurant or city..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/50 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
              <p className="text-xs font-semibold">Calculating 100+ restaurant commissions...</p>
            </div>
          ) : filteredLedger.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <p className="text-sm font-bold text-slate-700">No restaurants match your filter</p>
              <p className="text-xs text-slate-500">Ensure completed orders exist in the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-2">Restaurant / Business</th>
                    <th className="py-3 px-2">City</th>
                    <th className="py-3 px-2">Completed Orders</th>
                    <th className="py-3 px-2">Gross Sales</th>
                    <th className="py-3 px-2 text-emerald-700">BiteShare Cut (12%)</th>
                    <th className="py-3 px-2 text-slate-900">Store Payout (88%)</th>
                    <th className="py-3 px-2">Store UPI ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredLedger.map((r) => (
                    <tr key={r.donor_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-2 font-black text-slate-900">{r.restaurant_name}</td>
                      <td className="py-3.5 px-2 font-semibold text-slate-600">{r.city || 'Bareilly'}</td>
                      <td className="py-3.5 px-2 font-bold text-slate-800">{r.total_completed_pickups} Orders</td>
                      <td className="py-3.5 px-2 font-bold text-slate-900">₹{r.total_gross_sales}</td>
                      <td className="py-3.5 px-2 font-black text-emerald-700">+₹{r.biteshare_12_pct_fee}</td>
                      <td className="py-3.5 px-2 font-black text-slate-900">₹{r.restaurant_88_pct_payout}</td>
                      <td className="py-3.5 px-2 font-mono text-[11px] text-slate-500">
                        {r.store_upi_id ? (
                          <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {r.store_upi_id}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Added</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}