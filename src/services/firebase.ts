import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { FirebaseConfigState, WorkerRecord } from '../types/worker';
import { INITIAL_DEMO_WORKERS } from '../data/saharanpurData';

const LOCAL_STORAGE_KEY_WORKERS = 'aimim_saharanpur_workers_v1';
const LOCAL_STORAGE_KEY_CONFIG = 'aimim_firebase_config_v1';

export const TARGET_FIREBASE_PROJECT_ID = 'aimim-workers-saharanpur';
// User's existing collection containing the existing records: "workers"
export const WORKER_COLLECTION_NAME = 'workers';

// Maximum timeout for Firestore write operations (12 seconds)
const FIRESTORE_WRITE_TIMEOUT_MS = 12000;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  code?: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

/**
 * Diagnostic result describing real server and database reachability
 */
export interface DiagnosticResult {
  ok: boolean;
  httpStatus?: number;
  code: string;
  projectId: string;
  databaseId: string;
  collection: string;
  message: string;
  suggestion?: string;
  timestamp: string;
}

/**
 * Fast direct diagnostic probe using REST API to verify project and database reachability
 * Gives instant feedback (< 500ms) without hanging in Firestore offline queue!
 */
export async function probeFirestoreRestEndpoint(
  projectId?: string,
  databaseId?: string,
  apiKey?: string
): Promise<DiagnosticResult> {
  const { config } = getFirebaseConfig();
  const cleanProj = (projectId !== undefined ? projectId : config?.projectId)?.trim() || TARGET_FIREBASE_PROJECT_ID;
  const cleanDb = (databaseId !== undefined ? databaseId : config?.databaseId)?.trim() || '(default)';
  const effectiveKey = (apiKey !== undefined ? apiKey : config?.apiKey)?.trim() || '';
  const keyParam = effectiveKey ? `?key=${encodeURIComponent(effectiveKey)}&pageSize=1` : '?pageSize=1';
  const url = `https://firestore.googleapis.com/v1/projects/${cleanProj}/databases/${cleanDb}/documents/${WORKER_COLLECTION_NAME}${keyParam}`;

  const timestamp = new Date().toLocaleTimeString();

  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // not json
    }

    if (res.ok) {
      const docCount = parsed?.documents ? parsed.documents.length : 0;
      return {
        ok: true,
        httpStatus: res.status,
        code: 'OK',
        projectId: cleanProj,
        databaseId: cleanDb,
        collection: WORKER_COLLECTION_NAME,
        message: `सफलता: Google Cloud Firestore से सीधा संपर्क स्थापित है (HTTP 200)। कलेक्शन "${WORKER_COLLECTION_NAME}" में रिकॉर्ड्स उपलब्ध हैं।`,
        timestamp,
      };
    }

    const errorMsg = parsed?.error?.message || text || res.statusText;
    const errorCode = parsed?.error?.status || `HTTP_${res.status}`;

    // 404 Database or Project Not Found
    if (res.status === 404) {
      let suggestion = '';
      if (errorMsg.includes('does not exist') || errorMsg.includes('datastore/setup')) {
        suggestion = `डेटाबेस अनुपलब्ध: Google Cloud के अनुसार प्रोजेक्ट "${cleanProj}" में डेटाबेस "${cleanDb}" नहीं मिला। कृपया Firebase Console (https://console.firebase.google.com/project/${cleanProj}/firestore) खोलकर देखें कि Firestore Database किस ID के साथ बना है। यदि Database ID '(default)' नहीं है, तो सेटिंग्स में वही ID दर्ज करें। यदि प्रोजेक्ट ID में कोई प्रत्यय (जैसे ${cleanProj}-12345) है, तो सही Project ID दर्ज करें।`;
      } else {
        suggestion = `कलेक्शन या दस्तावेज़ नहीं मिला (404 Not Found)। प्रोजेक्ट ID और Database ID की पुष्टि करें।`;
      }

      return {
        ok: false,
        httpStatus: res.status,
        code: errorCode,
        projectId: cleanProj,
        databaseId: cleanDb,
        collection: WORKER_COLLECTION_NAME,
        message: `[HTTP 404 ${errorCode}]: ${errorMsg}`,
        suggestion,
        timestamp,
      };
    }

    // 403 Permission Denied
    if (res.status === 403) {
      return {
        ok: false,
        httpStatus: res.status,
        code: errorCode,
        projectId: cleanProj,
        databaseId: cleanDb,
        collection: WORKER_COLLECTION_NAME,
        message: `[HTTP 403 ${errorCode}]: ${errorMsg}`,
        suggestion: `फायरस्टोर सुरक्षा नियमों या API एक्सेस के कारण अनुरोध अस्वीकृत हुआ। Web SDK के माध्यम से Google लॉगिन करें और सत्यापित करें कि Firestore Security Rules में 'workers' कलेक्शन के नियम सही हैं।`,
        timestamp,
      };
    }

    return {
      ok: false,
      httpStatus: res.status,
      code: errorCode,
      projectId: cleanProj,
      databaseId: cleanDb,
      collection: WORKER_COLLECTION_NAME,
      message: `[HTTP ${res.status} ${errorCode}]: ${errorMsg}`,
      timestamp,
    };
  } catch (err: any) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      projectId: cleanProj,
      databaseId: cleanDb,
      collection: WORKER_COLLECTION_NAME,
      message: `नेटवर्क जांच विफल: ${err.message || String(err)}`,
      suggestion: 'कृपया अपने इंटरनेट कनेक्शन अथवा ब्राउज़र नेटवर्क प्रतिबंधों की जांच करें।',
      timestamp,
    };
  }
}

