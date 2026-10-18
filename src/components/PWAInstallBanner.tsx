import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  variant?: 'banner' | 'button' | 'compact';
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ variant = 'banner' }) => {
  const { isInstallable, isInstalled, isIOS, install, needRefresh, reloadApp, dismissRefresh } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If new version is available via auto-updating service worker, show update bar!
  if (needRefresh) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounce-subtle">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-green-950 border-2 border-amber-400 text-white shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold flex-shrink-0 animate-pulse">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                नया वर्ज़न तैयार है!
              </h4>
              <p className="text-xs text-emerald-100">
                ऑटो-अपडेट बैकग्राउंड में डाउनलोड हो गया है।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reloadApp}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              अपडेट करें
            </button>
            <button
              onClick={dismissRefresh}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10"
              title="बाद में"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If already running as installed standalone PWA, no need for install prompt
  if (isInstalled || isDismissed) {
    return null;
  }

  // Compact variant for Navbar header
  if (variant === 'compact') {
    if (isInstallable) {
      return (
        <button
          onClick={install}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold text-xs shadow-md transition-all active:scale-95 border border-amber-300"
          title="अपने फोन या कंप्यूटर में ऐप इंस्टॉल करें"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>ऐप इंस्टॉल करें</span>
        </button>
      );
    }
    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs shadow-md transition-all border border-amber-400/40"
            title="iPhone / iPad पर होम स्क्रीन में जोड़ें"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone पर जोड़ें</span>
          </button>
          {showIOSGuide && (
            <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
          )}
        </>
      );
    }
    return null;
  }

  // Full Banner variant on Home Screen
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 border-2 border-emerald-600/70 p-4 sm:p-5 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-xl bg-emerald-950 border border-amber-400/80 p-0.5 overflow-hidden flex-shrink-0 shadow-md">
              <img src="/logo.png" alt="App Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Universal PWA App • Android & iPhone
              </div>
              <h3 className="text-base sm:text-lg font-black text-white font-devanagari">
                AIMIM Workers ऐप अपने फोन में इंस्टॉल करें
              </h3>
              <p className="text-xs text-emerald-200/90 font-medium">
                बिना Play Store या APK के, सीधे होम स्क्रीन पर एक क्लिक में जोड़ें और बिना इंटरनेट भी इस्तेमाल करें।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isInstallable ? (
              <button
                onClick={install}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-emerald-950 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                तुरंत इंस्टॉल करें
              </button>
            ) : isIOS ? (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 border border-emerald-400/60"
              >
                <Smartphone className="w-4 h-4" />
                iPhone / iPad पर जोड़ें
              </button>
            ) : (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-amber-300 font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 border border-amber-400/40"
              >
                <Info className="w-4 h-4" />
                इंस्टॉल गाइड
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-white/10"
              title="हटाएं"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showIOSGuide && (
        <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
      )}
    </>
  );
};

// Step-by-step Modal Guide for iPhone/iPad iOS Safari
const IOSInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-devanagari">
                iPhone / iPad पर ऐप इंस्टॉल करें
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Apple Safari ब्राउज़र गाइड (PWA)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4 text-xs sm:text-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              1
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Safari ब्राउज़र में नीचे शेयर (Share) बटन दबाएं:
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 flex items-center gap-1.5">
                नीचे टूलबार में <Share className="w-4 h-4 text-blue-500 inline" /> आइकॉन पर टैप करें।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              2
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                नीचे स्क्रॉल करके 'Add to Home Screen' चुनें:
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 flex items-center gap-1.5">
                सूची में <PlusSquare className="w-4 h-4 text-emerald-600 inline" /> <strong>"Add to Home Screen" (होम स्क्रीन में जोड़ें)</strong> पर क्लिक करें।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              3
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                ऊपर दायें कोने में 'Add' पर टैप करें:
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">
                ऐप का आधिकारिक पतंग लोगो आपकी होम स्क्रीन पर असली ऐप की तरह आ जाएगा।
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ऑटो-अपडेट हमेशा चालू रहेगा
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all"
          >
            समझ गया (OK)
          </button>
        </div>
      </div>
    </div>
  );
};
