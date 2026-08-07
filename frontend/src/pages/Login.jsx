import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="glass-card">
        <div style={styles.logo}>
          <Cpu size={32} color="#fff" />
        </div>
        <h2 style={styles.title}>Enterprise AI Platform</h2>
        <p style={styles.subtitle}>Sign in to access unified gateway control plane</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              required
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@enterprise.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient"
            style={styles.submitBtn}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={16} style={{ marginLeft: 8 }} />}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-dark)',
    background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 32px',
    textAlign: 'center',
  },
  logo: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'var(--accent-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 0 24px rgba(99, 102, 241, 0.4)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '28px',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    fontSize: '13px',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  submitBtn: {
    padding: '12px',
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  footerText: {
    marginTop: '24px',
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
};
