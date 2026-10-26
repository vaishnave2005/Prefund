import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, Edit2, Trash2, Save, X, Settings, Users, Database, FileText } from 'lucide-react';
import api from '../../lib/api';
import { formatDateTime } from '../../lib/utils';

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#111827', background: 'white', outline: 'none', boxSizing: 'border-box' as const };

const TABS = [
  { key: 'agents', label: 'Agent Master', icon: <Database size={15} /> },
  { key: 'users',  label: 'User Provisioning', icon: <Users size={15} /> },
  { key: 'config', label: 'System Config', icon: <Settings size={15} /> },
  { key: 'audit',  label: 'Audit Log', icon: <FileText size={15} /> },
];

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState<'agents' | 'users' | 'config' | 'audit'>('agents');
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>System Administration Console</h1>
        <p style={{ fontSize: 13, color: '#6B7280' }}>Master data management · User provisioning · System configuration · Compliance audit</p>
      </div>

      {/* Tab Bar */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', padding: '0 20px' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 18px', fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500, color: activeTab === t.key ? '#0A2540' : '#6B7280', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t.key ? '#0A2540' : 'transparent'}`, cursor: 'pointer', marginBottom: -1, whiteSpace: 'nowrap' }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          {activeTab === 'agents' && <AgentMasterTab />}
          {activeTab === 'users'  && <UserProvisioningTab />}
          {activeTab === 'config' && <SystemConfigTab />}
          {activeTab === 'audit'  && <AuditLogTab />}
        </div>
      </div>
    </div>
  );
}

/* ── Agent Master ── */
function AgentMasterTab() {
  const [agents, setAgents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/master-data/agents', { params: { page, limit: 20, search } });
      setAgents(res.data.items || []); setTotal(res.data.total || 0);
    } catch (e) {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [page, search]);

  async function handleSave(agent: any) {
    try { await api.put(`/master-data/agents/${agent.agentCode}`, agent); setEditing(null); load(); }
    catch (e: any) { alert(e.response?.data?.message || 'Error saving'); }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 300 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input style={{ ...inputStyle, paddingLeft: 30 }} placeholder="Search agents..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <span style={{ fontSize: 13, color: '#6B7280' }}>{total} offices</span>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #E5E7EB' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['CODE', 'NAME', 'COUNTRY', 'PIC', 'CURRENCY', 'BANK', 'SWIFT', 'ACTIONS'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textAlign: 'left', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading...</td></tr>
            ) : agents.map(agent => (
              <tr key={agent.agentCode} style={{ borderTop: '1px solid #F3F4F6' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#0A2540' }}>{agent.agentCode}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500 }}>{agent.agentName}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151' }}>{agent.country || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151' }}>{agent.pic || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{agent.defaultCurrency || '—'}</span></td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.bankName || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', color: '#374151' }}>{agent.swiftCode || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => setEditing({ ...agent })} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EFF6FF', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#0A2540', fontSize: 12 }}>
                    <Edit2 size={12} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#6B7280' }}>Page {page} of {Math.max(1, Math.ceil(total / 20))}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12, color: '#374151', opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} style={{ padding: '6px 14px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: page * 20 >= total ? 'not-allowed' : 'pointer', fontSize: 12, color: '#374151', opacity: page * 20 >= total ? 0.5 : 1 }}>Next</button>
        </div>
      </div>
      {editing && <EditAgentModal agent={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </>
  );
}

function EditAgentModal({ agent, onClose, onSave }: any) {
  const [form, setForm] = useState({ ...agent });
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Edit Agent: {agent.agentCode}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[['agentName', 'Agent Name', '1/-1'], ['country', 'Country', ''], ['pic', 'PIC', ''], ['defaultCurrency', 'Default Currency', ''], ['bankName', 'Bank Name', '1/-1'], ['accountNumberIban', 'Account / IBAN', ''], ['swiftCode', 'SWIFT Code', ''], ['bankAddress', 'Bank Address', '1/-1']].map(([key, label, span]) => (
            <div key={key} style={span ? { gridColumn: span } : {}}>
              <label style={labelStyle}>{label}</label>
              <input style={inputStyle} value={form[key] || ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#0A2540', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <Save size={13} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── User Provisioning ── */
function UserProvisioningTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { const res = await api.get('/admin/users'); setUsers(res.data || []); }
    catch (e) {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`); load();
  }

  const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    AGENT:    { bg: '#DBEAFE', color: '#1D4ED8' },
    GFSU_AC:  { bg: '#EDE9FE', color: '#5B21B6' },
    CAC:      { bg: '#FEF3C7', color: '#B45309' },
    TREASURY: { bg: '#FEF3C7', color: '#B45309' },
    SG_AP:    { bg: '#D1FAE5', color: '#065F46' },
    ADMIN:    { bg: '#FEE2E2', color: '#991B1B' },
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #E5E7EB' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            {['USER ID', 'FULL NAME', 'EMAIL', 'ROLE', 'OFFICE CODE', 'DEMO USER', 'ACTIONS'].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textAlign: 'left', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading...</td></tr>
          ) : users.map(u => {
            const rc = ROLE_COLORS[u.role] || { bg: '#F1F5F9', color: '#475569' };
            return (
              <tr key={u.id} style={{ borderTop: '1px solid #F3F4F6' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'monospace', color: '#6B7280' }}>{u.userId}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#111827' }}>{u.fullName}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151' }}>{u.email}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: rc.bg, color: rc.color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{u.role}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151' }}>{u.assignedOfficeCode || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: u.isDemoUser ? '#D1FAE5' : '#F1F5F9', color: u.isDemoUser ? '#065F46' : '#9CA3AF', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{u.isDemoUser ? 'Demo' : 'Live'}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => deleteUser(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FEF2F2', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#DC2626', fontSize: 12 }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── System Config ── */
function SystemConfigTab() {
  const [threshold, setThreshold] = useState<number>(500000);
  const [configs, setConfigs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [threshRes, configRes] = await Promise.all([api.get('/config/threshold'), api.get('/config')]);
        setThreshold(threshRes.data.value);
        setConfigs(configRes.data || []);
      } catch (e) {}
    }
    load();
  }, []);

  async function saveThreshold() {
    setSaving(true); setSaved(false);
    try { await api.put('/config/threshold', { value: threshold }); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch (e) {} finally { setSaving(false); }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>⚙️ Treasury Tier Threshold</h3>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Requests below this USD threshold are Tier 1. At or above are Tier 2 (requires senior sign-off).</p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Tier Threshold (USD)</label>
            <input style={inputStyle} type="number" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))} />
          </div>
          <button onClick={saveThreshold} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: saved ? '#16A34A' : '#0A2540', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            <Save size={13} /> {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>Tier 1 &lt; ${threshold.toLocaleString()} · Tier 2 ≥ ${threshold.toLocaleString()}</p>
      </div>

      <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>All System Configurations</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['CONFIG KEY', 'VALUE', 'DESCRIPTION', 'LAST UPDATED'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textAlign: 'left', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configs.map((c: any) => (
              <tr key={c.configKey} style={{ borderTop: '1px solid #F3F4F6' }}>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#0A2540' }}>{c.configKey}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{c.configValue}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280' }}>{c.description}</td>
                <td style={{ padding: '10px 14px', fontSize: 11, color: '#9CA3AF' }}>{c.updatedAt ? formatDateTime(c.updatedAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Audit Log ── */
function AuditLogTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { const res = await api.get('/audit-log', { params: { page, limit: 50 } }); setLogs(res.data.items || []); setTotal(res.data.total || 0); }
    catch (e) {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [page]);

  const ACTION_COLORS: Record<string, string> = {
    REQUEST_CREATED: '#1D4ED8', CLAIMED: '#7C3AED', GFSU_APPROVED: '#059669',
    CAC_APPROVED: '#059669', TREASURY_APPROVED: '#059669', GFSU_FORWARDED_TO_AP: '#059669',
    PAYMENT_INITIATED: '#D97706', PAYMENT_EXECUTED: '#059669',
    GFSU_REJECTED: '#DC2626', CAC_REJECTED: '#DC2626', TREASURY_REJECTED: '#DC2626',
    QUERY_RAISED: '#BE123C', RESUBMITTED: '#64748B',
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>{total} audit events total</span>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 12px', background: 'white', cursor: 'pointer', fontSize: 12, color: '#374151' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['TIMESTAMP', 'REQUEST ID', 'ACTION', 'ACTOR', 'ROLE', 'STATUS CHANGE', 'REMARKS'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textAlign: 'left', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading...</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} style={{ borderTop: '1px solid #F3F4F6' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#6B7280', whiteSpace: 'nowrap' }}>{formatDateTime(log.createdAt)}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#0A2540' }}>{log.requestId || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${ACTION_COLORS[log.action] || '#64748B'}18`, color: ACTION_COLORS[log.action] || '#64748B' }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>{log.actorId || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#6B7280' }}>{log.actorRole || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 11 }}>
                    {log.previousStatus && <span style={{ color: '#9CA3AF', textDecoration: 'line-through', marginRight: 6, fontSize: 10 }}>{log.previousStatus}</span>}
                    {log.newStatus && <span style={{ color: '#111827', fontWeight: 600 }}>{log.newStatus}</span>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#6B7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#6B7280' }}>Page {page}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, color: '#374151', opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total} style={{ padding: '6px 14px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, color: '#374151', opacity: page * 50 >= total ? 0.5 : 1 }}>Next</button>
        </div>
      </div>
    </>
  );
}