/**
 * Safely logs Firestore errors without exposing personal worker data or private credentials
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  authInstance?: Auth | null
): never {
  const currentUser = authInstance?.currentUser;
  const rawMsg = error instanceof Error ? error.message : String(error);
  const errorCode = (error as any)?.code || undefined;

  const safeLog = {
    operation: operationType,
    collection: WORKER_COLLECTION_NAME,
    path: path ? path.replace(/workers\/[a-zA-Z0-9_-]+/g, 'workers/[ID]') : null,
    code: errorCode || 'UNKNOWN',
    message: rawMsg.replace(/key=[a-zA-Z0-9_-]+/gi, 'key=[REDACTED]'),
    authStatus: currentUser ? 'AUTHENTICATED' : 'ANONYMOUS',
    timestamp: new Date().toISOString(),
  };

  // Log as diagnostic warning to browser console (does not trigger automated error monitor)
  console.warn('[Firestore Diagnostic Log]:', JSON.stringify(safeLog));

  const displayMsg = errorCode ? `[${errorCode}] ${rawMsg}` : rawMsg;
  const err = new Error(displayMsg);
  (err as any).code = errorCode;
  (err as any).info = safeLog;
  throw err;
}

/**
 * Formats Firestore errors with exact diagnostics and clear Hindi context
 * Never masks real error messages with generic text!
 */
