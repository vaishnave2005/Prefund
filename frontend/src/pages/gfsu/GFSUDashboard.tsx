import React, { useEffect, useState, useCallback } from 'react';
import { Eye, RefreshCw, CheckCircle, Clock, AlertCircle, FileText, X, User, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatDateTime } from '../../lib/utils';
import RequestTimeline from '../../components/shared/RequestTimeline';

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Submitted':                             { bg: '#F1F5F9', color: '#475569' },
    'Under GFSU Review':                     { bg: '#FEF9C3', color: '#854D0E' },
    'Query Raised':                          { bg: '#FEF3C7', color: '#92400E' },
    'CAC Pending':                           { bg: '#EDE9FE', color: '#5B21B6' },
    'CAC Approved':                          { bg: '#D1FAE5', color: '#065F46' },
    'Clarified - Under GFSU Review':         { bg: '#FEF9C3', color: '#854D0E' },
    'Treasury Approved - Pending GFSU Verification': { bg: '#DBEAFE', color: '#1E40AF' },
    'Ready for SG AP Execution':             { bg: '#DCFCE7', color: '#166534' },
    'Paid':                                  { bg: '#D1FAE5', color: '#065F46' },
    'Rejected by GFSU':                      { bg: '#FEE2E2', color: '#991B1B' },
  };
  const s = map[status] || { bg: '#F1F5F9', color: '#475569' };
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}

const TABS = ['Incoming Queue', 'My Cases', 'Post-Treasury', 'All Requests'];
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#111827', background: 'white', outline: 'none', boxSizing: 'border-box' as const };

