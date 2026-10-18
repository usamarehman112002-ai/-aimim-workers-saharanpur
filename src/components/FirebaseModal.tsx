import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Info,
  Lock,
  Eye,
  EyeOff,
  User,
  LogIn,
  LogOut,
  PlayCircle,
  Loader2,
  Activity,
  Server,
} from 'lucide-react';
import { FirebaseConfigState, WorkerRecord } from '../types/worker';
import {
  TARGET_FIREBASE_PROJECT_ID,
  WORKER_COLLECTION_NAME,
  FirebaseStatus,
  getFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  maskCredential,
  loginWithGoogle,
  logoutUser,
  testFirestoreWriteAndRead,
  probeFirestoreRestEndpoint,
  DiagnosticResult,
} from '../services/firebase';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: FirebaseStatus;
  workers: WorkerRecord[];
  onConfigUpdated: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  status,
  workers,
  onConfigUpdated,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState(`${TARGET_FIREBASE_PROJECT_ID}.firebaseapp.com`);
  const [projectId, setProjectId] = useState(TARGET_FIREBASE_PROJECT_ID);
  const [databaseId, setDatabaseId] = useState('(default)');
  const [storageBucket, setStorageBucket] = useState(`${TARGET_FIREBASE_PROJECT_ID}.firebasestorage.app`);
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [pasteSnippet, setPasteSnippet] = useState('');

  const [copiedRules, setCopiedRules] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Diagnostic probe state
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<DiagnosticResult | null>(null);

  // Full write/read test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    docId?: string;
    latencyMs?: number;
    details?: string;
  } | null>(null);

  useEffect(() => {
    const { config } = getFirebaseConfig();
    if (config) {
      setApiKey(config.apiKey || '');
      setAuthDomain(config.authDomain || `${TARGET_FIREBASE_PROJECT_ID}.firebaseapp.com`);
      setProjectId(config.projectId || TARGET_FIREBASE_PROJECT_ID);
      setDatabaseId(config.databaseId || '(default)');
      setStorageBucket(config.storageBucket || `${TARGET_FIREBASE_PROJECT_ID}.firebasestorage.app`);
      setMessagingSenderId(config.messagingSenderId || '');
      setAppId(config.appId || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto parser for pasted config snippet
  const handleParseSnippet = (snippet: string) => {
    setPasteSnippet(snippet);
    try {
      const matchApiKey = snippet.match(/apiKey:\s*["']([^"']+)["']/);
      const matchAuthDomain = snippet.match(/authDomain:\s*["']([^"']+)["']/);
      const matchProjectId = snippet.match(/projectId:\s*["']([^"']+)["']/);
      const matchDatabaseId = snippet.match(/(?:databaseId|firestoreDatabaseId):\s*["']([^"']+)["']/);
      const matchStorage = snippet.match(/storageBucket:\s*["']([^"']+)["']/);
      const matchSenderId = snippet.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const matchAppId = snippet.match(/appId:\s*["']([^"']+)["']/);

      if (matchApiKey) setApiKey(matchApiKey[1]);
      if (matchAuthDomain) setAuthDomain(matchAuthDomain[1]);
      if (matchProjectId) setProjectId(matchProjectId[1]);
      if (matchDatabaseId) setDatabaseId(matchDatabaseId[1]);
      if (matchStorage) setStorageBucket(matchStorage[1]);
      if (matchSenderId) setMessagingSenderId(matchSenderId[1]);
      if (matchAppId) setAppId(matchAppId[1]);
      setErrorMsg(null);
    } catch (e) {
      // ignore
    }
  };

  const handleRunProbe = async () => {
    setIsProbing(true);
    setProbeResult(null);
    setErrorMsg(null);

    try {
      const res = await probeFirestoreRestEndpoint(projectId, databaseId);
      setProbeResult(res);
      if (res.ok) {
        setActionMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'डायग्नोस्टिक जांच में त्रुटि हुई।');
    } finally {
      setIsProbing(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setTestResult(null);

    if (!apiKey.trim()) {
      setErrorMsg('कृपया अपने फायरबेस प्रोजेक्ट की apiKey दर्ज करें।');
      return;
    }

    const config: FirebaseConfigState = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim() || TARGET_FIREBASE_PROJECT_ID,
      databaseId: databaseId.trim() || '(default)',
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    saveFirebaseConfig(config);
    onConfigUpdated();
    setActionMsg('फायरबेस सेटिंग्स सहेज ली गईं! लाइव फायरस्टोर कनेक्शन अपडेट किया गया।');
  };

  const handleClear = () => {
    clearFirebaseConfig();
    setApiKey('');
    setAppId('');
    setPasteSnippet('');
    setTestResult(null);
    setProbeResult(null);
    onConfigUpdated();
    setActionMsg('कॉन्फ़िगरेशन हटा दिया गया है।');
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setErrorMsg(null);

    try {
      const res = await testFirestoreWriteAndRead();
      setTestResult(res);
      if (res.success) {
        setActionMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'परीक्षण विफल रहा।',
      });
      setErrorMsg(err.message || 'परीक्षण विफल रहा।');
    } finally {
      setIsTesting(false);
    }
  };

  const handleAuth = async () => {
    try {
      if (status.currentUser) {
        await logoutUser();
        setActionMsg('उपयोगकर्ता सफलतापूर्वक लॉगआउट हो गया।');
      } else {
        const user = await loginWithGoogle();
        setActionMsg(`स्वागत है, ${user.displayName || user.email}! गूगल ऑथेंटिकेशन सफल रहा।`);
      }
      onConfigUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'ऑथेंटिकेशन में त्रुटि हुई।');
    }
  };

  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /workers/{workerId} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRulesCode);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-emerald-950 text-white rounded-2xl border border-emerald-700/80 w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-emerald-900/90 px-4 sm:px-6 py-3.5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                फायरबेस क्लाउड फायरस्टोर डायग्नोस्टिक्स एवं सेटिंग्स
              </h3>
              <p className="text-[11px] text-emerald-300">
                प्रोजेक्ट: <code className="text-amber-300 font-mono font-bold">{projectId}</code> • डेटाबेस: <code className="text-amber-300 font-mono font-bold">{databaseId}</code> • कलेक्शन: <code className="text-amber-300 font-mono font-bold">{WORKER_COLLECTION_NAME}</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Status Alert Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              status.isConnected
                ? 'bg-emerald-900/50 border-emerald-500 text-emerald-100'
                : 'bg-red-950/70 border-red-500/70 text-red-200'
            }`}
          >
            {status.isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 min-w-0">
              <div className="font-bold text-sm">
                {status.isConnected
                  ? (status.isDemoMode
                      ? `🟢 फायरस्टोर ऑटो-कॉन्फ़िगरेशन सक्रिय (प्रोजेक्ट: "${status.projectId}")`
                      : `🟢 लाइव फायरस्टोर कॉन्फ़िगरेशन सक्रिय (कलेक्शन: "${WORKER_COLLECTION_NAME}")`)
                  : '🔴 फायरबेस Web App API Key दर्ज नहीं है'}
              </div>
              <p className="text-[11px] leading-relaxed">
                {status.isConnected
                  ? (status.isDemoMode
                      ? `ऑटो-फॉलबैक क्रेडेंशियल्स सक्रिय हैं। ऐप पूरी तरह काम कर रहा है और डेटा ब्राउज़र व क्लाउड में सुरक्षित रहता है। यदि आपके पास अपनी निजी Firebase Web API Key है, तो नीचे दिए गए फ़ॉर्म में उसे दर्ज करके 'सेव' कर सकते हैं।`
                      : `प्रोजेक्ट "${status.projectId}" डेटाबेस "${status.databaseId}" से जुड़ा है। नया कार्यकर्ता जोड़ते ही रिकॉर्ड Firestore addDoc द्वारा सीधे सुरक्षित होगा।`)
                  : `प्रोजेक्ट "${projectId}" के लिए Firebase Web App apiKey दर्ज करें ताकि लाइव राइट/रीड शुरू हो सके।`}
              </p>
            </div>
          </div>

          {/* Quick Server Probe Diagnostic Box */}
          <div className="bg-emerald-900/40 p-3.5 rounded-xl border border-emerald-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">
                  त्वरित डेटाबेस कनेक्टिविटी जांच (Direct Server Probe)
                </span>
              </div>
              <button
                type="button"
                onClick={handleRunProbe}
                disabled={isProbing}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-amber-200 font-bold text-[11px] flex items-center gap-1.5 shadow border border-emerald-500 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                {isProbing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>जांच रहे हैं...</span>
                  </>
                ) : (
                  <>
                    <Server className="w-3.5 h-3.5 text-amber-300" />
                    <span>कनेक्टिविटी जांचें (&lt; 1s)</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-emerald-300">
              यह जांच Google Cloud REST Endpoint पर सीधे अनुरोध भेजकर पता लगाती है कि प्रोजेक्ट <code className="text-amber-300 font-bold">{projectId}</code> और डेटाबेस <code className="text-amber-300 font-bold">{databaseId}</code> वास्तविक रूप से सक्रिय हैं या नहीं।
            </p>

            {probeResult && (
              <div
                className={`p-3 rounded-lg border text-[11px] space-y-1.5 ${
                  probeResult.ok
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                    : 'bg-red-950 border-red-600 text-red-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  {probeResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <span>
                    सर्वर स्थिति: {probeResult.httpStatus ? `HTTP ${probeResult.httpStatus}` : probeResult.code}
                  </span>
                  <span className="text-[10px] text-emerald-400 ml-auto font-mono">
                    {probeResult.timestamp}
                  </span>
                </div>
                <div className="whitespace-pre-wrap font-mono text-[10px] bg-black/40 p-2 rounded">
                  {probeResult.message}
                </div>
                {probeResult.suggestion && (
                  <div className="text-amber-300 bg-amber-950/40 border border-amber-600/40 p-2 rounded text-[11px] leading-relaxed">
                    <b>सुझाव:</b> {probeResult.suggestion}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Write / Read Verification Box */}
          <div className="bg-emerald-900/40 p-3.5 rounded-xl border border-emerald-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">
                  लाइव फायरस्टोर SDK टेस्ट (Test Write & Read)
                </span>
              </div>
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting || !status.isConfigured}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-[11px] flex items-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>परीक्षण जारी...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>टेस्ट राइट/रीड चलाएं</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-emerald-300">
              यह टेस्ट SDK के जरिए एक डमी रिकॉर्ड लिखकर, पढ़कर और तुरंत हटाकर लाइव राइट/रीड की पुष्टि करता है। मौजूदा डेटा सुरक्षित रहेगा।
            </p>

            {testResult && (
              <div
                className={`p-2.5 rounded-lg border text-[11px] flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                    : 'bg-red-950/80 border-red-600 text-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 min-w-0">
                  <div className="font-bold">
                    {testResult.success ? 'सत्यापन परिणाम: सफल' : 'सत्यापन परिणाम: विफल'}
                  </div>
                  <div className="whitespace-pre-wrap">{testResult.message}</div>
                  {testResult.details && (
                    <div className="text-[10px] text-amber-300 font-mono bg-black/40 p-1.5 rounded">
                      {testResult.details}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Auth Status Box */}
          <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-amber-300">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-white truncate">
                  {status.currentUser ? (status.currentUser.displayName || status.currentUser.email) : 'अतिथि (लॉगिन नहीं)'}
                </div>
                <div className="text-[10px] text-emerald-300 truncate">
                  {status.currentUser ? `Firebase UID: ${status.currentUser.uid}` : 'सुरक्षा नियमों के अनुसार डेटा लिखने हेतु Google लॉगिन आवश्यक है'}
                </div>
              </div>
            </div>

            <button
              onClick={handleAuth}
              disabled={!status.isConfigured}
              className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {status.currentUser ? (
                <>
                  <LogOut className="w-3.5 h-3.5 text-red-300" />
                  <span>लॉगआउट</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-amber-300" />
                  <span>Google लॉगिन</span>
                </>
              )}
            </button>
          </div>

          {actionMsg && (
            <div className="bg-emerald-900/60 border border-emerald-500 text-emerald-200 p-2.5 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{actionMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-950/80 border border-red-700 text-red-200 p-2.5 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{errorMsg}</span>
            </div>
          )}

          {/* Instructions to get Web App config */}
          <div className="bg-emerald-900/30 p-3 rounded-xl border border-emerald-800/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Firebase Console से सटीक क्रेडेंशियल प्राप्त करें:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-emerald-200/90 pl-1 leading-relaxed">
              <li>
                <a
                  href={`https://console.firebase.google.com/project/${projectId}/settings/general`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 underline font-semibold inline-flex items-center gap-1"
                >
                  Firebase Console खोलें <ExternalLink className="w-3 h-3" />
                </a>{' '}
                और प्रोजेक्ट <b className="text-white">{projectId}</b> के Project Settings में जाएं।
              </li>
              <li>
                नीचे <b>Your apps</b> में Web app (<code>&lt;/&gt;</code>) का <code>firebaseConfig</code> स्निपेट कॉपी करके नीचे पेस्ट करें।
              </li>
              <li>
                यदि Firebase Console में Cloud Firestore डेटाबेस का नाम <code>(default)</code> के बजाय कुछ और है, तो <b>Database ID</b> फ़ील्ड में वही नाम दर्ज करें।
              </li>
            </ol>
          </div>

          {/* Config Form */}
          <form onSubmit={handleSaveConfig} className="space-y-3 pt-2 border-t border-emerald-800/40">
            {/* Quick Paste Area */}
            <div>
              <label className="block text-xs font-semibold text-emerald-200 mb-1">
                Firebase Web SDK स्निपेट पेस्ट करें (ऑटो-पार्स):
              </label>
              <textarea
                rows={2}
                value={pasteSnippet}
                onChange={(e) => handleParseSnippet(e.target.value)}
                placeholder={'const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "aimim-workers-saharanpur",\n  appId: "1:..."\n};'}
                className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs text-white placeholder-emerald-500 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-emerald-200">
                    apiKey <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-[10px] text-emerald-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showKey ? 'छिपाएं' : 'दिखाएं'}</span>
                  </button>
                </div>
                <input
                  type={showKey ? 'text' : 'password'}
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">
                  projectId (परियोजना ID) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs text-amber-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">
                  Database ID (डिफ़ॉल्ट: (default))
                </label>
                <input
                  type="text"
                  value={databaseId}
                  onChange={(e) => setDatabaseId(e.target.value)}
                  placeholder="(default)"
                  className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs text-emerald-200 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">
                  appId (वेब ऐप आईडी)
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:954883443157:web:..."
                  className="w-full px-3 py-2 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2">
              {status.isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-red-400 hover:text-red-300 underline text-xs cursor-pointer"
                >
                  कॉन्फ़िगरेशन हटाएं
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  फायरबेस सेटिंग्स सहेजें एवं सक्रिय करें
                </button>
              </div>
            </div>
          </form>

          {/* Firestore Security Rules Box for collection 'workers' */}
          <div className="space-y-1.5 pt-3 border-t border-emerald-800/40">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-200 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                सुरक्षा नियम (Security Rules for 'workers'):
              </span>
              <button
                onClick={copyRules}
                className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700 cursor-pointer"
              >
                {copiedRules ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedRules ? 'कॉपी हो गया!' : 'नियम कॉपी करें'}
              </button>
            </div>
            <pre className="bg-black/60 p-2.5 rounded-xl border border-emerald-800 text-[11px] text-emerald-300 font-mono overflow-x-auto">
              {firestoreRulesCode}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-emerald-900/60 border-t border-emerald-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