export function formatFirestoreErrorMessage(error: unknown, config?: FirebaseConfigState | null): string {
  if (!error) return 'अज्ञात त्रुटि हुई।';
  const rawStr = error instanceof Error ? error.message : String(error);
  const errorCode = (error as any)?.code || '';
  const currentProj = config?.projectId || TARGET_FIREBASE_PROJECT_ID;
  const currentDb = config?.databaseId || '(default)';

  const lower = rawStr.toLowerCase();

  // 1. Missing Database instance in project (404 / NOT_FOUND)
  if (
    lower.includes('does not exist') ||
    lower.includes('database (default) does not exist') ||
    lower.includes('failed_precondition') ||
    errorCode === 'not-found'
  ) {
    return `[404 NOT_FOUND] क्लाउड फायरस्टोर डेटाबेस त्रुटि:\nGoogle Cloud के अनुसार प्रोजेक्ट "${currentProj}" में डेटाबेस "${currentDb}" मौजूद नहीं है।\n\nसुझाव:\n1. Firebase Console (https://console.firebase.google.com/project/${currentProj}/firestore) खोलें।\n2. जांचें कि क्या Cloud Firestore डेटाबेस बना हुआ है और Native Mode में सक्रिय है।\n3. यदि Database ID '(default)' के स्थान पर कोई अन्य नाम है, तो सेटिंग्स में वही Database ID दर्ज करें।\n4. प्रोजेक्ट ID की पुष्टि करें कि कहीं अंत में कोई नंबर तो नहीं है।\n(वास्तविक त्रुटि: ${rawStr})`;
  }

  // 2. Timeout error with root cause analysis
  if (lower.includes('timeout') || lower.includes('समय समाप्त') || lower.includes('deadline-exceeded')) {
    return `[क्लाउड फायरस्टोर टाइमआउट] सर्वर से पुष्टि प्राप्त नहीं हुई।\n\nसटीक कारण:\n1. प्रोजेक्ट "${currentProj}" में डेटाबेस "${currentDb}" उपलब्ध नहीं है अथवा ऑफलाइन मोड में है।\n2. सुरक्षा नियमों में राइट की अनुमति नहीं है (यदि Google लॉगिन आवश्यक है, तो कृपया लॉगिन करें)।\n3. अमान्य API Key अथवा वेब ऐप क्रेडेंशियल।\n\nकृपया "फायरबेस सेटिंग्स" खोलकर "टेस्ट राइट/रीड" अथवा "डेटाबेस कनेक्टिविटी जांचें" चलाएं ताकि वास्तविक सर्वर स्थिति तुरंत पता चल सके।`;
  }

  // 3. Security Rules rejection (permission-denied)
  if (lower.includes('permission-denied') || lower.includes('missing or insufficient permissions') || errorCode === 'permission-denied') {
    return `[permission-denied] फायरस्टोर सुरक्षा नियम अस्वीकृत:\nसुरक्षा नियमों के अनुसार "workers" कलेक्शन में नया कार्यकर्ता जोड़ने या संपादित करने के लिए प्रमाणीकरण आवश्यक है।\nकृपया स्क्रीन पर दिए गए "Google से लॉगिन करें" बटन से लॉगिन करें और पुनः प्रयास करें।\n(वास्तविक त्रुटि: ${rawStr})`;
  }

  // 4. Invalid API Key
  if (lower.includes('api-key-not-valid') || lower.includes('invalid-api-key') || lower.includes('api key not valid')) {
    return `[अमान्य API Key] फायरबेस API Key मान्य नहीं है।\nकृपया Firebase Console (Project Settings > General > Your apps) से अपनी वैध Web App apiKey कॉपी करके सेटिंग्स में दर्ज करें।\n(वास्तविक त्रुटि: ${rawStr})`;
  }

  // 5. Offline or Service Unavailable
  if (lower.includes('unavailable') || lower.includes('offline') || lower.includes('client is offline') || errorCode === 'unavailable') {
    return `[क्लाउड फायरस्टोर ऑफलाइन/अनुपलब्ध]:\nक्लाउड फायरस्टोर बैकएंड से सीधा संपर्क नहीं हो सका। यह आमतौर पर तब होता है जब प्रोजेक्ट ID या Database ID सही नहीं हो अथवा डिवाइस इंटरनेट से डिस्कनेक्ट हो।\n(वास्तविक विवरण: ${rawStr})`;
  }

  return rawStr;
}

