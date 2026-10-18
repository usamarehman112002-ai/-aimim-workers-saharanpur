import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Share2,
  Database,
  CheckCircle2,
  Trash2,
  AlertCircle,
  HelpCircle,
  Layers,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Building2,
  Landmark,
  Home,
  AlertTriangle,
  Lock,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';
import { Unsubscribe } from 'firebase/firestore';
import { CommitteeSection, WorkerRecord } from './types/worker';
import {
  COMMITTEE_SECTIONS,
  SAHARANPUR_ASSEMBLIES,
} from './data/saharanpurData';
import {
  initFirebase,
  getLocalWorkers,
  addWorkerRecord,
  updateWorkerRecord,
  deleteWorkerRecord,
  subscribeFirestoreWorkers,
  subscribeAuth,
  FirebaseStatus,
  WORKER_COLLECTION_NAME,
  formatFirestoreErrorMessage,
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { SectionNav } from './components/SectionNav';
import { StatsCards } from './components/StatsCards';
import { FilterControls, ViewMode } from './components/FilterControls';
import { WorkerCard } from './components/WorkerCard';
import { WorkerTableView } from './components/WorkerTableView';
import { WorkerFormModal } from './components/WorkerFormModal';
import { WorkerIdCardModal } from './components/WorkerIdCardModal';
import { FirebaseModal } from './components/FirebaseModal';
import { ExportModal } from './components/ExportModal';
import { AppView, BottomNavBar } from './components/BottomNavBar';
import { DashboardHome } from './components/DashboardHome';
import { VoterListModule } from './components/VoterListModule';
import { EventsModule } from './components/EventsModule';
import { DirectCommunicationsModule } from './components/DirectCommunicationsModule';
import { LeaderProfile } from './types/leadership';
import { INITIAL_LEADERSHIP_DATA } from './data/leadershipData';
import { LeadershipAdminModal } from './components/LeadershipAdminModal';

export default function App() {
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatus>(() => initFirebase().status);
  
  // If configured, workers starts empty until Firestore confirms; if not configured, local demo fallback
  const [workers, setWorkers] = useState<WorkerRecord[]>(() => {
    const init = initFirebase().status;
    return init.isConfigured ? [] : getLocalWorkers();
  });
  
  const [isLoadingFirestore, setIsLoadingFirestore] = useState<boolean>(() => initFirebase().status.isConfigured);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<CommitteeSection>('district_core');
  // Navigation View: dashboard (Home), workers, voter_list, events, communications
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssembly, setSelectedAssembly] = useState('all');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [onlyActive, setOnlyActive] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerRecord | null>(null);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [idCardWorker, setIdCardWorker] = useState<WorkerRecord | null>(null);

  // Leadership state (persisted to localStorage and synced)
  const [leaders, setLeaders] = useState<LeaderProfile[]>(() => {
    try {
      const saved = localStorage.getItem('aimim_leadership_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved leadership data', e);
    }
    return INITIAL_LEADERSHIP_DATA;
  });
  const [isLeadershipAdminOpen, setIsLeadershipAdminOpen] = useState(false);

  const handleSaveLeaders = (updated: LeaderProfile[]) => {
    setLeaders(updated);
    try {
      localStorage.setItem('aimim_leadership_data', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save leadership to localStorage', e);
    }
    showToast('नेतृत्व एवं पदाधिकारियों की जानकारी सफलतापूर्वक सुरक्षित हो गई!');
  };

  const handleResetLeaders = () => {
    setLeaders(INITIAL_LEADERSHIP_DATA);
    try {
      localStorage.removeItem('aimim_leadership_data');
    } catch (e) {
      console.error('Failed to clear leadership in localStorage', e);
    }
    showToast('नेतृत्व सूची पार्टी के आधिकारिक डिफ़ॉल्ट पर रीसेट हो गई है।');
  };

  // Deletion modal confirmation
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References to keep single active listeners and avoid duplicate requests
  const firestoreUnsubRef = useRef<Unsubscribe | null>(null);
  const authUnsubRef = useRef<Unsubscribe | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to start a clean Firestore subscription (canceling any previous one)
  const setupFirestoreSubscription = () => {
    // Cancel existing subscription first to prevent duplicate listeners
    if (firestoreUnsubRef.current) {
      firestoreUnsubRef.current();
      firestoreUnsubRef.current = null;
    }

    const { status } = initFirebase();
    setFirebaseStatus(status);

    if (status.isConfigured && !status.isDemoMode) {
      setIsLoadingFirestore(true);
      setFirestoreError(null);

      firestoreUnsubRef.current = subscribeFirestoreWorkers(
        (loadedWorkers) => {
          setWorkers(loadedWorkers);
          setIsLoadingFirestore(false);
          setFirestoreError(null);
          setFirebaseStatus((prev) => ({
            ...prev,
            isConnected: true,
            isDemoMode: false,
            error: undefined,
          }));
        },
        (error) => {
          console.warn('Firestore subscription status:', error);
          const friendly = formatFirestoreErrorMessage(error);
          setFirestoreError(friendly);
          setIsLoadingFirestore(false);
          setWorkers(getLocalWorkers());
          setFirebaseStatus((prev) => ({
            ...prev,
            isConnected: false,
            error: friendly,
          }));
        }
      );
    } else {
      // Local & Auto-Fallback Mode: load local workers instantly with zero network pings
      setIsLoadingFirestore(false);
      setFirestoreError(null);
      setWorkers(getLocalWorkers());
    }
  };

  // Sync Firebase & Auth listener on mount
  useEffect(() => {
    // 1. Subscribe to Auth
    if (authUnsubRef.current) {
      authUnsubRef.current();
    }
    authUnsubRef.current = subscribeAuth((user) => {
      setFirebaseStatus((prev) => ({
        ...prev,
        currentUser: user,
      }));
    });

    // 2. Setup Firestore listener
    setupFirestoreSubscription();

    return () => {
      if (firestoreUnsubRef.current) {
        firestoreUnsubRef.current();
        firestoreUnsubRef.current = null;
      }
      if (authUnsubRef.current) {
        authUnsubRef.current();
        authUnsubRef.current = null;
      }
    };
  }, []);

  const handleRefreshConnection = () => {
    setupFirestoreSubscription();
  };

  // Filtered workers logic
  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      // 1. Section filter
      if (activeSection !== 'all_workers' && worker.section !== activeSection) {
        return false;
      }

      // 2. Assembly filter
      if (selectedAssembly !== 'all') {
        const matchesAssembly =
          worker.assembly.includes(selectedAssembly) ||
          selectedAssembly.includes(worker.assembly);
        if (!matchesAssembly) return false;
      }

      // 3. Block filter
      if (selectedBlock !== 'all') {
        if (worker.block !== selectedBlock) return false;
      }

      // 4. Only active filter
      if (onlyActive && !worker.isActive) {
        return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = worker.name.toLowerCase().includes(q);
        const matchMobile = worker.mobile.includes(q) || (worker.altMobile && worker.altMobile.includes(q));
        const matchRole = worker.role.toLowerCase().includes(q);
        const matchVillage = worker.villageOrWard.toLowerCase().includes(q);
        const matchNotes = worker.notes ? worker.notes.toLowerCase().includes(q) : false;
        const matchAssembly = worker.assembly.toLowerCase().includes(q);
        const matchBlock = worker.block.toLowerCase().includes(q);

        if (!matchName && !matchMobile && !matchRole && !matchVillage && !matchNotes && !matchAssembly && !matchBlock) {
          return false;
        }
      }

      return true;
    });
  }, [workers, activeSection, selectedAssembly, selectedBlock, onlyActive, searchQuery]);

  // Section worker count
  const totalSectionCount = useMemo(() => {
    return activeSection === 'all_workers'
      ? workers.length
      : workers.filter((w) => w.section === activeSection).length;
  }, [workers, activeSection]);

  // Save worker (Add or Update)
  const handleSaveWorker = async (worker: WorkerRecord): Promise<void> => {
    if (editingWorker) {
      await updateWorkerRecord(worker);
      setWorkers((prev) => prev.map((w) => (w.id === worker.id ? worker : w)));
      showToast(`कार्यकर्ता "${worker.name}" का रिकॉर्ड सफलतापूर्वक अपडेट हो गया!`);
    } else {
      const created = await addWorkerRecord(worker);
      setWorkers((prev) => [created, ...prev.filter((w) => w.id !== created.id)]);
      showToast(`नया कार्यकर्ता "${worker.name}" सुरक्षित हो गया!`);
    }
    setEditingWorker(null);
  };

  // Save worker locally when remote Firestore is unprovisioned or offline
  const handleSaveWorkerLocal = (worker: WorkerRecord): void => {
    setWorkers((prev) => {
      const idx = prev.findIndex((w) => w.id === worker.id);
      let updated: WorkerRecord[];
      const localWorker = { ...worker, isDemo: true };
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = localWorker;
      } else {
        updated = [localWorker, ...prev];
      }
      try {
        localStorage.setItem('aimim_saharanpur_workers_v1', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
    showToast(`कार्यकर्ता "${worker.name}" स्थानीय रूप से सहेजा गया!`);
    setEditingWorker(null);
  };

  // Delete worker with confirmation
  const confirmDelete = async () => {
    if (!deleteCandidate || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteWorkerRecord(deleteCandidate.id);
      setWorkers((prev) => prev.filter((w) => w.id !== deleteCandidate.id));
      showToast(`"${deleteCandidate.name}" का रिकॉर्ड हटा दिया गया।`);
      setDeleteCandidate(null);
    } catch (e: any) {
      const msg = formatFirestoreErrorMessage(e);
      showToast(`हटाने में त्रुटि: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentSectionMeta =
    COMMITTEE_SECTIONS.find((s) => s.id === activeSection) || COMMITTEE_SECTIONS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-emerald-950 pb-20 sm:pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl border border-emerald-400 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        firebaseStatus={firebaseStatus}
        onOpenAddModal={() => {
          setEditingWorker(null);
          setIsAddModalOpen(true);
        }}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        totalWorkers={workers.length}
      />

      {/* Clear Missing Configuration Error Banner (Mandated) */}
      {!firebaseStatus.isConfigured && (
        <aside aria-label="फायरबेस सूचना" className="bg-amber-950/80 border-b border-amber-600/60 px-4 py-2.5 text-amber-200 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <b>फायरबेस सूचना:</b> प्रोजेक्ट <code className="text-amber-300 font-mono">aimim-workers-saharanpur</code> में सुरक्षित डेमो-मोड सक्रिय है।
              </span>
            </div>
            <button
              onClick={() => setIsFirebaseModalOpen(true)}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-[11px] whitespace-nowrap transition-colors"
            >
              फायरबेस सेटिंग्स खोलें
            </button>
          </div>
        </aside>
      )}

      {/* Firestore Error Alert */}
      {firestoreError && (
        <div className="bg-red-950/90 border-b border-red-700 px-4 py-2.5 text-red-200 text-xs shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="truncate"><b>फायरस्टोर स्थिति:</b> {firestoreError}</span>
            </div>
            <button
              onClick={() => setIsFirebaseModalOpen(true)}
              className="underline text-red-300 hover:text-white text-[11px] whitespace-nowrap"
            >
              नियम एवं सेटिंग्स जांचें
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full space-y-4 sm:space-y-5">
        
        {/* 1. MAIN MENU / DASHBOARD HOME */}
        {currentView === 'dashboard' && (
          <DashboardHome
            workers={workers}
            leaders={leaders}
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddModal={() => {
              setEditingWorker(null);
              setIsAddModalOpen(true);
            }}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenLeadershipAdmin={() => setIsLeadershipAdminOpen(true)}
            onEditSingleLeader={() => setIsLeadershipAdminOpen(true)}
            onSelectAssemblyFilter={(assemblyId) => {
              setSelectedAssembly(assemblyId);
              setCurrentView('workers');
            }}
          />
        )}

        {/* 2. VOTER LIST MODULE */}
        {currentView === 'voter_list' && (
          <VoterListModule
            workers={workers}
            onBackToHome={() => setCurrentView('dashboard')}
            onOpenAddWorker={() => {
              setEditingWorker(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {/* 3. EVENTS & MEETINGS MODULE */}
        {currentView === 'events' && (
          <EventsModule
            onBackToHome={() => setCurrentView('dashboard')}
            onOpenAddWorker={() => {
              setEditingWorker(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {/* 4. DIRECT WHATSAPP & CALL COMMUNICATIONS MODULE */}
        {currentView === 'communications' && (
          <DirectCommunicationsModule
            workers={workers}
            onBackToHome={() => setCurrentView('dashboard')}
          />
        )}

        {/* 5. WORKERS DIRECTORY VIEW */}
        {currentView === 'workers' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Top Back to Home and Breadcrumb bar */}
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs sm:text-sm border border-emerald-300 dark:border-emerald-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>बैक टू होम (मुख्य मेन्यू)</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {filteredWorkers.length} कार्यकर्ता प्रदर्शित
                </span>
                <button
                  onClick={() => {
                    setEditingWorker(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>नया जोड़ें</span>
                </button>
              </div>
            </div>

            {/* 7 Committees Section Tabs */}
            <SectionNav
              activeSection={activeSection}
              onSelectSection={(sec) => {
                setActiveSection(sec);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              workers={workers}
            />

            {/* District & Assembly Stats Overview */}
            <StatsCards
              workers={workers}
              activeSection={activeSection}
              selectedAssembly={selectedAssembly}
              onSelectAssembly={(asm) => setSelectedAssembly(asm)}
            />

            {/* Search & Filter Bar */}
            <FilterControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedAssembly={selectedAssembly}
              onAssemblyChange={setSelectedAssembly}
              selectedBlock={selectedBlock}
              onBlockChange={setSelectedBlock}
              onlyActive={onlyActive}
              onOnlyActiveToggle={() => setOnlyActive(!onlyActive)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onResetFilters={() => {
                setSearchQuery('');
                setSelectedAssembly('all');
                setSelectedBlock('all');
                setOnlyActive(false);
              }}
              filteredCount={filteredWorkers.length}
              totalSectionCount={totalSectionCount}
            />

            {/* Loading state from live Firestore */}
            {isLoadingFirestore ? (
              <div className="bg-emerald-950/40 rounded-2xl p-12 border border-emerald-800/50 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-400 mx-auto animate-spin" />
                <h3 className="font-bold text-white text-sm">
                  क्लाउड फायरस्टोर से 'workers' कलेक्शन लोड हो रहा है...
                </h3>
                <p className="text-xs text-emerald-300">
                  प्रोजेक्ट: {firebaseStatus.projectId} • डेटाबेस: {firebaseStatus.databaseId}
                </p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="bg-emerald-950/40 rounded-2xl p-8 sm:p-12 border border-emerald-800/50 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-amber-300 text-2xl">
                  🔍
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {firebaseStatus.isConfigured && workers.length === 0
                      ? "फायरस्टोर 'workers' कलेक्शन में अभी कोई कार्यकर्ता दर्ज नहीं है"
                      : 'कोई कार्यकर्ता नहीं मिला'}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-300 max-w-md mx-auto">
                    {firebaseStatus.isConfigured && workers.length === 0
                      ? "आपका लाइव फायरस्टोर प्रोजेक्ट कनेक्ट है। नीचे दिए गए बटन से नया रिकॉर्ड जोड़ें।"
                      : searchQuery || selectedAssembly !== 'all' || selectedBlock !== 'all'
                      ? 'आपके खोज फ़िल्टर से मेल खाता कोई रिकॉर्ड नहीं मिला। कृपया फ़िल्टर बदलें या रीसेट करें।'
                      : `इस वर्ग (${currentSectionMeta.nameHi}) में अभी कोई कार्यकर्ता दर्ज नहीं है। आप नया कार्यकर्ता जोड़ सकते हैं।`}
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedAssembly('all');
                      setSelectedBlock('all');
                      setOnlyActive(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-xs text-emerald-200 border border-emerald-700"
                  >
                    फ़िल्टर साफ़ करें
                  </button>
                  <button
                    onClick={() => {
                      setEditingWorker(null);
                      setIsAddModalOpen(true);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold shadow-md"
                  >
                    + नया कार्यकर्ता जोड़ें
                  </button>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              <WorkerTableView
                workers={filteredWorkers}
                onEdit={(w) => {
                  setEditingWorker(w);
                  setIsAddModalOpen(true);
                }}
                onDelete={(id, name) => setDeleteCandidate({ id, name })}
                onViewIdCard={(w) => setIdCardWorker(w)}
              />
            ) : viewMode === 'idcards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    onClick={() => setIdCardWorker(worker)}
                    className="cursor-pointer transition-transform hover:-translate-y-1"
                  >
                    <div className="bg-gradient-to-b from-emerald-900 via-emerald-950 to-black rounded-2xl border-2 border-amber-400/80 p-4 shadow-lg text-white space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-400/30">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">🪁</span>
                          <span className="text-[11px] font-bold text-amber-300 uppercase">
                            AIMIM सहारनपुर
                          </span>
                        </div>
                        <span className="text-[10px] bg-amber-400 text-emerald-950 px-2 py-0.5 rounded font-bold">
                          आई-कार्ड देखें
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-800 border border-amber-400/50 flex items-center justify-center text-xl font-bold text-amber-300 flex-shrink-0">
                          {worker.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">
                            {worker.name}
                          </h4>
                          <p className="text-xs text-amber-300 font-semibold truncate">
                            {worker.role}
                          </p>
                          <p className="text-[11px] text-emerald-300 truncate">
                            {worker.assembly}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Cards Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    onEdit={(w) => {
                      setEditingWorker(w);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={(id, name) => setDeleteCandidate({ id, name })}
                    onViewIdCard={(w) => setIdCardWorker(w)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modern Bottom Navigation Bar */}
      <BottomNavBar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAddModal={() => {
          setEditingWorker(null);
          setIsAddModalOpen(true);
        }}
        totalWorkers={workers.length}
      />

      {/* Footer */}
      <footer className="mt-8 border-t border-emerald-900/60 bg-emerald-950/80 py-6 text-center text-xs text-emerald-300 space-y-2">
        <div className="flex items-center justify-center gap-2 text-white font-bold text-sm">
          <span>🪁</span>
          <span>ऑल इंडिया मजलिस-ए-इत्तेहादुल मुस्लिमीन (AIMIM)</span>
          <span className="text-amber-400">• जिला सहारनपुर (उ.प्र.)</span>
        </div>
        <p className="text-[11px] text-emerald-400 max-w-lg mx-auto px-4">
          सहारनपुर की सभी 7 विधानसभाओं: बेहट (01), नकुड़ (02), सहारनपुर नगर (03), सहारनपुर देहात (04), देवबंद (05), रामपुर मनिहारान (06), एवं गंगोह (07) का अधिकृत संगठनात्मक पोर्टल।
        </p>
        <div className="text-[10px] text-emerald-500 flex items-center justify-center gap-2 pt-1">
          <span>प्रोजेक्ट: {firebaseStatus.projectId}</span>
          <span>•</span>
          <span>कलेक्शन: {WORKER_COLLECTION_NAME}</span>
          <span>•</span>
          <button
            onClick={() => setIsFirebaseModalOpen(true)}
            className="text-amber-400 hover:underline"
          >
            फायरबेस क्लाउड स्थिति
          </button>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. Worker Form Modal (Add / Edit) */}
      <WorkerFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingWorker(null);
        }}
        onSave={handleSaveWorker}
        onSaveLocal={handleSaveWorkerLocal}
        editingWorker={editingWorker}
        defaultSection={activeSection === 'all_workers' ? 'district_committee' : activeSection}
        firebaseStatus={firebaseStatus}
        onOpenFirebaseSettings={() => setIsFirebaseModalOpen(true)}
      />

      {/* 2. Worker ID Card Modal */}
      <WorkerIdCardModal
        worker={idCardWorker}
        onClose={() => setIdCardWorker(null)}
      />

      {/* 3. Firebase Configuration & Setup Guide Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        status={firebaseStatus}
        workers={workers}
        onConfigUpdated={handleRefreshConnection}
      />

      {/* 4. Export & WhatsApp Share Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        workers={filteredWorkers}
        activeSectionName={currentSectionMeta.nameHi}
      />

      {/* 5. Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-emerald-950 border border-red-800/80 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-700 flex items-center justify-center text-red-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">रिकॉर्ड हटाने की पुष्टि</h4>
                <p className="text-xs text-emerald-300">
                  क्या आप <b>"{deleteCandidate.name}"</b> को सूची से हटाना चाहते हैं?
                </p>
              </div>
            </div>

            <p className="text-[11px] text-red-200/80 bg-red-950/40 p-2.5 rounded-xl border border-red-900/60">
              यह कार्रवाई कार्यकर्ता को क्लाउड फायरस्टोर (`workers` कलेक्शन) से स्थायी रूप से हटा देगी।
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-xs font-semibold text-emerald-200 disabled:opacity-50"
              >
                रद्द करें
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? 'हटा रहे हैं...' : 'हटाएं'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Leadership Admin Management Modal */}
      <LeadershipAdminModal
        isOpen={isLeadershipAdminOpen}
        onClose={() => setIsLeadershipAdminOpen(false)}
        leaders={leaders}
        onSaveLeaders={handleSaveLeaders}
        onResetDefaults={handleResetLeaders}
      />
    </div>
  );
}
