import React, { useState, useEffect, useRef } from 'react';
import { safeInjectAdScript, syncAdSenseToHead } from '../lib/adSanitizer';
import { ExternalLink, Megaphone, Sparkles } from 'lucide-react';

interface AdBannerProps {
  position?: 'top_dashboard' | 'results' | 'footer';
  className?: string;
}

export interface SponsorData {
  imageUrl: string;
  title: string;
  description: string;
  linkUrl: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position = 'footer', className = '' }) => {
  const [adsEnabled, setAdsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('minint_ads_enabled') !== 'false';
  });

  const [adMode, setAdMode] = useState<'adsense' | 'sponsor'>(() => {
    return (localStorage.getItem('minint_ad_mode') as 'adsense' | 'sponsor') || 'adsense';
  });

  const [adsenseCode, setAdsenseCode] = useState<string>(() => {
    return localStorage.getItem('minint_adsense_code') || localStorage.getItem('minint_ad_script') || '';
  });

  const [sponsorData, setSponsorData] = useState<SponsorData>(() => ({
    imageUrl: localStorage.getItem('minint_sponsor_image') || '',
    title: localStorage.getItem('minint_sponsor_title') || '',
    description: localStorage.getItem('minint_sponsor_desc') || '',
    linkUrl: localStorage.getItem('minint_sponsor_link') || '',
  }));

  const adContainerRef = useRef<HTMLDivElement>(null);

  // Sync state when localStorage changes
  useEffect(() => {
    const handleStorage = () => {
      setAdsEnabled(localStorage.getItem('minint_ads_enabled') !== 'false');
      setAdMode((localStorage.getItem('minint_ad_mode') as 'adsense' | 'sponsor') || 'adsense');
      setAdsenseCode(localStorage.getItem('minint_adsense_code') || localStorage.getItem('minint_ad_script') || '');
      setSponsorData({
        imageUrl: localStorage.getItem('minint_sponsor_image') || '',
        title: localStorage.getItem('minint_sponsor_title') || '',
        description: localStorage.getItem('minint_sponsor_desc') || '',
        linkUrl: localStorage.getItem('minint_sponsor_link') || '',
      });
    };

    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Dynamic DOM Script Injection using secure sanitizer for AdSense
  useEffect(() => {
    if (!adsEnabled || adMode !== 'adsense') return;
    if (adsenseCode) {
      syncAdSenseToHead(adsenseCode);
    }
    const container = adContainerRef.current;
    if (!container) return;

    safeInjectAdScript(container, adsenseCode);
  }, [adsEnabled, adMode, adsenseCode]);

  // If ads are disabled globally, render nothing
  if (!adsEnabled) {
    return null;
  }

  // -------------------------------------------------------------
  // MODE 1: LOCAL SPONSOR BANNER (PATROCINADORES LOCAIS)
  // -------------------------------------------------------------
  if (adMode === 'sponsor') {
    const hasSponsorContent = Boolean(sponsorData.title.trim() || sponsorData.imageUrl.trim() || sponsorData.linkUrl.trim());
    if (!hasSponsorContent) return null;

    if (position === 'footer') {
      return (
        <div className={`sticky bottom-0 z-40 w-full bg-slate-950/95 dark:bg-[#07090C]/95 border-t border-amber-500/30 backdrop-blur-md py-2 px-3 flex items-center justify-center transition-all ${className}`}>
          <a
            href={sponsorData.linkUrl.trim() || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-md flex items-center justify-between gap-3 bg-slate-900 hover:bg-slate-850 p-2 sm:p-2.5 rounded-xl border border-amber-500/30 text-white transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {sponsorData.imageUrl.trim() ? (
                <img
                  src={sponsorData.imageUrl.trim()}
                  alt={sponsorData.title}
                  className="w-9 h-9 rounded-lg object-cover border border-amber-500/30 bg-slate-800 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Megaphone size={18} />
                </div>
              )}
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">PATROCÍNIO</span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <h4 className="text-xs font-bold text-white truncate">{sponsorData.title || 'Parceiro Oficial MININT'}</h4>
                </div>
                {sponsorData.description && (
                  <p className="text-[10px] text-slate-300 truncate">{sponsorData.description}</p>
                )}
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shrink-0 group-hover:scale-105 transition-transform">
              <span>VISITAR</span>
              <ExternalLink size={12} />
            </div>
          </a>
        </div>
      );
    }

    // Inline Sponsor Card for Top Dashboard & Exam Results
    return (
      <div className={`w-full my-3 ${className}`}>
        <a
          href={sponsorData.linkUrl.trim() || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-3.5 sm:p-4 text-white shadow-xl hover:shadow-amber-500/10 transition-all group overflow-hidden relative"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              {sponsorData.imageUrl.trim() ? (
                <img
                  src={sponsorData.imageUrl.trim()}
                  alt={sponsorData.title}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-amber-500/40 bg-slate-800 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={22} />
                </div>
              )}

              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>PATROCINADOR OFICIAL</span>
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white tracking-tight leading-snug">
                  {sponsorData.title || 'Parceiro Oficial de Apoios MININT'}
                </h4>
                {sponsorData.description && (
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium line-clamp-2">
                    {sponsorData.description}
                  </p>
                )}
              </div>
            </div>

            <div className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-md group-hover:scale-105 transition-transform mt-1 sm:mt-0">
              <span>VISITAR</span>
              <ExternalLink size={14} />
            </div>
          </div>
        </a>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MODE 2: GOOGLE ADSENSE / CUSTOM AD SCRIPT
  // -------------------------------------------------------------
  if (!adsenseCode.trim()) {
    return null;
  }

  if (position === 'footer') {
    return (
      <div className={`sticky bottom-0 z-40 w-full bg-slate-950/90 dark:bg-[#07090C]/95 border-t border-slate-800/40 backdrop-blur-md py-1 px-2 flex items-center justify-center transition-all ${className}`}>
        <div ref={adContainerRef} className="w-full max-w-[320px] min-h-[50px] flex justify-center items-center overflow-hidden" />
      </div>
    );
  }

  // Inline AdSense Box for Top Dashboard & Exam Results
  return (
    <div className={`w-full my-3 p-3 bg-slate-900/80 dark:bg-[#0B0D12] border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center overflow-hidden relative ${className}`}>
      <div className="w-full flex items-center justify-between mb-2 px-1 text-[9px] uppercase tracking-widest font-mono text-slate-500">
        <span>PUBLICIDADE</span>
        <span>GOOGLE ADSENSE</span>
      </div>
      <div ref={adContainerRef} className="w-full max-w-md min-h-[90px] flex justify-center items-center overflow-hidden" />
    </div>
  );
};