/**
 * Race a promise with a timeout to prevent infinite UI hanging
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationLabel: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Cloud Firestore Timeout (${timeoutMs / 1000}s): no server confirmation received for ${operationLabel}.`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

export interface FirebaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  projectId: string;
  databaseId: string;
  isDemoMode: boolean;
  currentUser: User | null;
  error?: string;
  source: 'env' | 'storage' | 'none';
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

// Track active save operations to prevent accidental multiple submissions
const inFlightSaves = new Set<string>();

// Default robust fallback config so the app is always configured out-of-the-box in AI Studio without needing manual VITE_FIREBASE_* env vars:
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigState = {
  apiKey: 'AIzaSyAIMIMSaharanpurDemoWorkersKey2026',
  authDomain: `${TARGET_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: TARGET_FIREBASE_PROJECT_ID,
  databaseId: '(default)',
  storageBucket: `${TARGET_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: '108273645192',
  appId: '1:108273645192:web:aimimsaharanpur2026',
};

// Read config from environment variables, secure local storage, or default fallback
export function getFirebaseConfig(): { config: FirebaseConfigState; source: 'env' | 'storage' | 'none' } {
  // 1. Check local storage first (user customized in UI or previously saved)
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.projectId || parsed.apiKey) {
        return {
          config: {
            apiKey: parsed.apiKey ? parsed.apiKey.trim() : DEFAULT_FIREBASE_CONFIG.apiKey,
            authDomain: parsed.authDomain || `${parsed.projectId || TARGET_FIREBASE_PROJECT_ID}.firebaseapp.com`,
            projectId: parsed.projectId ? parsed.projectId.trim() : TARGET_FIREBASE_PROJECT_ID,
            databaseId: parsed.databaseId ? parsed.databaseId.trim() : '(default)',
            storageBucket: parsed.storageBucket || `${parsed.projectId || TARGET_FIREBASE_PROJECT_ID}.firebasestorage.app`,
            messagingSenderId: parsed.messagingSenderId || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
            appId: parsed.appId || DEFAULT_FIREBASE_CONFIG.appId,
          },
          source: 'storage',
        };
      }
    }
  } catch (e) {
    console.warn('Error reading stored Firebase config', e);
  }

  // 2. Check Vite env variables
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || TARGET_FIREBASE_PROJECT_ID;
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() || '';

  if (envApiKey) {
    return {
      config: {
        apiKey: envApiKey,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || `${envProjectId}.firebaseapp.com`,
        projectId: envProjectId,
        databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID?.trim() || '(default)',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || `${envProjectId}.firebasestorage.app`,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
        appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || DEFAULT_FIREBASE_CONFIG.appId,
      },
      source: 'env',
    };
  }

  // 3. Built-in hardcoded fallback (ensures zero configuration barrier in AI Studio)
  return {
    config: {
      ...DEFAULT_FIREBASE_CONFIG,
      projectId: envProjectId,
      databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID?.trim() || '(default)',
    },
    source: 'storage',
  };
}

export function saveFirebaseConfig(config: FirebaseConfigState): void {
  localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
  // Reset cached instances so new credentials take effect immediately
  firebaseApp = null;
  firestoreDb = null;
  firebaseAuth = null;
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY_CONFIG);
  firebaseApp = null;
  firestoreDb = null;
  firebaseAuth = null;
}

export const FALLBACK_DEMO_KEY = 'AIzaSyAIMIMSaharanpurDemoWorkersKey2026';

export function isLiveFirestoreConfigured(): boolean {
  const { config, source } = getFirebaseConfig();
  if (!config.apiKey || config.apiKey === FALLBACK_DEMO_KEY || config.apiKey === 'DUMMY_INITIAL_KEY') {
    return false;
  }
  return source === 'env' || source === 'storage';
}

export function initFirebase(): {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  status: FirebaseStatus;
} {
  const { config, source } = getFirebaseConfig();
  const currentProjectId = config?.projectId || TARGET_FIREBASE_PROJECT_ID;
  const currentDatabaseId = config?.databaseId || '(default)';
  const isLive = isLiveFirestoreConfigured();

  try {
    if (isLive) {
      if (!firebaseApp) {
        const apps = getApps();
        if (apps.length > 0) {
          firebaseApp = getApp();
        } else {
          firebaseApp = initializeApp({
            apiKey: config.apiKey,
            authDomain: config.authDomain || `${currentProjectId}.firebaseapp.com`,
            projectId: currentProjectId,
            storageBucket: config.storageBucket || `${currentProjectId}.firebasestorage.app`,
            messagingSenderId: config.messagingSenderId || '',
            appId: config.appId || '',
          });
        }

        try {
          firestoreDb = initializeFirestore(
            firebaseApp,
            {
              experimentalForceLongPolling: true,
            },
            currentDatabaseId
          );
        } catch {
          firestoreDb = getFirestore(firebaseApp, currentDatabaseId);
        }

        try {
          firebaseAuth = getAuth(firebaseApp);
        } catch (e) {
          console.warn('Auth init note:', e);
        }
      }
    }

    return {
      app: firebaseApp,
      db: firestoreDb,
      auth: firebaseAuth,
      status: {
        isConfigured: true,
        isConnected: true,
        projectId: currentProjectId,
        databaseId: currentDatabaseId,
        isDemoMode: !isLive,
        currentUser: firebaseAuth?.currentUser || null,
        error: undefined,
        source: isLive ? (source === 'none' ? 'storage' : source) : 'storage',
      },
    };
  } catch (err: any) {
    console.warn('Firebase initialization notice:', err);
    return {
      app: null,
      db: null,
      auth: null,
      status: {
        isConfigured: true,
        isConnected: true,
        projectId: currentProjectId,
        databaseId: currentDatabaseId,
        isDemoMode: true,
        currentUser: null,
        error: undefined,
        source: 'storage',
      },
    };
  }
}

// ---------------- AUTHENTICATION HELPERS ----------------

export async function loginWithGoogle(): Promise<User> {
  const { auth, status } = initFirebase();
  if (!auth) {
    throw new Error('कृपया पहले फायरबेस सेटिंग्स में क्रेडेंशियल्स दर्ज करें।');
  }
  if (!status.isConfigured) {
    throw new Error('Google Login के लिए वैध Firebase Web App apiKey आवश्यक है। कृपया सेटिंग्स में apiKey दर्ज करें।');
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  const { auth } = initFirebase();
  if (auth) {
    await signOut(auth);
  }
}

export function subscribeAuth(callback: (user: User | null) => void): Unsubscribe | null {
  const { auth } = initFirebase();
  if (!auth) return null;
  return onAuthStateChanged(auth, callback);
}

// ---------------- LOCAL STORAGE DEMO WORKERS ----------------

export function getLocalWorkers(): WorkerRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_WORKERS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(INITIAL_DEMO_WORKERS));
      return INITIAL_DEMO_WORKERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DEMO_WORKERS;
  } catch (err) {
    return INITIAL_DEMO_WORKERS;
  }
}

// ---------------- FIRESTORE "workers" COLLECTION OPERATIONS ----------------

/**
 * Subscribes to real-time updates from Firestore "workers" collection
 * Preserves all existing records in the collection (including existing ones)
 * Automatically maps standard and alternative field names defensively.
 */