export default function GFSUDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<string | null>(null);
  const [reviewPr, setReviewPr] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const queues = ['unassigned', 'mine', 'post-treasury', ''];
      const q = queues[tab];
      const res = await api.get('/payment-requests', { params: q ? { queue: q } : {} });
      setRequests(res.data.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const pending = requests.filter(r => ['Submitted', 'Under GFSU Review', 'Clarified - Under GFSU Review', 'Query Raised'].includes(r.status)).length;
  const postTreasury = requests.filter(r => r.status === 'Treasury Approved - Pending GFSU Verification').length;
  const completed = requests.filter(r => r.status === 'Paid').length;

  async function claim(id: string) {
    try { await api.post(`/payment-requests/${id}/claim`); load(); } catch (e: any) { alert(e.response?.data?.message || 'Claim failed'); }
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>GFSU-AC Verification Hub</h1>
        <p style={{ fontSize: 13, color: '#6B7280' }}>Group Finance Service Unit — Accounts &amp; Control</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { title: 'PENDING VERIFICATION', value: pending, icon: <Clock size={18} /> },
          { title: 'POST-TREASURY QUEUE', value: postTreasury, icon: <AlertCircle size={18} color="#F59E0B" /> },
          { title: 'COMPLETED (PAID)', value: completed, icon: <CheckCircle size={18} color="#16A34A" /> },
          { title: 'TOTAL REQUESTS', value: requests.length, icon: <FileText size={18} /> },
        ].map(k => (
          <div key={k.title} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{k.title}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{k.value}</p>
            </div>
            <div style={{ color: '#9CA3AF' }}>{k.icon}</div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', padding: '0 20px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{ padding: '14px 18px', fontSize: 13, fontWeight: tab === i ? 700 : 500, color: tab === i ? '#0A2540' : '#6B7280', background: 'none', border: 'none', borderBottom: `2px solid ${tab === i ? '#0A2540' : 'transparent'}`, cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1 }}>{t}</button>
            ))}
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 12px', background: 'white', cursor: 'pointer', fontSize: 12, color: '#374151' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <FileText size={36} color="#E5E7EB" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#6B7280' }}>No requests in this queue</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['REQUEST ID', 'TYPE', 'AGENT', 'BENEFICIARY', 'USD EQUIV.', 'DATE', 'STATUS', 'ACTIONS'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#6B7280', textAlign: 'left', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} style={{ borderTop: '1px solid #F3F4F6' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#1D4ED8', fontFamily: 'monospace' }}>{req.requestId}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>{req.requestType}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>{req.agentCode}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.beneficiaryName}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#111827' }}>$ {parseFloat(req.usdEquivalent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#9CA3AF' }}>{formatDate(req.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}><StatusChip status={req.status} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => setViewId(req.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 12 }}><Eye size={14} /> Timeline</button>
                        {tab === 0 && req.status === 'Submitted' && (
                          <button onClick={() => claim(req.id)} style={{ background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Claim</button>
                        )}
                        {(tab === 1 || tab === 0) && ['Under GFSU Review', 'Clarified - Under GFSU Review', 'Query Raised'].includes(req.status) && (
                          <button onClick={() => setReviewPr(req)} style={{ background: '#0A2540', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Review</button>
                        )}
                        {tab === 2 && req.status === 'Treasury Approved - Pending GFSU Verification' && (
                          <button onClick={() => setReviewPr(req)} style={{ background: '#1D4ED8', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Forward to AP</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewId && <RequestTimeline requestId={viewId} onClose={() => setViewId(null)} />}
      {reviewPr && <GFSUReviewModal pr={reviewPr} user={user} isPostTreasury={tab === 2} onClose={() => setReviewPr(null)} onSuccess={() => { setReviewPr(null); load(); }} />}
    </div>
  );
}

function GFSUReviewModal({ pr, user, isPostTreasury, onClose, onSuccess }: any) {
  const [form, setForm] = useState({ action: 'approve', observation: '', rejectionReason: '', queryTargetRole: 'AGENT', gfsuFinalRemarks: '', actualReleaseDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.observation && !isPostTreasury) { setError('Observation is required'); return; }
    if (isPostTreasury && (!form.gfsuFinalRemarks || !form.actualReleaseDate)) { setError('Final remarks and value date are required'); return; }
    setSubmitting(true); setError('');
    try {
      if (isPostTreasury) {
        await api.post(`/payment-requests/${pr.id}/post-treasury-review`, { action: 'forward', gfsuFinalRemarks: form.gfsuFinalRemarks, actualReleaseDate: form.actualReleaseDate });
      } else {
        await api.post(`/payment-requests/${pr.id}/gfsu-review`, form);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed');
    } finally { setSubmitting(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{isPostTreasury ? 'Post-Treasury GFSU Verification' : 'GFSU Review'}</h3>
            <p style={{ fontSize: 12, color: '#6B7280' }}>{pr.requestId} · {pr.beneficiaryName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Request summary */}
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px 14px', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            <div><span style={{ color: '#6B7280' }}>Agent:</span> <strong>{pr.agentCode}</strong></div>
            <div><span style={{ color: '#6B7280' }}>Type:</span> <strong>{pr.requestType}</strong></div>
            <div><span style={{ color: '#6B7280' }}>Currency:</span> <strong>{pr.currency}</strong></div>
            <div><span style={{ color: '#6B7280' }}>USD Equiv:</span> <strong>$ {parseFloat(pr.usdEquivalent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            {pr.swiftCode && <div><span style={{ color: '#6B7280' }}>SWIFT:</span> <strong>{pr.swiftCode}</strong></div>}
            {pr.remittanceBank && <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#6B7280' }}>Bank:</span> <strong>{pr.remittanceBank}</strong></div>}
          </div>

          <form onSubmit={handleSubmit}>
            {!isPostTreasury ? (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Action</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['approve', 'Approve ✓', '#16A34A'], ['query', 'Raise Query ?', '#D97706'], ['reject', 'Reject ✗', '#DC2626']].map(([val, lbl, col]) => (
                      <button key={val} type="button" onClick={() => setForm(p => ({ ...p, action: val as string }))}
                        style={{ flex: 1, padding: '8px', border: `2px solid ${form.action === val ? col : '#D1D5DB'}`, borderRadius: 8, background: form.action === val ? col : 'white', color: form.action === val ? 'white' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>GFSU Observation *</label>
                  <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.observation} onChange={e => setForm(p => ({ ...p, observation: e.target.value }))} placeholder="Enter your verification notes..." />
                </div>
                {form.action === 'reject' && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Rejection Reason *</label>
                    <textarea style={{ ...inputStyle, height: 64, resize: 'vertical' }} value={form.rejectionReason} onChange={e => setForm(p => ({ ...p, rejectionReason: e.target.value }))} />
                  </div>
                )}
                {form.action === 'query' && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Raise Query To</label>
                    <select style={inputStyle} value={form.queryTargetRole} onChange={e => setForm(p => ({ ...p, queryTargetRole: e.target.value }))}>
                      <option value="AGENT">Agent Office</option>
                      <option value="CAC">CAC</option>
                      <option value="TREASURY">Treasury</option>
                    </select>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Value Date (Actual Release Date) *</label>
                  <input type="date" style={inputStyle} value={form.actualReleaseDate} onChange={e => setForm(p => ({ ...p, actualReleaseDate: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>GFSU Final Remarks *</label>
                  <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.gfsuFinalRemarks} onChange={e => setForm(p => ({ ...p, gfsuFinalRemarks: e.target.value }))} placeholder="Post-treasury verification notes and AP routing instructions..." />
                </div>
              </>
            )}

            {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ padding: '9px 18px', background: isPostTreasury ? '#1D4ED8' : form.action === 'approve' ? '#16A34A' : form.action === 'reject' ? '#DC2626' : '#D97706', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {submitting ? 'Submitting...' : isPostTreasury ? 'Forward to SG AP' : form.action === 'approve' ? 'Approve' : form.action === 'reject' ? 'Reject' : 'Raise Query'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
