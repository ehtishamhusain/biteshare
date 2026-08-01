'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Download,
  ArrowLeft,
  RefreshCw,
  Award,
  ShieldCheck,
} from 'lucide-react';

export default function DonorCsrCertificatePage() {
  const certificateRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [metrics, setStats] = useState({
    totalMeals: 0,
    co2SavedKg: 0,
    grossRevenue: 0,
    completedClaimsCount: 0,
  });

  const [certId, setCertId] = useState('');
  const [issueDate, setIssueDate] = useState('');

  useEffect(() => {
    fetchCertificateData();
  }, []);

  const fetchCertificateData = async () => {
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

    // 2. Fetch Food Bundles & Claims
    const { data: bundles } = await supabase
      .from('food_bundles')
      .select('*')
      .eq('donor_id', user.id);

    if (bundles && bundles.length > 0) {
      const bundleIds = bundles.map((b) => b.id);

      const { data: claims } = await supabase
        .from('claims')
        .select('*')
        .in('bundle_id', bundleIds);

      let meals = 0;
      let grossRev = 0;
      let completedCount = 0;

      if (claims && claims.length > 0) {
        const completedClaims = claims.filter(
          (c) => String(c.status).toUpperCase() === 'COMPLETED'
        );

        completedCount = completedClaims.length;

        completedClaims.forEach((c) => {
          const qty = parseInt(c.claimed_quantity) || 1;
          meals += qty;
          grossRev += Number(c.total_price) || 0;
        });
      }

      setStats({
        totalMeals: meals,
        co2SavedKg: Math.round(meals * 2.5 * 10) / 10,
        grossRevenue: Math.round(grossRev),
        completedClaimsCount: completedCount,
      });
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const shortUserHash = user.id.slice(0, 6).toUpperCase();
    const generatedCertId = `BS-CSR-${today.getFullYear()}-${shortUserHash}`;

    setCertId(generatedCertId);
    setIssueDate(formattedDate);
    setLoading(false);
  };

  // 📸 html2canvas Export with lab() color parsing bypass
  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);

    try {
      // @ts-ignore - Dynamic import to prevent SSR issues
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // High DPI capture for 4K export
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc: Document) => {
          // Remove stylesheets containing modern lab()/oklch() functions from cloned render tree
          const styleElements = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styleElements.forEach((el) => {
            if (el.textContent?.includes('lab(') || el.textContent?.includes('oklch(')) {
              el.remove();
            }
          });
        },
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `BiteShare_CSR_Certificate_${donorProfile?.organization_name || 'Partner'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export certificate image:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const storeName =
    donorProfile?.organization_name ||
    donorProfile?.full_name ||
    'Partner Business';

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <Link
              href="/donor/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Donor Station
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Official CSR Impact Certificate
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchCertificateData}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleDownloadCertificate}
              disabled={downloading || loading}
              className="px-6 py-2.5 bg-[#059669] hover:bg-emerald-700 text-white font-black text-xs rounded-2xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating PNG...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download High-Res Certificate
                </>
              )}
            </button>
          </div>
        </div>

        {/* 🏆 CERTIFICATE PREVIEW CONTAINER */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#059669]" />
            <p className="text-slate-500 text-sm font-semibold">Generating CSR Certificate...</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div
              ref={certificateRef}
              style={{
                width: '850px',
                backgroundColor: '#ffffff',
                border: '10px solid #064e3b',
                padding: '40px',
                margin: '0 auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                userSelect: 'none',
                fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                color: '#0f172a',
              }}
            >
              {/* Gold Inner Decorative Border */}
              <div
                style={{
                  border: '2px solid #d97706',
                  padding: '32px',
                  position: 'relative',
                  backgroundColor: '#ffffff',
                }}
              >
                {/* Decorative Corner Ornaments */}
                <div style={{ position: 'absolute', top: '6px', left: '6px', width: '20px', height: '20px', borderTop: '2px solid #b45309', borderLeft: '2px solid #b45309' }} />
                <div style={{ position: 'absolute', top: '6px', right: '6px', width: '20px', height: '20px', borderTop: '2px solid #b45309', borderRight: '2px solid #b45309' }} />
                <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '20px', height: '20px', borderBottom: '2px solid #b45309', borderLeft: '2px solid #b45309' }} />
                <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '20px', height: '20px', borderBottom: '2px solid #b45309', borderRight: '2px solid #b45309' }} />

                {/* 🌟 100% OFFICIAL BRAND LOGO FROM /public/logo.png */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src="/logo.png"
                      alt="BiteShare Logo"
                      style={{
                        height: '48px',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto',
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#047857', paddingTop: '10px' }}>
                    Zero-Waste Community Initiative
                  </div>

                  <h2 style={{ fontSize: '26px', fontWeight: '900', textTransform: 'uppercase', color: '#0f172a', letterSpacing: '-0.01em', marginTop: '6px', marginBottom: '6px' }}>
                    Certificate of Sustainability Impact
                  </h2>

                  <div style={{ width: '120px', height: '3px', backgroundColor: '#059669', margin: '0 auto', borderRadius: '999px' }} />
                </div>

                {/* Recipient Details */}
                <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '700', color: '#64748b' }}>
                    This official document certifies the corporate social responsibility (CSR) contribution of:
                  </p>

                  <h3 style={{ fontSize: '34px', fontWeight: '900', color: '#064e3b', borderBottom: '2px dashed #f59e0b', display: 'inline-block', paddingBottom: '4px', paddingLeft: '24px', paddingRight: '24px', marginTop: '10px', marginBottom: '10px' }}>
                    {storeName}
                  </h3>

                  <p style={{ fontSize: '12px', color: '#475569', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6', fontStyle: 'italic', paddingTop: '6px' }}>
                    "Through active partnership with BiteShare, {storeName} has demonstrated exceptional commitment to eliminating urban food waste, supporting local community members, and reducing environmental carbon footprint."
                  </p>
                </div>

                {/* 📊 CSR IMPACT STATS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '8px 0', marginTop: '16px', marginBottom: '16px' }}>
                  <div style={{ backgroundColor: '#ecfdf5', padding: '14px', borderRadius: '16px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#065f46' }}>
                      Meals Rescued
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#022c22' }}>
                      {metrics.totalMeals}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#047857' }}>
                      Portions Saved
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '16px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#115e59' }}>
                      Surplus Food Saved
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#134e4a' }}>
                      {metrics.co2SavedKg} kg
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#0d9488' }}>
                      Kept Out of Landfills
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#fffbeb', padding: '14px', borderRadius: '16px', border: '1px solid #fde68a', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400e' }}>
                      CO₂ Offset
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#451a03' }}>
                      {Math.round(metrics.co2SavedKg * 2.5 * 10) / 10} kg
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#b45309' }}>
                      Emissions Prevented
                    </div>
                  </div>
                </div>

                {/* ✍️ FOOTER SIGNATURES & STAMP SEAL */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #e2e8f0', marginTop: '16px' }}>
                  {/* Left: Verification & Date */}
                  <div style={{ fontSize: '11px', lineHeight: '1.5' }}>
                    <div style={{ fontWeight: '800', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" /> Verified by BiteShare Network
                    </div>
                    <div style={{ color: '#64748b' }}>
                      Issued on: <strong style={{ color: '#0f172a' }}>{issueDate}</strong>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8' }}>
                      ID: {certId}
                    </div>
                  </div>

                  {/* Center: Gold Emblem Badge */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '52px', height: '52px', backgroundColor: '#d97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', border: '2px solid #ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', margin: '0 auto' }}>
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#92400e', paddingTop: '4px' }}>
                      Zero Waste Partner
                    </div>
                  </div>

                  {/* Right: Directorate Line */}
                  <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: '900', color: '#0f172a' }}>
                      BiteShare Impact Directorate
                    </div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>
                      Bareilly, India
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}