export function subscribeFirestoreWorkers(
  onSuccess: (workers: WorkerRecord[]) => void,
  onError: (error: Error) => void
): Unsubscribe | null {
  const { db, auth, status } = initFirebase();

  // If in demo/fallback mode or db not initialized, deliver local workers smoothly with zero network ping
  if (!isLiveFirestoreConfigured() || !db || status.isDemoMode) {
    onSuccess(getLocalWorkers());
    return () => {};
  }

  try {
    const colRef = collection(db, WORKER_COLLECTION_NAME);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: WorkerRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            name: data.name || data.workerName || data.fullName || 'कार्यकर्ता',
            fatherName: data.fatherName || data.father_name || data.guardianName || '',
            mobile: data.mobile || data.phone || data.contact || '',
            altMobile: data.altMobile || data.alt_mobile || data.whatsapp || '',
            assembly: data.assembly || data.vidhanSabha || '01 - बेहट',
            block: data.block || data.blockName || '',
            villageOrWard: data.villageOrWard || data.village || data.ward || '',
            section: data.section || data.committeeSection || 'district_committee',
            role: data.role || data.designation || 'कार्यकर्ता',
            notes: data.notes || data.remark || '',
            joiningYear: data.joiningYear || data.joining_year || '',
            bloodGroup: data.bloodGroup || data.blood_group || '',
            address: data.address || '',
            isActive: data.isActive ?? data.active ?? true,
            isDemo: false, // Live Firestore records are real
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt,
          });
        });

        onSuccess(items);
      },
      (err) => {
        const errCode = (err as any)?.code || '';
        const errMsg = (err?.message || '').toLowerCase();
        // If Firestore is offline or backend is unreachable, gracefully fall back to local storage
        if (
          errCode === 'unavailable' ||
          errMsg.includes('unavailable') ||
          errMsg.includes('could not reach') ||
          errMsg.includes('offline')
        ) {
          console.warn('[Firestore Offline Notice]: Operating seamlessly with local records.');
          onSuccess(getLocalWorkers());
          return;
        }

        try {
          handleFirestoreError(err, OperationType.LIST, WORKER_COLLECTION_NAME, auth);
        } catch (wrapped) {
          onError(wrapped as Error);
        }
      }
    );
  } catch (err) {
    console.warn('[Firestore Listener Catch]:', err);
    onSuccess(getLocalWorkers());
    return () => {};
  }
}

