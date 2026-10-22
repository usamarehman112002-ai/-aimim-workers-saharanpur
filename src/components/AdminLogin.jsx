import React, { useState } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect, 
  signOut,
  User 
} from 'firebase/auth';

interface AdminLoginProps {
  user: User | null;
  onClose?: () => void;
}

export function AdminLogin({ user, onClose }: AdminLoginProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // 1. ईमेल और पासवर्ड से लॉगिन
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('कृपया ईमेल और पासवर्ड दर्ज करें।');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      alert('सफलतापूर्वक एडमिन लॉगिन हो गया!');
      if (onClose) onClose();
    } catch (err: any) {
      console.error(err);
      setError('गलत ईमेल या पासवर्ड! कृपया दोबारा जांचें।');
    } finally {
      setLoading(false);
    }
  };

  // 2. गूगल से लॉगिन (मोबाइल फ्रेंडली)
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      // पहले पॉप-अप से प्रयास करें
      await signInWithPopup(auth, provider);
      alert('गूगल से सफलतापूर्वक लॉगिन हो गया!');
      if (onClose) onClose();
    } catch (popupErr: any) {
      console.warn('Popup blocked, falling back to redirect...', popupErr);
      try {
        // अगर पॉप-अप ब्लॉक हो जाए तो रिडायरेक्ट का इस्तेमाल करें
        await signInWithRedirect(auth, provider);
      } catch (redirectErr: any) {
        console.error(redirectErr);
        setError('गूगल लॉगिन में समस्या आई। कृपया ईमेल-पासवर्ड से प्रयास करें।');
        setLoading(false);
      }
    }
  };

  // 3. लॉगआउट
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      alert('आप लॉगआउट हो चुके हैं।');
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ fontSize: '18px', margin: 0, color: '#fbbf24' }}>🔐 एडमिन लॉगिन</h2>
          {onClose && (
            <button style={styles.closeBtn} onClick={onClose} type="button">
              ✕
            </button>
          )}
        </div>

        {user ? (
          <div style={styles.loggedInBox}>
            <p style={{ color: '#4ade80', fontWeight: 'bold', margin: 0 }}>
              ✓ आप एडमिन के रूप में लॉग इन हैं
            </p>
            <p style={{ fontSize: '13px', color: '#cbd5e1', wordBreak: 'break-all' }}>
              {user.email}
            </p>
            <button onClick={handleLogout} style={styles.logoutBtn} type="button">
              लॉगआउट करें
            </button>
          </div>
        ) : (
          <div style={styles.container}>
            {error && <p style={styles.error}>{error}</p>}

            {/* Google Login बटन */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                ...styles.googleBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Google खाते से लॉगिन करें
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerText}>अथवा ईमेल से लॉग इन करें</span>
            </div>

            {/* ईमेल पासवर्ड फॉर्म */}
            <form onSubmit={handleEmailLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>एडमिन ईमेल ID</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usamarehman112002@gmail.com"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>पासवर्ड</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e
