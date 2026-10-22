import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { AdminLogin } from './components/AdminLogin';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
      {/* 1. शीर्ष हेडर बार (Top Navigation Header) */}
      <header className="sticky top-0 z-40 bg-emerald-950/90 backdrop-blur-md border-b border-emerald-800/50 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-800 border border-amber-400 flex items-center justify-center font-bold text-amber-300 text-sm shadow">
            AIMIM
          </div>
          <div>
            <h1 className="text-base font-bold text-amber-400 leading-tight">
              AIMIM Workers
            </h1>
            <p className="text-[10px] text-emerald-300 font-medium">
              जिला सहारनपुर (कमेटी एवं संगठन)
            </p>
          </div>
        </div>

        {/* राइट साइड: एडमिन लॉगिन बटन */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-300 border border-emerald-600 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            {currentUser ? '👤 एडमिन (लॉग इन)' : '🔐 एडमिन लॉगिन'}
          </button>
        </div>
      </header>

      {/* 2. मुख्य कंटेंट (Main Content Body) */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-700/50 text-center mb-6">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full border border-amber-500/30 mb-2">
            आधिकारिक जिला पोर्टल • उत्तर प्रदेश
          </span>
          <h2 className="text-xl font-bold text-white mb-1">
            AIMIM जिलाध्यक्ष व कार्यकर्ता नेटवर्क
          </h2>
          <p className="text-xs text-slate-300">
            सहारनपुर के सभी 7 विधानसभा क्षेत्रों के कार्यकर्ताओं एवं पदाधिकारियों का एकीकृत डिजिटल डैशबोर्ड।
          </p>
        </div>

        {/* यहाँ आपके वर्कर्स / पदाधिकारियों की लिस्ट और फॉर्म का कंपोनेंट आएगा */}
      </main>

      {/* 3. एडमिन लॉगिन पॉप-अप मोडल */}
      {showLoginModal && (
        <AdminLogin
          user={currentUser}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