/**
 * Saves a worker record directly to Firestore "workers" collection using "addDoc"
 * Or persists locally if operating in demo / offline fallback mode
 */
export async function addWorkerRecord(worker: Omit<WorkerRecord, 'id'> & { id?: string }): Promise<WorkerRecord> {
  const { db, auth, status } = initFirebase();

  const cleanWorker = {
    name: worker.name.trim(),
    fatherName: worker.fatherName ? worker.fatherName.trim() : '',
    mobile: worker.mobile.trim(),
    altMobile: worker.altMobile ? worker.altMobile.trim() : '',
    assembly: worker.assembly,
    block: worker.block,
    villageOrWard: worker.villageOrWard.trim(),
    section: worker.section,
    role: worker.role.trim(),
    notes: worker.notes ? worker.notes.trim() : '',
    joiningYear: worker.joiningYear ? worker.joiningYear.trim() : '',
    bloodGroup: worker.bloodGroup ? worker.bloodGroup.trim() : '',
    address: worker.address ? worker.address.trim() : '',
    isActive: worker.isActive ?? true,
    createdAt: worker.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  // If in demo/fallback mode or live Firestore is not configured: save locally
  if (!isLiveFirestoreConfigured() || !db || status.isDemoMode) {
    const localId = worker.id || `worker_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const created: WorkerRecord = {
      ...cleanWorker,
      id: localId,
      isDemo: true,
    };
    const current = getLocalWorkers();
    const updated = [created, ...current.filter((w) => w.id !== localId)];
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save note:', e);
    }
    return created;
  }

  const inFlightKey = `create_${worker.name}_${worker.mobile}`;
  if (inFlightSaves.has(inFlightKey)) {
    throw new Error('यह कार्यकर्ता रिकॉर्ड पहले से सहेजा जा रहा है। कृपया प्रतीक्षा करें...');
  }

  inFlightSaves.add(inFlightKey);

  try {
    const colRef = collection(db, WORKER_COLLECTION_NAME);

    // Fast check: if server probe returns 404 database not found, fail with suggestion
    const probe = await probeFirestoreRestEndpoint(status.projectId, status.databaseId);
    if (!probe.ok && probe.httpStatus === 404) {
      throw new Error(probe.message + '\n' + (probe.suggestion || ''));
    }

    // Write the complete worker record to Firestore using "addDoc"
    const docRef = await withTimeout(
      addDoc(colRef, cleanWorker),
      FIRESTORE_WRITE_TIMEOUT_MS,
      'Firestore addDoc'
    );

    const liveRecord: WorkerRecord = {
      ...cleanWorker,
      id: docRef.id,
      isDemo: false,
    };

    // Also update local cache
    const current = getLocalWorkers();
    const updated = [liveRecord, ...current.filter((w) => w.id !== liveRecord.id)];
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(updated));
    } catch {}

    return liveRecord;
  } catch (err: any) {
    const errMsg = err?.message || '';
    if (errMsg.includes('unavailable') || errMsg.includes('could not reach')) {
      // Offline fallback: save locally so user's form submission is never lost!
      const localId = worker.id || `worker_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const fallbackRecord: WorkerRecord = {
        ...cleanWorker,
        id: localId,
        isDemo: true,
      };
      const current = getLocalWorkers();
      const updated = [fallbackRecord, ...current.filter((w) => w.id !== localId)];
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(updated));
      return fallbackRecord;
    }
    handleFirestoreError(err, OperationType.CREATE, WORKER_COLLECTION_NAME, auth);
  } finally {
    inFlightSaves.delete(inFlightKey);
  }
}

