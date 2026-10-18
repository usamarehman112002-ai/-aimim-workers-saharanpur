import React from 'react';
import {
  Users,
  Database,
  Plus,
  Share2,
  LogIn,
  LogOut,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';
import { FirebaseStatus, loginWithGoogle, logoutUser, WORKER_COLLECTION_NAME } from '../services/firebase';
import { AimimLogo } from './AimimLogo';
import { AppView } from './BottomNavBar';
import { PWAInstallBanner } from './PWAInstallBanner';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  firebaseStatus: FirebaseStatus;
  onOpenAddModal: () => void;
  onOpenFirebaseModal: () => void;
  onOpenExportModal: () => void;
  totalWorkers: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  firebaseStatus,
  onOpenAddModal,
  onOpenFirebaseModal,
  onOpenExportModal,
  totalWorkers,
}) => {
  const handleAuthAction = async () => {
    if (firebaseStatus.currentUser) {
      await logoutUser();
    } else {
      try {
        await loginWithGoogle();
      } catch (err: any) {
        console.error('Google Sign-In error:', err);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-950 text-white shadow-lg border-b border-emerald-800/80 backdrop-blur-md">
      {/* Top Banner with AIMIM Official Identity */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & Back to Home Button */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* If not on dashboard, show prominent Back to Home button */}
            {currentView !== 'dashboard' && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-md transition-all active:scale-95 flex-shrink-0"
                title="मुख्य मेन्यू (Home Dashboard) पर वापस जाएं"
              >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span className="hidden xs:inline">होम</span>
              </button>
            )}

            {/* Official AIMIM Kite Logo (Clicking navigates to Dashboard) */}
            <div
              onClick={() => onNavigate('dashboard')}
              className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
              title="मुख्य मेन्यू पर जाने के लिए क्लिक करें"
            >
              <AimimLogo size="md" showSubtitle={true} />
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* PWA In-App Install Quick Button */}
            <PWAInstallBanner variant="compact" />

            {/* Back to Home Button for Desktop if in sub-screen */}
            {currentView !== 'dashboard' && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-amber-400/40 text-xs font-bold transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>मुख्य मेन्यू</span>
              </button>
            )}

            {/* Firebase Status Badge Button */}
            <button
              onClick={onOpenFirebaseModal}
              title="फायरबेस कनेक्शन एवं स्थिति"
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium border transition-all ${
                firebaseStatus.isConnected
                  ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500 hover:bg-emerald-800'
                  : 'bg-amber-950/70 text-amber-200 border-amber-500/60 hover:bg-amber-900/80'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="hidden lg:inline">
                {firebaseStatus.isConnected ? 'फायरस्टोर: कनेक्टेड' : 'कॉन्फ़िगरेशन'}
              </span>
              <span className="lg:hidden">
                {firebaseStatus.isConnected ? 'लाइव' : 'सेटअप'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  firebaseStatus.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </button>

            {/* Google Auth Button */}
            {firebaseStatus.isConfigured && (
              <button
                onClick={handleAuthAction}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs font-medium transition-colors"
                title={firebaseStatus.currentUser ? `लॉगिन: ${firebaseStatus.currentUser.email}` : 'गूगल लॉगिन'}
              >
                {firebaseStatus.currentUser ? (
                  <>
                    <LogOut className="w-3.5 h-3.5 text-red-300" />
                    <span className="hidden sm:inline truncate max-w-[100px]">
                      {firebaseStatus.currentUser.displayName || 'लॉगआउट'}
                    </span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">लॉगिन</span>
                  </>
                )}
              </button>
            )}

            {/* Export / Share Button */}
            <button
              onClick={onOpenExportModal}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800 border border-emerald-700/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="सूची शेयर करें या डाउनलोड करें"
            >
              <Share2 className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">एक्सपोर्ट</span>
            </button>

            {/* Add Worker Action */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="whitespace-nowrap">नया जोड़ें</span>
            </button>
          </div>

        </div>
      </div>

      {/* Sub-strip with Project & Notice info */}
      <div className="bg-emerald-900/50 border-t border-emerald-800/40 text-[11px] text-emerald-200 px-3 sm:px-6 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          <span className="flex items-center gap-1 text-emerald-300">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            कुल कार्यकर्ता: <b className="text-white">{totalWorkers}</b>
          </span>
          <span className="text-emerald-700">|</span>
          <span className="text-emerald-300">
            कलेक्शन: <code className="bg-emerald-950/60 px-1 py-0.2 rounded text-amber-300 font-mono">{WORKER_COLLECTION_NAME}</code>
          </span>
          <span className="text-emerald-700 hidden sm:inline">|</span>
          <span className="text-emerald-300 hidden sm:inline">
            प्रोजेक्ट: <code className="bg-emerald-950/60 px-1 py-0.2 rounded text-emerald-200 font-mono">{firebaseStatus.projectId}</code>
          </span>
          {firebaseStatus.isDemoMode && (
            <span className="bg-amber-500/20 text-amber-200 border border-amber-500/30 px-1.5 py-0.2 rounded text-[10px]">
              डेमो मोड
            </span>
          )}
        </div>
        <button
          onClick={onOpenFirebaseModal}
          className="text-amber-300 hover:text-amber-200 text-[11px] underline flex items-center gap-1 flex-shrink-0 ml-2"
        >
          <HelpCircle className="w-3 h-3" />
          फायरबेस स्थिति
        </button>
      </div>
    </header>
  );
};
