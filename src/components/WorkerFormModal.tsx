import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Building,
  Check,
  AlertCircle,
  Loader2,
  Database,
  LogIn,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { CommitteeSection, WorkerRecord } from '../types/worker';
import {
  SAHARANPUR_ASSEMBLIES,
  SAHARANPUR_BLOCKS,
  COMMITTEE_SECTIONS,
  SUGGESTED_ROLES,
} from '../data/saharanpurData';
import {
  formatFirestoreErrorMessage,
  WORKER_COLLECTION_NAME,
  FirebaseStatus,
  loginWithGoogle,
} from '../services/firebase';

interface WorkerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (worker: WorkerRecord) => Promise<void>;
  onSaveLocal?: (worker: WorkerRecord) => void;
  editingWorker: WorkerRecord | null;
  defaultSection?: CommitteeSection;
  firebaseStatus?: FirebaseStatus;
  onOpenFirebaseSettings?: () => void;
}

export const WorkerFormModal: React.FC<WorkerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveLocal,
  editingWorker,
  defaultSection = 'district_committee',
  firebaseStatus,
  onOpenFirebaseSettings,
}) => {
  const [pendingRecord, setPendingRecord] = useState<WorkerRecord | null>(null);
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [mobile, setMobile] = useState('');
  const [altMobile, setAltMobile] = useState('');
  const [assembly, setAssembly] = useState('01 - बेहट');
  const [block, setBlock] = useState('बेहट (मुजफ्फराबाद)');
  const [villageOrWard, setVillageOrWard] = useState('');
  const [section, setSection] = useState<CommitteeSection>('district_committee');
  const [role, setRole] = useState('सक्रिय कार्यकर्ता');
  const [notes, setNotes] = useState('');
  const [joiningYear, setJoiningYear] = useState(new Date().getFullYear().toString());
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (editingWorker) {
      setName(editingWorker.name);
      setFatherName(editingWorker.fatherName || '');
      setMobile(editingWorker.mobile);
      setAltMobile(editingWorker.altMobile || '');
      setAssembly(editingWorker.assembly);
      setBlock(editingWorker.block);
      setVillageOrWard(editingWorker.villageOrWard);
      setSection(editingWorker.section);
      setRole(editingWorker.role);
      setNotes(editingWorker.notes || '');
      setJoiningYear(editingWorker.joiningYear || new Date().getFullYear().toString());
      setBloodGroup(editingWorker.bloodGroup || '');
      setAddress(editingWorker.address || '');
      setIsActive(editingWorker.isActive);
    } else {
      setName('');
      setFatherName('');
      setMobile('');
      setAltMobile('');
      setAssembly('01 - बेहट');
      setBlock('बेहट (मुजफ्फराबाद)');
      setVillageOrWard('');
      setSection(defaultSection === 'all_workers' ? 'district_committee' : defaultSection);
      setRole('सक्रिय कार्यकर्ता');
      setNotes('');
      setJoiningYear(new Date().getFullYear().toString());
      setBloodGroup('');
      setAddress('');
      setIsActive(true);
    }
    setError(null);
    setIsSubmitting(false);
  }, [editingWorker, isOpen, defaultSection]);

  if (!isOpen) return null;

  const handleQuickLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(`लॉगिन में त्रुटि: ${err.message || String(err)}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate clicks

    setError(null);

    if (!name.trim()) {
      setError('कृपया कार्यकर्ता का नाम दर्ज करें।');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setError('कृपया सही 10-अंकीय मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (!villageOrWard.trim()) {
      setError('कृपया ग्राम पंचायत या वार्ड/मोहल्ला दर्ज करें।');
      return;
    }

    if (!role.trim()) {
      setError('कृपया पद/दायित्व दर्ज करें।');
      return;
    }

    setIsSubmitting(true);

    // Deterministic alphanumeric ID
    const safeId = editingWorker
      ? editingWorker.id
      : `worker_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const record: WorkerRecord = {
      id: safeId,
      name: name.trim(),
      fatherName: fatherName.trim() || undefined,
      mobile: cleanMobile,
      altMobile: altMobile.replace(/\D/g, '') || undefined,
      assembly,
      block,
      villageOrWard: villageOrWard.trim(),
      section,
      role: role.trim(),
      notes: notes.trim() || undefined,
      joiningYear: joiningYear.trim() || undefined,
      bloodGroup: bloodGroup.trim() || undefined,
      address: address.trim() || undefined,
      isActive,
      isDemo: false, // Newly saved records are never demo
      createdAt: editingWorker ? editingWorker.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    try {
      // Await Firestore confirmation before closing modal
      await onSave(record);
      setPendingRecord(null);
      onClose();
    } catch (err: any) {
      const formatted = formatFirestoreErrorMessage(err, {
        projectId: firebaseStatus?.projectId || 'aimim-workers-saharanpur',
        databaseId: firebaseStatus?.databaseId || '(default)',
        apiKey: '',
        authDomain: '',
        storageBucket: '',
      });
      setError(formatted);
      setPendingRecord(record);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-emerald-950 text-white rounded-2xl border border-emerald-700/80 w-full max-w-2xl shadow-2xl overflow-hidden my-6 relative">
        
        {/* Full-screen Loading Overlay while saving to Cloud Firestore */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-emerald-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
              <Database className="w-5 h-5 text-emerald-300 absolute inset-0 m-auto" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                क्लाउड फायरस्टोर में सुरक्षित किया जा रहा है...
              </h4>
              <p className="text-xs text-emerald-300 max-w-sm">
                प्रोजेक्ट: <b>{firebaseStatus?.projectId || 'aimim-workers-saharanpur'}</b> • कलेक्शन: <b>{WORKER_COLLECTION_NAME}</b>
              </p>
              <p className="text-[11px] text-amber-300">
                सर्वर द्वारा राइट कन्फर्मेशन की प्रतीक्षा की जा रही है...
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-emerald-900/90 px-4 sm:px-6 py-3.5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-sm">
              AIMIM
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {editingWorker ? 'कार्यकर्ता विवरण संशोधित करें' : 'नया AIMIM कार्यकर्ता जोड़ें'}
              </h3>
              <p className="text-[11px] text-emerald-300">
                जिला सहारनपुर • क्लाउड फायरस्टोर ({WORKER_COLLECTION_NAME})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/80 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Auth Notice if not logged in */}
          {firebaseStatus && !firebaseStatus.currentUser && (
            <div className="bg-amber-950/70 border border-amber-600/70 text-amber-200 px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  सुरक्षा नियमों के अनुसार Firestore में डेटा लिखने के लिए प्रमाणीकरण आवश्यक हो सकता है।
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={isLoggingIn}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-[11px] flex items-center gap-1 shadow flex-shrink-0 cursor-pointer"
              >
                {isLoggingIn ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogIn className="w-3 h-3" />}
                <span>Google लॉगिन</span>
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-950/90 border border-red-700 text-red-200 px-3.5 py-3 rounded-xl text-xs space-y-2.5 shadow-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <div className="font-bold text-red-300">फायरस्टोर त्रुटि विवरण:</div>
                  <div className="leading-relaxed whitespace-pre-wrap font-sans text-[11px]">{error}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-red-800/60 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`https://console.firebase.google.com/project/${firebaseStatus?.projectId || 'aimim-workers-saharanpur'}/firestore`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-[11px] flex items-center gap-1.5 shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Firebase Console में डेटाबेस बनाएं</span>
                </a>

                <div className="flex items-center gap-2 ml-auto">
                  {onSaveLocal && pendingRecord && (
                    <button
                      type="button"
                      onClick={() => {
                        onSaveLocal(pendingRecord);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow border border-emerald-500"
                    >
                      <Database className="w-3.5 h-3.5 text-amber-300" />
                      <span>स्थानीय मेमोरी में सहेजें (Save Locally)</span>
                    </button>
                  )}
                  {onOpenFirebaseSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenFirebaseSettings();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1.5 shadow"
                    >
                      <Settings className="w-3.5 h-3.5 text-amber-300" />
                      <span>सेटिंग्स जांचें</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                कार्यकर्ता का नाम <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. मोहम्मद ताहिर"
                  className="w-full pl-9 pr-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                पिता का नाम (वैकल्पिक)
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="उदा. श्री अब्दुल रशीद"
                className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                मोबाइल नंबर (10 अंक) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  maxLength={12}
                  disabled={isSubmitting}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                वैकल्पिक मोबाइल / WhatsApp
              </label>
              <input
                type="tel"
                maxLength={12}
                disabled={isSubmitting}
                value={altMobile}
                onChange={(e) => setAltMobile(e.target.value)}
                placeholder="वैकल्पिक नंबर"
                className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Section 3: Administrative Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                विधानसभा क्षेत्र (सहारनपुर) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                <select
                  disabled={isSubmitting}
                  value={assembly}
                  onChange={(e) => setAssembly(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-emerald-900/60 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                >
                  {SAHARANPUR_ASSEMBLIES.map((a) => (
                    <option key={a.code} value={a.nameHi} className="bg-emerald-950 text-white">
                      {a.nameHi} ({a.nameEn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                ब्लॉक / नगर क्षेत्र <span className="text-amber-400">*</span>
              </label>
              <select
                disabled={isSubmitting}
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="w-full px-3 py-2 bg-emerald-900/60 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              >
                {SAHARANPUR_BLOCKS.map((b) => (
                  <option key={b} value={b} className="bg-emerald-950 text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Village or Ward */}
          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              ग्राम पंचायत अथवा नगर निगम वार्ड / मोहल्ला <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={villageOrWard}
                onChange={(e) => setVillageOrWard(e.target.value)}
                placeholder="उदा. ग्राम रसूलपुर / वार्ड 15 खाताखेड़ी"
                className="w-full pl-9 pr-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Section 4: Committee Assignment & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                संगठनात्मक कमेटी (7 स्तर) <span className="text-amber-400">*</span>
              </label>
              <select
                disabled={isSubmitting}
                value={section}
                onChange={(e) => setSection(e.target.value as CommitteeSection)}
                className="w-full px-3 py-2 bg-emerald-900/60 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              >
                {COMMITTEE_SECTIONS.filter((s) => s.id !== 'all_workers').map((s) => (
                  <option key={s.id} value={s.id} className="bg-emerald-950 text-white">
                    {s.nameHi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                पद / दायित्व (Role) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                list="rolesList"
                placeholder="उदा. जिला अध्यक्ष, महासचिव"
                className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
              <datalist id="rolesList">
                {SUGGESTED_ROLES.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                पार्टी में जुड़ने का वर्ष
              </label>
              <input
                type="number"
                min="2014"
                max={new Date().getFullYear()}
                disabled={isSubmitting}
                value={joiningYear}
                onChange={(e) => setJoiningYear(e.target.value)}
                className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                ब्लड ग्रुप (वैकल्पिक)
              </label>
              <select
                disabled={isSubmitting}
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 bg-emerald-900/60 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              >
                <option value="">निर्धारित नहीं</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg} className="bg-emerald-950 text-white">
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Postal Address */}
          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              पूरा पता (वैकल्पिक)
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="मकान संख्या, गली, मोहल्ला, पिन कोड..."
              className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
            />
          </div>

          {/* Notes / Special Responsibility */}
          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              विशेष दायित्व / टिप्पणी (Notes)
            </label>
            <textarea
              rows={2}
              disabled={isSubmitting}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="बूथ संख्या, विशेष जिम्मेदारियां, सदस्यता लक्ष्य आदि..."
              className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
            />
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              disabled={isSubmitting}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer disabled:opacity-50"
            />
            <label htmlFor="isActive" className="text-xs text-emerald-200 cursor-pointer">
              यह कार्यकर्ता वर्तमान में <b>सक्रिय</b> है।
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-emerald-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 text-xs sm:text-sm font-semibold border border-emerald-700/50 transition-colors disabled:opacity-40"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-950" />
                  <span>सहेज रहे हैं...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingWorker ? 'अपडेट करें' : 'रिकॉर्ड सहेजें'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