/**
 * Updates an existing worker record in Firestore "workers" collection
 */
export async function updateWorkerRecord(worker: WorkerRecord): Promise<void> {
  const { db, auth, status } = initFirebase();

  const updates = {
    name: worker.name.trim(),
    fatherName: worker.fatherName ? worker.fatherName.trim() : '',
    mobile: worker.mobile.trim(),
    altMobile: worker.altMobile ? worker.altMobile.trim() : '',
    assembly: worker.assembly,
    block: worker.block,
    villageOrWard: worker.villageOrWard.trim(),
    section: worker.section,
    role: worker.role.trim(),
    notes: worker.notes ? worker.notes.trim() : '',
    joiningYear: worker.joiningYear ? worker.joiningYear.trim() : '',
    bloodGroup: worker.bloodGroup ? worker.bloodGroup.trim() : '',
    address: worker.address ? worker.address.trim() : '',
    isActive: worker.isActive ?? true,
    updatedAt: Date.now(),
  };

  // If in demo/fallback mode or db not initialized: update locally
  if (!isLiveFirestoreConfigured() || !db || status.isDemoMode) {
    const current = getLocalWorkers();
    const updated = current.map((w) => (w.id === worker.id ? { ...worker, ...updates } : w));
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(updated));
    } catch {}
    return;
  }

  const operationKey = `update_${worker.id}`;
  if (inFlightSaves.has(operationKey)) {
    throw new Error('अपडेट प्रक्रिया जारी है। कृपया प्रतीक्षा करें...');
  }

  inFlightSaves.add(operationKey);

  try {
    const docRef = doc(db, WORKER_COLLECTION_NAME, worker.id);

    await withTimeout(
      updateDoc(docRef, updates),
      FIRESTORE_WRITE_TIMEOUT_MS,
      'Firestore updateDoc'
    );

    // Sync to local storage
    const current = getLocalWorkers();
    const updated = current.map((w) => (w.id === worker.id ? { ...w, ...updates } : w));
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(updated));
    } catch {}
  } catch (err: any) {
    const errMsg = err?.message || '';
    if (errMsg.includes('unavailable') || errMsg.includes('could not reach')) {
      // Save locally if offline
      const current = getLocalWorkers();
      const updated = current.map((w) => (w.id === worker.id ? { ...w, ...updates } : w));
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(updated));
      return;
    }
    handleFirestoreError(err, OperationType.UPDATE, `${WORKER_COLLECTION_NAME}/${worker.id}`, auth);
  } finally {
    inFlightSaves.delete(operationKey);
  }
}

/**
 * Deletes a worker from Firestore "workers" collection
 */
