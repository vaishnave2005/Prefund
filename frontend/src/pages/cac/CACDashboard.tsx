import React, { useEffect, useState, useCallback } from 'react';
import { Eye, RefreshCw, CheckCircle, Clock, DollarSign, FileText, X } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatCurrency } from '../../lib/utils';
import RequestTimeline from '../../components/shared/RequestTimeline';

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'CAC Pending':                      { bg: '#EDE9FE', color: '#5B21B6' },
    'CAC Approved':                     { bg: '#D1FAE5', color: '#065F46' },
    'Clarified - Under CAC Review':     { bg: '#EDE9FE', color: '#5B21B6' },
    'Rejected by CAC':                  { bg: '#FEE2E2', color: '#991B1B' },
  };
  const s = map[status] || { bg: '#F1F5F9', color: '#475569' };
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#111827', background: 'white', outline: 'none', boxSizing: 'border-box' as const };

export default function CACDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<string | null>(null);
  const [reviewPr, setReviewPr] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment-requests');
      setAllRequests(res.data.items || []);
      setRequests((res.data.items || []).filter((r: any) => ['CAC Pending', 'Clarified - Under CAC Review'].includes(r.status)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approved = allRequests.filter(r => ['CAC Approved', 'Treasury Approved - Pending GFSU Verification', 'Ready for SG AP Execution', 'Payment Initiated', 'Paid'].includes(r.status)).length;
  const totalApprovedValue = allRequests.filter(r => r.status === 'CAC Approved' || r.status === 'Paid').reduce((s: number, r: any) => s + parseFloat(r.usdEquivalent || 0), 0);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>CAC Executive Portal</h1>
        <p style={{ fontSize: 13, color: '#6B7280' }}>Credit Approvals Committee</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { title: 'PENDING APPROVAL', value: String(requests.length), icon: <Clock size={18} color="#D97706" /> },
          { title: 'APPROVED THIS CYCLE', value: String(approved), icon: <CheckCircle size={18} color="#16A34A" /> },
          { title: 'TOTAL APPROVED (USD)', value: `$ ${totalApprovedValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, icon: <DollarSign size={18} /> },
        ].map(k => (
          <div key={k.title} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{k.title}</p>
              <p style={{ fontSize: k.value.length > 6 ? 20 : 28, fontWeight: 700, color: '#111827' }}>{k.value}</p>
            </div>
            <div style={{ color: '#9CA3AF' }}>{k.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Requests Pending CAC Approval</h2>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 12px', background: 'white', cursor: 'pointer', fontSize: 12, color: '#374151' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <CheckCircle size={36} color="#D1FAE5" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#6B7280' }}>No requests pending CAC approval</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['REQUEST ID', 'TYPE', 'AGENT', 'BENEFICIARY', 'USD EQUIV.', 'GFSU OBSERVATION', 'DATE', 'STATUS', 'ACTIONS'].map(h => (
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
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.beneficiaryName}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600 }}>$ {parseFloat(req.usdEquivalent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#6B7280', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.gfsuObservation || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#9CA3AF' }}>{formatDate(req.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}><StatusChip status={req.status} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setViewId(req.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 12 }}><Eye size={13} /> Timeline</button>
                        <button onClick={() => setReviewPr(req)} style={{ background: '#0A2540', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Review &amp; Approve</button>
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
      {reviewPr && <CACReviewModal pr={reviewPr} onClose={() => setReviewPr(null)} onSuccess={() => { setReviewPr(null); load(); }} />}
    </div>
  );
}

function CACReviewModal({ pr, onClose, onSuccess }: any) {
  const [form, setForm] = useState({ action: 'approve', observation: '', rejectionReason: '', queryTargetRole: 'AGENT' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.observation) { setError('CAC Observation is required'); return; }
    if (form.action === 'reject' && !form.rejectionReason) { setError('Rejection reason is required'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post(`/payment-requests/${pr.id}/cac-review`, form);
      onSuccess();
    } catch (err: any) { setError(err.response?.data?.message || 'Action failed'); }
    finally { setSubmitting(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 540, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>CAC Review &amp; Approval</h3>
            <p style={{ fontSize: 12, color: '#6B7280' }}>{pr.requestId} · {pr.beneficiaryName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px 14px', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            <div><span style={{ color: '#6B7280' }}>Agent:</span> <strong>{pr.agentCode}</strong></div>
            <div><span style={{ color: '#6B7280' }}>Type:</span> <strong>{pr.requestType}</strong></div>
            <div><span style={{ color: '#6B7280' }}>Amount:</span> <strong>{pr.currency} {parseFloat(pr.originalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <div><span style={{ color: '#6B7280' }}>USD Equiv:</span> <strong>$ {parseFloat(pr.usdEquivalent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
          </div>
          {pr.gfsuObservation && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', marginBottom: 4 }}>GFSU OBSERVATION</p>
              <p style={{ fontSize: 13, color: '#1E3A8A' }}>{pr.gfsuObservation}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>CAC Action</label>
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
              <label style={labelStyle}>CAC Observation *</label>
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.observation} onChange={e => setForm(p => ({ ...p, observation: e.target.value }))} placeholder="Committee decision notes..." />
            </div>
            {form.action === 'reject' && (
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Rejection Reason *</label>
                <textarea style={{ ...inputStyle, height: 64, resize: 'vertical' }} value={form.rejectionReason} onChange={e => setForm(p => ({ ...p, rejectionReason: e.target.value }))} />
              </div>
            )}
            {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ padding: '9px 20px', background: form.action === 'approve' ? '#16A34A' : form.action === 'reject' ? '#DC2626' : '#D97706', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {submitting ? 'Submitting...' : form.action === 'approve' ? 'Approve Request' : form.action === 'reject' ? 'Reject Request' : 'Raise Query'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
