import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, ChevronDown, Bell, User } from 'lucide-react';
import NotificationPanel from '../shared/NotificationPanel';

const DEMO_ROLES = [
  { role: 'AGENT',    label: 'Agent Office',       color: '#0A2540' },
  { role: 'GFSU_AC',  label: 'GFSU-AC Analyst',    color: '#7C3AED' },
  { role: 'CAC',      label: 'CAC Executive',       color: '#0369A1' },
  { role: 'TREASURY', label: 'SG Treasury',         color: '#B45309' },
  { role: 'SG_AP',    label: 'SG AP / Creditors',   color: '#16A34A' },
  { role: 'ADMIN',    label: 'System Admin',        color: '#DC2626' },
];

function getRoleLabel(role: string, officeCode?: string | null) {
  const map: Record<string, string> = {
    AGENT: 'Agent',
    GFSU_AC: 'GFSU-AC',
    CAC: 'CAC',
    TREASURY: 'Treasury',
    SG_AP: 'SG AP',
    ADMIN: 'Admin',
  };
  const base = map[role] || role;
  return officeCode ? `${base} (${officeCode})` : base;
}

export default function AppShell() {
  const { user, logout, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  if (!user) return null;

  async function handleSwitchRole(role: string) {
    setRoleMenuOpen(false);
    setSwitching(true);
    try {
      await loginAsRole(role);
      navigate('/');
    } finally {
      setSwitching(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const currentRoleLabel = DEMO_ROLES.find(r => r.role === user.role)?.label || user.role;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F3F4F6', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Header ── */}
      <header style={{ background: '#0A2540', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'white', borderRadius: 6, padding: '5px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 18, height: 18, background: '#DC2626', borderRadius: 2 }} />
              <span style={{ fontWeight: 900, fontSize: 13, color: '#0A2540', letterSpacing: '0.04em' }}>PIL</span>
            </div>
            <div>
              <p style={{ color: 'white', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1.2 }}>
                PIL PRE-FUNDING &amp; ASA SETTLEMENT PORTAL
              </p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9.5, letterSpacing: '0.08em', marginTop: 1 }}>
                Pacific International Lines — Global Financial Operations
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Office Code pill — only for AGENT */}
            {user.assignedOfficeCode && (
              <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 700, letterSpacing: '0.04em' }}>
                {user.assignedOfficeCode}
              </div>
            )}

            {/* Notifications */}
            <NotificationPanel />

            {/* User name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 10px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={13} color="white" />
              </div>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{user.fullName}</span>
            </div>

            {/* Role Switcher */}
            <div style={{ position: 'relative' }}>
              <button
                id="switch-role-btn"
                onClick={() => setRoleMenuOpen(o => !o)}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 8, padding: '6px 12px', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, minWidth: 170 }}
              >
                <span style={{ flex: 1, textAlign: 'left' }}>{switching ? 'Switching…' : getRoleLabel(user.role, user.assignedOfficeCode)}</span>
                <ChevronDown size={13} />
              </button>

              {roleMenuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setRoleMenuOpen(false)} />
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.14)', zIndex: 200, width: 210, overflow: 'hidden' }}>
                    {DEMO_ROLES.map(({ role, label, color }) => (
                      <button
                        key={role}
                        id={`switch-${role.toLowerCase()}`}
                        onClick={() => handleSwitchRole(role)}
                        style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 14px', background: role === user.role ? '#F0F9FF' : 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: role === user.role ? color : '#374151', fontWeight: role === user.role ? 700 : 400, textAlign: 'left', transition: 'background 0.1s' }}
                        onMouseEnter={e => { if (role !== user.role) e.currentTarget.style.background = '#F9FAFB'; }}
                        onMouseLeave={e => { if (role !== user.role) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: role === user.role ? color : '#D1D5DB', flexShrink: 0 }} />
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Logout */}
            <button
              id="logout-btn"
              onClick={handleLogout}
              title="Logout"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.75)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: '12px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 10.5, color: '#9CA3AF', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
          Pacific International Lines — Group Finance · PIL Pre-Funding & ASA Settlement Portal
        </p>
      </footer>
    </div>
  );
}
