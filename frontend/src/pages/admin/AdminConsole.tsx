import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Search, Edit2, Trash2, Plus, Save, X, Settings } from 'lucide-react';
import api from '../../lib/api';
import { formatDateTime, getRoleLabel } from '../../lib/utils';

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState<'agents' | 'users' | 'config' | 'audit'>('agents');
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }} className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#0A2540', marginBottom: 4 }}>System Administration Console</h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>Master data management, user provisioning, configuration, and audit compliance</p>
      </div>
      <div className="tab-bar">
        {[['agents', 'Agent Master Directory'], ['users', 'User Provisioning'], ['config', 'System Configuration'], ['audit', 'Global Audit Log']].map(([key, label]) => (
          <button key={key} className={`tab-btn${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key as any)}>{label}</button>
        ))}
      </div>
      {activeTab === 'agents' && <AgentMasterTab />}
      {activeTab === 'users' && <UserProvisioningTab />}
      {activeTab === 'config' && <SystemConfigTab />}
      {activeTab === 'audit' && <AuditLogTab />}
    </div>
  );
}

function AgentMasterTab() {
  const [agents, setAgents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

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
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input className="form-input" style={{ paddingLeft: 30 }} placeholder="Search agents..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <span style={{ fontSize: 12, color: '#64748B' }}>{total} offices total</span>
      </div>
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="pil-table">
            <thead><tr><th>Code</th><th>Name</th><th>Country</th><th>PIC</th><th>Currency</th><th>Bank</th><th>SWIFT</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading...</td></tr>
              : agents.map(agent => (
                <tr key={agent.agentCode}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#0A2540' }}>{agent.agentCode}</td>
                  <td style={{ fontSize: 12 }}>{agent.agentName}</td>
                  <td style={{ fontSize: 12 }}>{agent.country || '—'}</td>
                  <td style={{ fontSize: 12 }}>{agent.pic || '—'}</td>
                  <td style={{ fontSize: 12 }}>{agent.defaultCurrency || '—'}</td>
                  <td style={{ fontSize: 12 }}>{agent.bankName || '—'}</td>
                  <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{agent.swiftCode || '—'}</td>
                  <td>
                    <button onClick={() => setEditing({ ...agent })} style={{ background: '#EFF6FF', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#0A2540' }}><Edit2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>Page {page} of {Math.ceil(total / 20)}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Next</button>
          </div>
        </div>
      </div>
      {editing && <EditAgentModal agent={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </>
  );
}

function EditAgentModal({ agent, onClose, onSave }: any) {
  const [form, setForm] = useState({ ...agent });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 22px', background: '#0A2540', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: 'white', fontFamily: 'Georgia,serif', fontSize: 16 }}>Edit Agent: {agent.agentCode}</p>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
        </div>
        <div style={{ padding: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[['agentName', 'Agent Name'], ['country', 'Country'], ['pic', 'PIC'], ['defaultCurrency', 'Default Currency'], ['bankName', 'Bank Name'], ['accountNumberIban', 'Account / IBAN'], ['swiftCode', 'SWIFT Code'], ['bankAddress', 'Bank Address']].map(([key, label]) => (
            <div key={key} style={key === 'agentName' || key === 'bankAddress' ? { gridColumn: '1/-1' } : {}}>
              <label className="form-label">{label}</label>
              <input className="form-input" value={form[key] || ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(form)}><Save size={13} />Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function UserProvisioningTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);

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

  return (
    <div className="card">
      <div className="card-header"><p style={{ fontWeight: 700, fontSize: 14, color: '#0A2540' }}>Portal Users</p></div>
      <div style={{ overflowX: 'auto' }}>
        <table className="pil-table">
          <thead><tr><th>User ID</th><th>Full Name</th><th>Email</th><th>Role</th><th>Office Code</th><th>Demo</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading...</td></tr>
            : users.map(u => (
              <tr key={u.id}>
                <td style={{ fontSize: 11, fontFamily: 'monospace' }}>{u.userId}</td>
                <td style={{ fontSize: 12, fontWeight: 500 }}>{u.fullName}</td>
                <td style={{ fontSize: 12 }}>{u.email}</td>
                <td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#EFF6FF', color: '#0A2540' }}>{u.role}</span></td>
                <td style={{ fontSize: 12 }}>{u.assignedOfficeCode || '—'}</td>
                <td style={{ fontSize: 12, color: u.isDemoUser ? '#10B981' : '#94A3B8' }}>{u.isDemoUser ? 'Yes' : 'No'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditingUser({ ...u })} style={{ background: '#EFF6FF', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#0A2540' }}><Edit2 size={13} /></button>
                    <button onClick={() => deleteUser(u.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#D32F2F' }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemConfigTab() {
  const [threshold, setThreshold] = useState<number>(500000);
  const [configs, setConfigs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const [threshRes, configRes] = await Promise.all([api.get('/config/threshold'), api.get('/config')]);
      setThreshold(threshRes.data.value);
      setConfigs(configRes.data || []);
    }
    load();
  }, []);

  async function saveThreshold() {
    setSaving(true); setSaved(false);
    try { await api.put('/config/threshold', { value: threshold }); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch (e) {}
    finally { setSaving(false); }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><p style={{ fontWeight: 700, fontSize: 13, color: '#0A2540' }}>⚙️ Treasury Tier Threshold</p></div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Requests below this USD threshold are classified as Tier 1. Requests at or above are Tier 2 (higher oversight).</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Tier Threshold (USD)</label>
              <input className="form-input" type="number" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))} />
            </div>
            <button className="btn-primary" onClick={saveThreshold} disabled={saving}><Save size={13} />{saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}</button>
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>Current: Tier 1 &lt; ${threshold.toLocaleString()} USD | Tier 2 ≥ ${threshold.toLocaleString()} USD</p>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><p style={{ fontWeight: 700, fontSize: 13, color: '#0A2540' }}>All System Configurations</p></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="pil-table">
            <thead><tr><th>Config Key</th><th>Value</th><th>Description</th><th>Last Updated</th></tr></thead>
            <tbody>
              {configs.map((c: any) => (
                <tr key={c.configKey}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>{c.configKey}</td>
                  <td style={{ fontSize: 12, fontWeight: 600, color: '#0A2540' }}>{c.configValue}</td>
                  <td style={{ fontSize: 11, color: '#64748B' }}>{c.description}</td>
                  <td style={{ fontSize: 11, color: '#94A3B8' }}>{c.updatedAt ? formatDateTime(c.updatedAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
    REQUEST_CREATED: '#1D4ED8', CLAIMED: '#7C3AED', GFSU_APPROVED: '#059669', CAC_APPROVED: '#059669',
    TREASURY_APPROVED: '#059669', GFSU_FORWARDED_TO_AP: '#059669', PAYMENT_INITIATED: '#D97706',
    PAYMENT_EXECUTED: '#059669', GFSU_REJECTED: '#D32F2F', CAC_REJECTED: '#D32F2F',
    TREASURY_REJECTED: '#D32F2F', QUERY_RAISED: '#BE123C', RESUBMITTED: '#64748B',
  };

  return (
    <>
      <div className="card">
        <div className="card-header"><p style={{ fontWeight: 700, fontSize: 14, color: '#0A2540' }}>Global Compliance Audit Trail</p><button className="btn-ghost" onClick={load}><RefreshCw size={13} /></button></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="pil-table">
            <thead><tr><th>Timestamp (IST)</th><th>Request ID</th><th>Action</th><th>Actor</th><th>Role</th><th>Status Change</th><th>Remarks</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Loading...</td></tr>
              : logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: 11, color: '#64748B', whiteSpace: 'nowrap' }}>{formatDateTime(log.createdAt)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#0A2540' }}>{log.requestId || '—'}</td>
                  <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${ACTION_COLORS[log.action] || '#64748B'}18`, color: ACTION_COLORS[log.action] || '#64748B' }}>{log.action}</span></td>
                  <td style={{ fontSize: 12 }}>{log.actorId || '—'}</td>
                  <td style={{ fontSize: 11, color: '#64748B' }}>{log.actorRole || '—'}</td>
                  <td style={{ fontSize: 11 }}>
                    {log.previousStatus && <span style={{ color: '#94A3B8', textDecoration: 'line-through', marginRight: 4, fontSize: 10 }}>{log.previousStatus}</span>}
                    {log.newStatus && <span style={{ color: '#0A2540', fontWeight: 600, fontSize: 11 }}>{log.newStatus}</span>}
                  </td>
                  <td style={{ fontSize: 11, color: '#64748B', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>{total} audit events total</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}>Next</button>
          </div>
        </div>
      </div>
    </>
  );
}