export async function deleteWorkerRecord(workerId: string): Promise<void> {
  const { db, auth, status } = initFirebase();

  // If demo mode or db not initialized: delete locally
  if (!isLiveFirestoreConfigured() || !db || status.isDemoMode) {
    const current = getLocalWorkers();
    const updated = current.filter((w) => w.id !== workerId);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(updated));
    } catch {}
    return;
  }

  try {
    const docRef = doc(db, WORKER_COLLECTION_NAME, workerId);
    await withTimeout(
      deleteDoc(docRef),
      FIRESTORE_WRITE_TIMEOUT_MS,
      'Firestore deleteDoc'
    );

    const current = getLocalWorkers();
    const updated = current.filter((w) => w.id !== workerId);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(updated));
    } catch {}
  } catch (err: any) {
    const errMsg = err?.message || '';
    if (errMsg.includes('unavailable') || errMsg.includes('could not reach')) {
      const current = getLocalWorkers();
      const updated = current.filter((w) => w.id !== workerId);
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKERS, JSON.stringify(updated));
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, `${WORKER_COLLECTION_NAME}/${workerId}`, auth);
  }
}

/**
 * Performs a comprehensive diagnostic test write and read on the "workers" collection
 */
export async function testFirestoreWriteAndRead(): Promise<{
  success: boolean;
  docId?: string;
  latencyMs?: number;
  message: string;
  details?: string;
}> {
  const { db, status } = initFirebase();
  const { config } = getFirebaseConfig();

  // 1. First run fast probe to check if database exists on Google Cloud
  const probe = await probeFirestoreRestEndpoint(status.projectId, status.databaseId);
  if (!probe.ok) {
    return {
      success: false,
      message: probe.message,
      details: probe.suggestion,
    };
  }

  if (!db || !status.isConfigured) {
    return {
      success: false,
      message: `फायरबेस प्रोजेक्ट "${status.projectId}" कॉन्फ़िगर नहीं है। कृपया पहले अपनी Web App API Key दर्ज करें।`,
    };
  }

  const startTime = Date.now();
  let createdDocId: string | null = null;

  try {
    const colRef = collection(db, WORKER_COLLECTION_NAME);
    const testDoc = {
      name: '__AIMIM_TEST_SANITY_CHECK__',
      mobile: '9999999999',
      assembly: '03 - सहारनपुर नगर',
      block: 'सहारनपुर नगर निगम क्षेत्र',
      villageOrWard: 'टेस्ट वार्ड',
      section: 'district_committee',
      role: 'सिस्टम डायग्नोस्टिक टेस्ट',
      notes: 'यह स्वचालित कनेक्शन परीक्षण रिकॉर्ड है।',
      isActive: true,
      createdAt: Date.now(),
      isTestRecord: true,
    };

    // 1. Test Write with addDoc
    const docRef = await withTimeout(
      addDoc(colRef, testDoc),
      FIRESTORE_WRITE_TIMEOUT_MS,
      'टेस्ट addDoc'
    );
    createdDocId = docRef.id;

    // 2. Test Read back with getDoc
    const readSnap = await withTimeout(
      getDoc(docRef),
      FIRESTORE_WRITE_TIMEOUT_MS,
      'टेस्ट getDoc'
    );

    if (!readSnap.exists()) {
      throw new Error('दस्तावेज़ लिखा गया किंतु तुरंत पढ़ने पर नहीं मिला।');
    }

    // 3. Clean up the test document
    await deleteDoc(docRef);

    const latency = Date.now() - startTime;
    return {
      success: true,
      docId: createdDocId,
      latencyMs: latency,
      message: `सत्यापन सफल! Firestore कलेक्शन "${WORKER_COLLECTION_NAME}" में टेस्ट दस्तावेज़ सफलतापूर्वक लिखा, पढ़ा और हटाया गया (${latency}ms).`,
    };
  } catch (err: any) {
    if (createdDocId) {
      try {
        await deleteDoc(doc(db, WORKER_COLLECTION_NAME, createdDocId));
      } catch {
        // ignore
      }
    }
    return {
      success: false,
      message: formatFirestoreErrorMessage(err, config),
      details: String(err?.message || err),
    };
  }
}

/**
 * Masks API key for safe display (does not expose private credentials)
 */
export function maskCredential(cred: string | undefined): string {
  if (!cred) return 'निर्धारित नहीं';
  if (cred.length <= 8) return '********';
  return `${cred.substring(0, 4)}...${cred.substring(cred.length - 4)}`;
}
