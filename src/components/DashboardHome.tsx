import React from 'react';
import {
  UserPlus,
  Users,
  Vote,
  Calendar,
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Share2,
  FileSpreadsheet,
  IdCard,
  Building2,
  Flame,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { WorkerRecord } from '../types/worker';
import { SAHARANPUR_ASSEMBLIES } from '../data/saharanpurData';
import { AimimLogo } from './AimimLogo';
import { LeaderProfile } from '../types/leadership';
import { LeadershipSection } from './LeadershipSection';
import { PWAInstallBanner } from './PWAInstallBanner';

interface DashboardHomeProps {
  workers: WorkerRecord[];
  leaders: LeaderProfile[];
  onNavigate: (view: 'dashboard' | 'workers' | 'voter_list' | 'events' | 'communications') => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenLeadershipAdmin: () => void;
  onEditSingleLeader: (leader: LeaderProfile) => void;
  onOpenIdCardForWorker?: (worker: WorkerRecord) => void;
  onSelectAssemblyFilter?: (assemblyId: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  workers,
  leaders,
  onNavigate,
  onOpenAddModal,
  onOpenExportModal,
  onOpenLeadershipAdmin,
  onEditSingleLeader,
  onSelectAssemblyFilter,
}) => {
  const activeCount = workers.filter((w) => w.isActive).length;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* ================= HERO HEADER & BRANDING BANNER ================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 border-2 border-emerald-700/60 shadow-xl p-5 sm:p-7 text-white">
        {/* Decorative Background Elements */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          {/* Logo with Emblem & Title */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl shadow-black/50 ring-4 ring-emerald-500/30">
              <img
                src="/logo.png"
                alt="AIMIM Workers Saharanpur Kite Logo"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-semibold mb-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                आधिकारिक जिला पोर्टल • उत्तर प्रदेश
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                AIMIM Workers
              </h1>
              <p className="text-base sm:text-lg font-bold text-amber-400 font-devanagari">
                जिला सहारनपुर (कमेटी एवं संगठन प्रबंधन)
              </p>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl">
                ऑल इंडिया मजलिस-ए-इत्तेहादुल मुस्लिमीन के 7 विधानसभा क्षेत्रों के कार्यकर्ताओं, वोटर्स एवं कार्यक्रमों का एकीकृत डिजिटल डैशबोर्ड
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 sm:gap-4 bg-emerald-950/80 border border-emerald-700/70 p-3 sm:p-4 rounded-xl shadow-inner">
            <div className="text-center px-2">
              <span className="block text-2xl sm:text-3xl font-black text-amber-400">{workers.length}</span>
              <span className="text-[11px] text-emerald-300 font-medium">कुल कार्यकर्ता</span>
            </div>
            <div className="h-10 w-px bg-emerald-800" />
            <div className="text-center px-2">
              <span className="block text-2xl sm:text-3xl font-black text-white">7</span>
              <span className="text-[11px] text-emerald-300 font-medium">विधानसभा क्षेत्र</span>
            </div>
            <div className="h-10 w-px bg-emerald-800" />
            <div className="text-center px-2">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400">{activeCount}</span>
              <span className="text-[11px] text-emerald-300 font-medium">सक्रिय फील्ड</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PWA UNIVERSAL INSTALL BANNER ================= */}
      <PWAInstallBanner variant="banner" />

      {/* ================= LEADERSHIP SECTION & SLIDER ================= */}
      <LeadershipSection
        leaders={leaders}
        onOpenAdminModal={onOpenLeadershipAdmin}
        onEditSingleLeader={onEditSingleLeader}
      />

      {/* ================= 5 BIG DASHBOARD CARDS / FOLDERS ================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            मुख्य मेन्यू (Dashboard Actions)
          </h2>
          <span className="text-xs text-slate-500 font-medium">सुगम व आसान नेविगेशन</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          
          {/* 1. नया कार्यकर्ता जोड़ें (Add New Worker Card) */}
          <div
            onClick={onOpenAddModal}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-5 sm:p-6 text-emerald-950 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-400/80 active:scale-[0.98]"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
            
            <div className="flex items-start justify-between gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <UserPlus className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-amber-300 text-[11px] font-bold shadow-sm">
                + फॉर्म भरें
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-black text-emerald-950 font-devanagari">
                नया कार्यकर्ता जोड़ें
              </h3>
              <p className="text-xs sm:text-sm text-emerald-900/90 font-medium mt-1 leading-relaxed">
                7 विधानसभाओं के नए सदस्यों का फॉर्म भरें, फोटो अपलोड करें व कमेटी पदभार असाइन करें।
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-emerald-950/20 text-xs font-bold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                सीधा सुरक्षित रजिस्ट्रेशन
              </span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                खोलें <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* 2. कार्यकर्ता सूची (Worker Directory Card) */}
          <div
            onClick={() => onNavigate('workers')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-5 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-emerald-600/60 active:scale-[0.98]"
          >
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-start justify-between gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 border border-emerald-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="flex flex-col items-end">
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black shadow-sm">
                  {workers.length} कुल सदस्य
                </span>
                <span className="text-[10px] text-emerald-300 mt-1 font-medium">{activeCount} सक्रिय</span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-black text-white font-devanagari">
                कार्यकर्ता सूची
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-medium mt-1 leading-relaxed">
                जिला कोर कमेटी, विधानसभा व ब्लॉक कमेटियों के सभी कार्यकर्ताओं को देखें, खोजें व आईडी कार्ड बनाएं।
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-emerald-700/50 text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <IdCard className="w-4 h-4 text-amber-400" />
                आईडी कार्ड व फिल्टर
              </span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                सूची देखें <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* 3. वोटर लिस्ट (Voter List & Booth Analysis Card) */}
          <div
            onClick={() => onNavigate('voter_list')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-5 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-indigo-700/60 active:scale-[0.98]"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 border border-indigo-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Vote className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[11px] font-bold">
                7 विधानसभा बूथ
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-black text-white font-devanagari">
                वोटर लिस्ट
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200/90 font-medium mt-1 leading-relaxed">
                सहारनपुर के सभी विधानसभा क्षेत्रों के बूथ-वार वोटर्स, मतदाता पर्ची प्रिंटिंग व बूथ इन-चार्ज लिस्ट।
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-indigo-800/50 text-xs font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                बूथ प्रबंधन व पर्ची
              </span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                वोटर लिस्ट खोलें <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* 4. कार्यक्रम एवं मीटिंग्स (Events & Meetings Card) */}
          <div
            onClick={() => onNavigate('events')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900 via-stone-900 to-slate-950 p-5 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-700/60 active:scale-[0.98]"
          >
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-600 border border-amber-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30 text-[11px] font-bold">
                आगामी बैठकें
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-black text-white font-devanagari">
                कार्यक्रम एवं मीटिंग्स
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 font-medium mt-1 leading-relaxed">
                जिला बैठकें, रैली, नुक्कड़ सभाएं, कार्यकर्ता सम्मेलन और व्हाट्सएप पर आमंत्रण प्रसारण।
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-amber-800/50 text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                मीटिंग्स व एजेंडा
              </span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                शेड्यूल देखें <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* 5. डायरेक्ट WhatsApp और कॉल (Direct WhatsApp & Calling Hub) */}
          <div
            onClick={() => onNavigate('communications')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-teal-900 to-slate-950 p-5 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-emerald-500/60 active:scale-[0.98] md:col-span-2 lg:col-span-2"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <PhoneCall className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white font-devanagari">
                      डायरेक्ट WhatsApp और कॉल
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                      त्वरित संपर्क
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200/90 font-medium mt-1">
                    जिला अध्यक्ष, महासचिव, मीडिया प्रभारी एवं 7 विधानसभा अध्यक्षों से एक-क्लिक में सीधी बात व व्हाट्सएप चैट करें।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm group-hover:bg-emerald-900 transition-colors">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  सीधा संपर्क खोलें <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Quick Contact Chips */}
            <div className="mt-4 pt-3 border-t border-emerald-700/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-emerald-950/60 rounded-lg p-2 border border-emerald-800/60">
                <span className="text-[10px] text-emerald-400 block font-semibold">जिला अध्यक्ष</span>
                <span className="font-bold text-white text-xs truncate block">मो० कलीम</span>
              </div>
              <div className="bg-emerald-950/60 rounded-lg p-2 border border-emerald-800/60">
                <span className="text-[10px] text-emerald-400 block font-semibold">जिला महासचिव</span>
                <span className="font-bold text-white text-xs truncate block">एडवोकेट आरिफ</span>
              </div>
              <div className="bg-emerald-950/60 rounded-lg p-2 border border-emerald-800/60">
                <span className="text-[10px] text-emerald-400 block font-semibold">सहारनपुर नगर</span>
                <span className="font-bold text-white text-xs truncate block">कमेटी प्रभारी</span>
              </div>
              <div className="bg-emerald-950/60 rounded-lg p-2 border border-emerald-800/60">
                <span className="text-[10px] text-emerald-400 block font-semibold">देवबंद प्रभारी</span>
                <span className="font-bold text-white text-xs truncate block">विधानसभा विंग</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= 7 CONSTITUENCIES QUICK DIRECTORY ================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              जिला सहारनपुर की 7 विधानसभाएँ (Constituencies)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              सीधे किसी भी विधानसभा के कार्यकर्ताओं को देखने के लिए क्लिक करें:
            </p>
          </div>
          <button
            onClick={() => onNavigate('workers')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
          >
            सभी देखें <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {SAHARANPUR_ASSEMBLIES.map((assembly) => {
            const count = workers.filter(
              (w) => w.assembly.includes(assembly.code) || w.assembly.includes(assembly.nameEn)
            ).length;
            return (
              <button
                key={assembly.code}
                onClick={() => {
                  if (onSelectAssemblyFilter) {
                    onSelectAssemblyFilter(assembly.nameHi);
                  }
                  onNavigate('workers');
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 transition-all text-center group"
              >
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {assembly.code}
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-0.5">
                  {assembly.nameHi}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 px-1.5 py-0.2 rounded-full bg-white dark:bg-slate-700 font-semibold shadow-2xs">
                  {count} कार्यकर्ता
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= QUICK TOOLS & SHORTCUTS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => onNavigate('workers')}
          className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3.5 text-left hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <IdCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
              डिजिटल कार्यकर्ता ID कार्ड
            </h4>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
              फोटो, पद व क्यूआर कोड सहित पहचान पत्र
            </p>
          </div>
        </button>

        <button
          onClick={onOpenExportModal}
          className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-300 dark:border-amber-800 flex items-center gap-3.5 text-left hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-emerald-950 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-200">
              एक्सेल व PDF एक्सपोर्ट
            </h4>
            <p className="text-[11px] text-amber-800 dark:text-amber-400">
              पूरी सूची या विधानसभा-वार डाउनलोड करें
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('communications')}
          className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-950/40 dark:to-teal-900/20 border border-teal-300 dark:border-teal-800 flex items-center gap-3.5 text-left hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-teal-950 dark:text-teal-200">
              व्हाट्सएप ब्रॉडकास्ट
            </h4>
            <p className="text-[11px] text-teal-800 dark:text-teal-400">
              पार्टी संदेश एवं कार्यक्रम आमंत्रण भेजें
            </p>
          </div>
        </button>
      </div>

    </div>
  );
};
