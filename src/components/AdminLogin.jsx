import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export function AdminLogin({ user, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      setError('कृपया ईमेल और पासवर्ड दोनों दर्ज करें।');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      alert('सफलतापूर्वक एडमिन लॉगिन हो गया!');
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      setError('गलत ईमेल या पासवर्ड! कृपया दोबारा जांचें।');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      alert('आप सफलतापूर्वक लॉगआउट हो चुके हैं।');
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>🔐 एडमिन लॉगिन</h2>
          {onClose && (
            <button style={styles.closeBtn} onClick={onClose} type="button">
              ✕
            </button>
          )}
        </div>

        {user ? (
          <div style={styles.loggedInBox}>
            <p style={{ color: '#4ade80', fontWeight: 'bold', margin: 0 }}>
              ✓ आप वर्तमान में लॉग इन हैं
            </p>
            <p style={{ fontSize: '14px', color: '#cbd5e1', wordBreak: 'break-all' }}>
              {user.email}
            </p>
            <button onClick={handleLogout} style={styles.logoutBtn} type="button">
              लॉगआउट करें
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={styles.form}>
            {error && <p style={styles.error}>{error}</p>}

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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              onClick={handleLogin}
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'सत्यापित हो रहा है...' : 'लॉग इन करें'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '16px'
  },
  card: {
    backgroundColor: '#022c22',
    border: '1px solid #16a34a',
    borderRadius: '12px',
    padding: '20px',
    width: '100%',
    maxWidth: '360px',
    color: '#ffffff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', padding: '4px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '12px', color: '#6ee7b7' },
  input: {
    padding: '10px 12px', borderRadius: '6px', border: '1px solid #15803d',
    backgroundColor: '#052e16', color: '#fff', fontSize: '14px', outline: 'none'
  },
  submitBtn: {
    padding: '12px', backgroundColor: '#eab308', color: '#000', border: 'none',
    borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', marginTop: '6px'
  },
  loggedInBox: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' },
  logoutBtn: { padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' },
  error: { color: '#fca5a5', fontSize: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '4px', margin: 0 }
};
