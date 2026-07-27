'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
  Award,
  Printer,
  Download,
  ShieldCheck,
  RefreshCw,
  Utensils,
  MapPin,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function DonorCertificatePage() {
  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalMeals: 0,
    totalKgSaved: 0,
    co2OffsetKg: 0,
    completedPickups: 0,
  });
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchDonorCertificateData();
  }, []);

  const fetchDonorCertificateData = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Fetch Donor Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) setDonorProfile(profile);

    // 2. Fetch all completed claims for this donor's food bundles
    const { data: donorBundles } = await supabase
      .from('food_bundles')
      .select('id')
      .eq('donor_id', user.id);

    if (donorBundles && donorBundles.length > 0) {
      const bundleIds = donorBundles.map((b) => b.id);

      const { data: claimsData } = await supabase
        .from('claims')
        .select('claimed_quantity, status')
        .in('bundle_id', bundleIds)
        .eq('status', 'COMPLETED');

      if (claimsData) {
        const meals = claimsData.reduce((acc, curr) => acc + (Number(curr.claimed_quantity) || 1), 0);
        const kgSaved = Number((meals * 0.4).toFixed(1)); // Approx 400g per meal
        const co2 = Number((kgSaved * 2.5).toFixed(1)); // 2.5kg CO2 per kg food saved

        setStats({
          totalMeals: meals,
          totalKgSaved: kgSaved,
          co2OffsetKg: co2,
          completedPickups: claimsData.length,
        });
      }
    }

    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // 📥 ISOLATED DIRECT PDF DOWNLOAD HANDLER (OKLAB/OKLCH SAFE)
  const handleSavePdf = async () => {
    setGeneratingPdf(true);
    setToastMessage('');

    try {
      // 1. Load html2pdf.js dynamically if not present
      if (!(window as any).html2pdf) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load PDF generator library'));
          document.body.appendChild(script);
        });
      }

      const businessName = donorProfile?.organization_name || donorProfile?.full_name || 'BiteShare Food Partner';
      const cleanName = businessName.replace(/[^a-zA-Z0-9]/g, '_');
      const issueDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      // 2. Pure HTML & HEX inline styles (Completely bypasses Tailwind oklab CSS variables)
      const cleanCertHtml = `
        <div style="
          width: 820px;
          padding: 40px;
          background-color: #ffffff;
          color: #0f172a;
          font-family: Arial, Helvetica, sans-serif;
          border: 12px solid #d1fae5;
          box-sizing: border-box;
          text-align: center;
          position: relative;
        ">
          <div style="position: absolute; top: 10px; left: 10px; width: 30px; height: 30px; border-top: 4px solid #059669; border-left: 4px solid #059669;"></div>
          <div style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-top: 4px solid #059669; border-right: 4px solid #059669;"></div>
          <div style="position: absolute; bottom: 10px; left: 10px; width: 30px; height: 30px; border-bottom: 4px solid #059669; border-left: 4px solid #059669;"></div>
          <div style="position: absolute; bottom: 10px; right: 10px; width: 30px; height: 30px; border-bottom: 4px solid #059669; border-right: 4px solid #059669;"></div>

          <div style="margin-bottom: 20px;">
            <div style="
              display: inline-block;
              background-color: #059669;
              color: #ffffff;
              padding: 10px 18px;
              border-radius: 12px;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 12px;
            ">
              🍴 BiteShare
            </div>
            <div style="font-size: 11px; font-weight: bold; color: #047857; letter-spacing: 2px; text-transform: uppercase;">
              BiteShare Zero-Waste Community Initiative
            </div>
            <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin: 8px 0; text-transform: uppercase;">
              Certificate of Sustainability Impact
            </h1>
            <p style="font-size: 12px; color: #64748b; margin: 0;">
              This official document certifies the corporate social responsibility (CSR) and zero-waste contribution of:
            </p>
          </div>

          <div style="
            padding: 14px 0;
            border-top: 2px solid #e2e8f0;
            border-bottom: 2px solid #e2e8f0;
            margin: 0 auto 24px auto;
            max-width: 500px;
          ">
            <h2 style="font-size: 24px; font-weight: 900; color: #065f46; margin: 0;">
              ${businessName}
            </h2>
            ${donorProfile?.city ? `<div style="font-size: 12px; font-weight: bold; color: #64748b; margin-top: 4px;">📍 ${donorProfile.street_address ? donorProfile.street_address + ', ' : ''}${donorProfile.city}</div>` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 24px;">
            <div style="flex: 1; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 12px;">
              <div style="font-size: 24px; font-weight: 900; color: #065f46;">${stats.totalMeals}</div>
              <div style="font-size: 10px; font-weight: bold; color: #047857; text-transform: uppercase;">Meals Donated</div>
            </div>
            <div style="flex: 1; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 12px;">
              <div style="font-size: 24px; font-weight: 900; color: #065f46;">${stats.totalKgSaved} kg</div>
              <div style="font-size: 10px; font-weight: bold; color: #047857; text-transform: uppercase;">Surplus Food Saved</div>
            </div>
            <div style="flex: 1; background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 12px;">
              <div style="font-size: 24px; font-weight: 900; color: #065f46;">${stats.co2OffsetKg} kg</div>
              <div style="font-size: 10px; font-weight: bold; color: #047857; text-transform: uppercase;">CO₂ Offset</div>
            </div>
          </div>

          <p style="font-size: 12px; color: #475569; font-style: italic; max-width: 550px; margin: 0 auto 24px auto; line-height: 1.5;">
            "Through active partnership with BiteShare, ${businessName} has demonstrated exceptional commitment to eliminating urban food waste, supporting local shelters, and reducing environmental carbon footprint."
          </p>

          <div style="
            border-top: 1px solid #f1f5f9;
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            text-align: left;
          ">
            <div>
              <div style="font-size: 12px; font-weight: bold; color: #0f172a;">🛡️ Verified by BiteShare Network</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Issued on: <strong>${issueDate}</strong></div>
            </div>
            <div style="text-align: right;">
              <div style="width: 120px; border-bottom: 1px solid #94a3b8; margin-bottom: 4px; margin-left: auto;"></div>
              <div style="font-size: 11px; font-weight: bold; color: #1e293b;">BiteShare Impact Directorate</div>
              <div style="font-size: 10px; color: #94a3b8;">Bareilly, India</div>
            </div>
          </div>
        </div>
      `;

      // 3. Attach temporary isolated element
      const tempWrapper = document.createElement('div');
      tempWrapper.style.position = 'fixed';
      tempWrapper.style.left = '-9999px';
      tempWrapper.style.top = '-9999px';
      tempWrapper.innerHTML = cleanCertHtml;
      document.body.appendChild(tempWrapper);

      const opt = {
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: `${cleanName}_BiteShare_Impact_Certificate.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      };

      // 4. Trigger direct download
      await (window as any).html2pdf().set(opt).from(tempWrapper.firstElementChild).save();

      // 5. Cleanup
      document.body.removeChild(tempWrapper);
      setToastMessage('🎉 Impact Certificate downloaded directly to your device!');
    } catch (err) {
      console.error(err);
      setToastMessage('❌ Direct download failed. Please use the Print option instead.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-slate-500 text-sm font-semibold">Generating your CSR Impact Certificate...</p>
        </div>
      </div>
    );
  }

  const businessName = donorProfile?.organization_name || donorProfile?.full_name || 'BiteShare Food Partner';
  const issueDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs gap-4 print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200 mb-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" /> Corporate Responsibility
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              CSR & Sustainability Certificate
            </h1>
            <p className="text-xs text-slate-500">
              Official certificate verifying your zero-waste food donations on BiteShare.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              disabled={generatingPdf}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 border border-slate-200 disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Print Certificate</span>
            </button>

            <button
              onClick={handleSavePdf}
              disabled={generatingPdf}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generatingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Downloading PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Save as PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 print:hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Display Certificate Card */}
        <div
          id="certificate-card"
          className="bg-white rounded-3xl p-8 sm:p-14 border-8 border-emerald-800/10 shadow-xl relative overflow-hidden text-center space-y-8 print:shadow-none print:border-4 print:border-emerald-800 print:rounded-none"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-3 left-3 w-12 h-12 border-t-4 border-l-4 border-emerald-600 rounded-tl-xl print:border-emerald-800" />
          <div className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 border-emerald-600 rounded-tr-xl print:border-emerald-800" />
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-4 border-l-4 border-emerald-600 rounded-bl-xl print:border-emerald-800" />
          <div className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 border-emerald-600 rounded-br-xl print:border-emerald-800" />

          {/* Header */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-md">
                <Utensils className="w-8 h-8" />
              </div>
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 block">
              BiteShare Zero-Waste Community Initiative
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Certificate of Sustainability Impact
            </h2>

            <p className="text-xs text-slate-500 font-medium">
              This official document certifies the corporate social responsibility (CSR) and zero-waste contribution of:
            </p>
          </div>

          {/* Business Name */}
          <div className="py-3 border-y-2 border-slate-200 max-w-lg mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
              {businessName}
            </h3>
            {donorProfile?.city && (
              <span className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {donorProfile.street_address ? `${donorProfile.street_address}, ` : ''}{donorProfile.city}
              </span>
            )}
          </div>

          {/* Impact Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-800">{stats.totalMeals}</span>
              <span className="text-[10px] sm:text-xs font-black uppercase text-emerald-900 tracking-wider">
                Meals Donated
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-800">{stats.totalKgSaved} kg</span>
              <span className="text-[10px] sm:text-xs font-black uppercase text-emerald-900 tracking-wider">
                Surplus Food Saved
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-800">{stats.co2OffsetKg} kg</span>
              <span className="text-[10px] sm:text-xs font-black uppercase text-emerald-900 tracking-wider">
                CO₂ Offset
              </span>
            </div>
          </div>

          {/* Certification Text */}
          <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed italic">
            "Through active partnership with BiteShare, {businessName} has demonstrated exceptional commitment to eliminating urban food waste, supporting local shelters, and reducing environmental carbon footprint."
          </p>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified by BiteShare Network</span>
              </div>
              <span className="block text-[11px] text-slate-400">
                Issued on: <strong>{issueDate}</strong>
              </span>
            </div>

            <div className="text-right space-y-1">
              <div className="w-32 border-b border-slate-400 mb-1 ml-auto" />
              <span className="block text-xs font-black text-slate-800">BiteShare Impact Directorate</span>
              <span className="block text-[10px] text-slate-400">Bareilly, India</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}