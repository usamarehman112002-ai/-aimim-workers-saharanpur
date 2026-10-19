
import React, { useEffect, useState } from 'react';
import {
  X,
  Database,
  ShieldAlert,
  Copy,
  Check,
  Eye,
  EyeOff,
  User,
  LogIn,
  LogOut,
  ExternalLink,
  AlertTriangle,
  Info,
} from 'lucide-react';

import {
  FirebaseConfigState,
  WorkerRecord,
} from '../types/worker';

import {
  TARGET_FIREBASE_PROJECT_ID,
  WORKER_COLLECTION_NAME,
  FirebaseStatus,
  getFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  loginWithGoogle,
  logoutUser,
} from '../services/firebase';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: FirebaseStatus;
  workers: WorkerRecord[];
  onConfigUpdated: () => void;
}

const firestoreRulesCode = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSuperAdmin() {
      return request.auth != null
        && request.auth.token.email == 'usamarehman112002@gmail.com'
        && request.auth.token.email_verified == true;
    }

    match /workers/{workerId} {
      allow read, create, update, delete: if isSuperAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  status,
  workers,
  onConfigUpdated,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState(
    `${TARGET_FIREBASE_PROJECT_ID}.firebaseapp.com`
  );
  const [projectId, setProjectId] = useState(
    TARGET_FIREBASE_PROJECT_ID
  );
  const [databaseId, setDatabaseId] = useState('(default)');
  const [storageBucket, setStorageBucket] = useState(
    `${TARGET_FIREBASE_PROJECT_ID}.firebasestorage.app`
  );
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [snippet, setSnippet] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const { config } = getFirebaseConfig();

    if (config) {
      setApiKey(config.apiKey || '');
      setAuthDomain(
        config.authDomain ||
          `${TARGET_FIREBASE_PROJECT_ID}.firebaseapp.com`
      );
      setProjectId(
        config.projectId || TARGET_FIREBASE_PROJECT_ID
      );
      setDatabaseId(config.databaseId || '(default)');
      setStorageBucket(
        config.storageBucket ||
          `${TARGET_FIREBASE_PROJECT_ID}.firebasestorage.app`
      );
      setMessagingSenderId(config.messagingSenderId || '');
      setAppId(config.appId || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleParseSnippet = (value: string) => {
    setSnippet(value);

    const fields: Array<{
      key: string;
      setter: (value: string) => void;
    }> = [
      { key: 'apiKey', setter: setApiKey },
      { key: 'authDomain', setter: setAuthDomain },
      { key: 'projectId', setter: setProjectId },
      { key: 'storageBucket', setter: setStorageBucket },
      { key: 'messagingSenderId', setter: setMessagingSenderId },
      { key: 'appId', setter: setAppId },
    ];

    fields.forEach(({ key, setter }) => {
      const match = value.match(
        new RegExp(`${key}\\\\s*:\\\\s*["']([^"']+)["']`)
      );
      if (match) setter(match[1]);
    });

    const dbMatch = value.match(
      /(?:databaseId|firestoreDatabaseId)\s*:\s*["']([^"']+)["']/
    );
    if (dbMatch) setDatabaseId(dbMatch[1]);

    setError('');
  };

  const handleSaveConfig = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!apiKey.trim()) {
      setError('Firebase Web App की सही apiKey दर्ज करें।');
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
    setMessage('Firebase सेटिंग्स सहेज दी गई हैं।');
  };

  const handleClear = () => {
    if (
      !window.confirm(
        'क्या आप इस डिवाइस से Firebase कॉन्फ़िगरेशन हटाना चाहते हैं?'
      )
    ) {
      return;
    }

    clearFirebaseConfig();
    setApiKey('');
    setAppId('');
    setSnippet('');
    setError('');
    setMessage('इस डिवाइस से Firebase कॉन्फ़िगरेशन हटा दिया गया।');
    onConfigUpdated();
  };

  const handleAuth = async () => {
    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (status.currentUser) {
        await logoutUser();
        setMessage('Google खाते से लॉगआउट हो गया।');
      } else {
        const user = await loginWithGoogle();
        setMessage(
          `Google लॉगिन सफल: ${user.email || user.displayName || 'उपयोगकर्ता'}`
        );
      }

      onConfigUpdated();
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : 'Google लॉगिन में त्रुटि हुई।';
      setError(text);
    } finally {
      setBusy(false);
    }
  };

  const handleCopyRules = async () => {
    try {
      await navigator.clipboard.writeText(firestoreRulesCode);
      setCopied(true);
      setMessage('सुरक्षा नियम कॉपी हो गए।');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(
        'ऑटो-कॉपी नहीं हो सकी। नीचे दिए गए नियमों को चुनकर कॉपी करें।'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3">
      <div className="my-6 w-full max-w-2xl overflow-hidden rounded-2xl border border-emerald-700 bg-emerald-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-emerald-800 bg-emerald-900 px-4 py-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="font-bold">
                Firebase सेटिंग्स और सुरक्षा
              </h2>
              <p className="text-xs text-emerald-300">
                प्रोजेक्ट: {projectId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="बंद करें"
            className="rounded-lg p-2 hover:bg-emerald-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[80vh] space-y-4 overflow-y-auto p-4 sm:p-6">
          <div className="rounded-xl border border-emerald-700 bg-emerald-900/40 p-3">
            <div className="flex items-center gap-2 font-semibold">
              <User className="h-4 w-4 text-amber-400" />
              {status.currentUser
                ? status.currentUser.email || status.currentUser.displayName
                : 'Google खाते से लॉगिन नहीं है'}
            </div>
            <p className="mt-1 break-words text-xs text-emerald-200">
              {status.currentUser
                ? `UID: ${status.currentUser.uid}`
                : 'क्लाउड डेटा के लिए अधिकृत Google खाते से लॉगिन करें।'}
            </p>
            <button
              type="button"
              onClick={handleAuth}
              disabled={!status.isConfigured || busy}
              className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {status.currentUser ? (
                <LogOut className="h-4 w-4" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {busy
                ? 'कृपया प्रतीक्षा करें…'
                : status.currentUser
                  ? 'Google लॉगआउट'
                  : 'Google लॉगिन'}
            </button>
          </div>

          <div className="rounded-xl border border-amber-600/50 bg-amber-950/30 p-3 text-xs text-amber-100">
            <div className="mb-1 flex items-center gap-2 font-bold">
              <ShieldAlert className="h-4 w-4" />
              सुरक्षा सूचना
            </div>
            कार्यकर्ताओं के क्लाउड डेटा के लिए Firestore Rules लागू होते हैं।
            इस फॉर्म में सेटिंग्स बदलना, Firestore Rules प्रकाशित करने के
            बराबर नहीं है।
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-3">
            <h3 className="font-bold text-emerald-200">
              Firebase Web App कॉन्फ़िगरेशन
            </h3>

            <div>
              <label className="mb-1 block text-xs">
                Firebase config स्निपेट पेस्ट करें
              </label>
              <textarea
                rows={4}
                value={snippet}
                onChange={(e) => handleParseSnippet(e.target.value)}
                placeholder={'apiKey: "...", projectId: "...", appId: "..."'}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-900/50 p-3 font-mono text-xs"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs">API Key</label>
              <div className="flex gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-emerald-700 bg-emerald-900/50 p-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="rounded-lg border border-emerald-700 p-2"
                  aria-label="API Key दिखाएँ या छिपाएँ"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs">Project ID</label>
              <input
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-900/50 p-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs">Auth Domain</label>
              <input
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-900/50 p-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs">Database ID</label>
              <input
                value={databaseId}
                onChange={(e) => setDatabaseId(e.target.value)}
                placeholder="(default)"
                className="w-full rounded-lg border border-emerald-700 bg-emerald-900/50 p-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs">Storage Bucket</label>
              <input
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-900/50 p-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs">Messaging Sender ID</label>
              <input
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-900/50 p-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs">App ID</label>
              <input
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full rounded-lg border border-emerald-700 bg-emerald-900/50 p-2 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-emerald-950"
              >
                सेटिंग्स सेव करें
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-red-600 px-3 py-2 text-sm text-red-200"
              >
                इस डिवाइस से कॉन्फ़िगरेशन हटाएँ
              </button>
            </div>
          </form>

          <div className="space-y-2 border-t border-emerald-800 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-emerald-200">
                Firestore Security Rules
              </h3>
              <button
                type="button"
                onClick={handleCopyRules}
                className="flex items-center gap-2 rounded-lg border border-emerald-700 px-3 py-2 text-xs"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'कॉपी हो गया' : 'नियम कॉपी करें'}
              </button>
            </div>

            <p className="text-xs text-emerald-300">
              कलेक्शन: {WORKER_COLLECTION_NAME}. ये नियम केवल सत्यापित
              सुपर-एडमिन खाते को पढ़ने और लिखने की अनुमति देते हैं।
            </p>

            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-emerald-800 bg-black/40 p-3 text-xs text-emerald-200">
              {firestoreRulesCode}
            </pre>
          </div>

          <div className="rounded-lg border border-emerald-800 p-3 text-xs text-emerald-200">
            <Info className="mr-1 inline h-4 w-4" />
            प्रोजेक्ट सेटिंग्स देखने के लिए{' '}
            <a
              href={`https://console.firebase.google.com/project/${projectId}/settings/general`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 underline"
            >
              Firebase Console खोलें <ExternalLink className="inline h-3 w-3" />
            </a>
          </div>

          {message && (
            <div className="break-words rounded-lg border border-emerald-600 bg-emerald-900/50 p-3 text-sm text-emerald-100">
              <Check className="mr-2 inline h-4 w-4" />
              {message}
            </div>
          )}

          {error && (
            <div className="break-words rounded-lg border border-red-600 bg-red-950/50 p-3 text-sm text-red-200">
              <AlertTriangle className="mr-2 inline h-4 w-4" />
              {error}
            </div>
          )}

          <p className="text-xs text-emerald-400">
            इस सत्र में सूचीबद्ध कार्यकर्ता: {workers.length}
          </p>
        </div>

        <div className="flex justify-end border-t border-emerald-800 bg-emerald-900/60 p-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
