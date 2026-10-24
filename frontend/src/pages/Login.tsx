import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ChevronDown } from 'lucide-react';

const DEMO_ROLES = [
  { role: 'AGENT', label: 'Agent Office', desc: 'Submit payment requests, track status', email: 'agent.demo@pil-portal.com' },
  { role: 'GFSU_AC', label: 'GFSU-AC Analyst', desc: 'Verify, claim, and forward requests', email: 'gfsu.demo@pil-portal.com' },
  { role: 'CAC', label: 'CAC Executive', desc: 'Review and approve payments', email: 'cac.demo@pil-portal.com' },
  { role: 'TREASURY', label: 'SG Treasury', desc: 'Authorize payment execution', email: 'treasury.demo@pil-portal.com' },
  { role: 'SG_AP', label: 'SG AP / Creditors', desc: 'Execute payments & upload MT103', email: 'sgap.demo@pil-portal.com' },
  { role: 'ADMIN', label: 'System Admin', desc: 'Master data, users, configuration', email: 'admin.demo@pil-portal.com' },
];

export default function Login() {
  const { login, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Try Password123!');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(role: string) {
    setSelectedDemo(role);
    setLoading(true);
    setError('');
    try {
      await loginAsRole(role);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed. Ensure backend is running.');
      setSelectedDemo(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Left Hero */}
      <div style={{ flex: '0 0 42%', background: 'linear-gradient(160deg, #0A2540 0%, #0d3060 50%, #091d35 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.02) 0%, transparent 50%)', pointerEvents: 'none' }} />
        
        <div>
          {/* Logo chip */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ background: 'white', borderRadius: 8, padding: '6px 10px', fontWeight: 900, fontSize: 14, color: '#0A2540', letterSpacing: '0.05em' }}>PIL</div>
            <div>
              <p style={{ color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Pre-Funding &</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>ASA Settlement Portal</p>
            </div>
          </div>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: 'white', lineHeight: 1.25, fontWeight: 400, marginBottom: 16 }}>Enterprise Financial<br />Workflow Platform</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>A controlled payment pipeline connecting Agent Offices, GFSU-AC, CAC, Treasury, and SG AP across Pacific International Lines' global network.</p>
        </div>

        {/* Pipeline steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['01', 'Agent Office Submits'],
            ['02', 'GFSU-AC Verifies'],
            ['03', 'CAC Approves'],
            ['04', 'SG Treasury Authorizes'],
            ['05', 'GFSU Post-Treasury Verifies'],
            ['06', 'SG AP Disburses & Uploads SWIFT MT103'],
          ].map(([num, label]) => (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>{num}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Pacific International Lines — Group Finance</p>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: '#F8F9FA', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#0A2540', marginBottom: 6 }}>Sign In</h2>
            <p style={{ fontSize: 13, color: '#64748B' }}>Enter your credentials or use a demo account below.</p>
          </div>

          {/* Credential form */}
          <form onSubmit={handleLogin} style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #E2E8F0', marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Email Address</label>
              <input id="login-email" className="form-input" type="email" placeholder="you@pil.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Password</label>
              <input id="login-password" className="form-input" type="password" placeholder="Password123!" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {error && <div style={{ marginBottom: 16, padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>{error}</div>}
            <button id="login-submit" type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px 18px' }} disabled={loading}>
              <Lock size={14} />{loading && !selectedDemo ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Role Switcher */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Demo Accounts</span>
              <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DEMO_ROLES.map(({ role, label, desc, email: demoEmail }) => (
                <button
                  key={role}
                  id={`demo-${role.toLowerCase()}`}
                  onClick={() => handleDemoLogin(role)}
                  disabled={loading}
                  style={{ background: 'white', border: `2px solid ${selectedDemo === role ? '#0A2540' : '#E2E8F0'}`, borderRadius: 10, padding: '12px 14px', cursor: loading ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.2s', opacity: loading && selectedDemo !== role ? 0.6 : 1 }}
                >
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0A2540', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>{desc}</p>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 16 }}>All demo accounts use password: <strong>Password123!</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
