import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export function AdminLogin({ user, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('एडमिन लॉगिन सफल रहा!');
      if (onClose) onClose();
    } catch (err) {
      setError('गलत ईमेल या पासवर्ड! कृपया दोबारा प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    alert('आप सफलतापूर्वक लॉगआउट हो चुके हैं।');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>🔐 AIMIM एडमिन पोर्टल</h2>
          {onClose && <button style={styles.closeBtn} onClick={onClose}>✕</button>}
        </div>

        {user ? (
          <div style={styles.loggedInBox}>
            <p style={{ color: '#2e7d32', fontWeight: 'bold' }}>
              ✓ आप लॉग इन हैं:
            </p>
            <p>{user.email}</p>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              लॉगआउट करें
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={styles.form}>
            {error && <p style={styles.error}>{error}</p>}
            
            <div style={styles.inputGroup}>
              <label>एडमिन ईमेल ID</label>
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
              <label>पासवर्ड</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '16px'
  },
  card: {
    backgroundColor: '#052e16',
    border: '1px solid #15803d',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '400px',
    color: '#ffffff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  input: {
    padding: '10px 12px', borderRadius: '6px', border: '1px solid #16a34a',
    backgroundColor: '#022c22', color: '#fff', fontSize: '14px'
  },
  submitBtn: {
    padding: '12px', backgroundColor: '#eab308', color: '#000', border: 'none',
    borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px'
  },
  loggedInBox: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' },
  logoutBtn: { padding: '10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  error: { color: '#ef4444', fontSize: '13px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }
};
