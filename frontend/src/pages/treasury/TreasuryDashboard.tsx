import React, { useEffect, useState, useCallback } from 'react';
import { Eye, RefreshCw, Shield, DollarSign, Clock, X } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/utils';
import RequestTimeline from '../../components/shared/RequestTimeline';

function TierBadge({ amount }: { amount: number }) {
  const isT2 = amount > 50000;
  return (
    <span style={{ background: isT2 ? '#FEF3C7' : '#DBEAFE', color: isT2 ? '#B45309' : '#1D4ED8', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
      {isT2 ? 'Tier 2' : 'Tier 1'}
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'CAC Approved':                      { bg: '#D1FAE5', color: '#065F46' },
    'Clarified - Under Treasury Review': { bg: '#DBEAFE', color: '#1E40AF' },
    'Treasury Approved - Pending GFSU Verification': { bg: '#E0F2FE', color: '#0369A1' },
  };
  const s = map[status] || { bg: '#F1F5F9', color: '#475569' };
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#111827', background: 'white', outline: 'none', boxSizing: 'border-box' as const };

export default function TreasuryDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<string | null>(null);
  const [reviewPr, setReviewPr] = useState<any>(null);
  const [threshold, setThreshold] = useState(50000);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, cfgRes] = await Promise.all([
        api.get('/payment-requests'),
        api.get('/config/threshold').catch(() => ({ data: { value: 50000 } })),
      ]);
      setRequests(res.data.items || []);
      setThreshold(cfgRes.data?.value || 50000);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = requests.length;
  const tier1 = requests.filter(r => parseFloat(r.usdEquivalent) <= threshold).length;
  const tier2 = requests.filter(r => parseFloat(r.usdEquivalent) > threshold).length;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>SG Treasury Portal</h1>
        <p style={{ fontSize: 13, color: '#6B7280' }}>Singapore Treasury — Payment Authorization · Tier threshold: USD {threshold.toLocaleString()}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { title: 'PENDING AUTHORIZATION', value: pending, icon: <Clock size={18} color="#D97706" /> },
          { title: 'TIER 1 (≤ USD 50K)', value: tier1, icon: <Shield size={18} color="#1D4ED8" /> },
          { title: 'TIER 2 (> USD 50K)', value: tier2, icon: <Shield size={18} color="#B45309" /> },
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

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Requests Pending Treasury Authorization</h2>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 12px', background: 'white', cursor: 'pointer', fontSize: 12, color: '#374151' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Shield size={36} color="#D1FAE5" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#6B7280' }}>No requests pending Treasury authorization</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['REQUEST ID', 'TYPE', 'AGENT', 'BENEFICIARY', 'USD EQUIV.', 'TIER', 'CAC OBSERVATION', 'DATE', 'STATUS', 'ACTIONS'].map(h => (
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
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.beneficiaryName}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600 }}>$ {parseFloat(req.usdEquivalent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '12px 16px' }}><TierBadge amount={parseFloat(req.usdEquivalent)} /></td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#6B7280', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.cacObservation || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#9CA3AF' }}>{formatDate(req.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}><StatusChip status={req.status} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setViewId(req.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 12 }}><Eye size={13} /> Timeline</button>
                        <button onClick={() => setReviewPr(req)} style={{ background: '#0A2540', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Authorize</button>
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
      {reviewPr && <TreasuryReviewModal pr={reviewPr} onClose={() => setReviewPr(null)} onSuccess={() => { setReviewPr(null); load(); }} />}
    </div>
  );
}

function TreasuryReviewModal({ pr, onClose, onSuccess }: any) {
  const [form, setForm] = useState({ action: 'approve', observation: '', rejectionReason: '', queryTargetRole: 'AGENT' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.observation) { setError('Treasury observation is required'); return; }
    if (form.action === 'reject' && !form.rejectionReason) { setError('Rejection reason is required'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post(`/payment-requests/${pr.id}/treasury-review`, form);
      onSuccess();
    } catch (err: any) { setError(err.response?.data?.message || 'Action failed'); }
    finally { setSubmitting(false); }
  }

  const isT2 = parseFloat(pr.usdEquivalent) > 50000;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 540, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Treasury Authorization</h3>
            <p style={{ fontSize: 12, color: '#6B7280' }}>{pr.requestId} · <TierBadge amount={parseFloat(pr.usdEquivalent)} /></p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {isT2 && (
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#B45309', fontWeight: 600 }}>⚠ Tier 2 transaction — high-value payment above USD 50,000. Requires senior Treasury sign-off.</p>
            </div>
          )}
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px 14px', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            <div><span style={{ color: '#6B7280' }}>Agent:</span> <strong>{pr.agentCode}</strong></div>
            <div><span style={{ color: '#6B7280' }}>Beneficiary:</span> <strong>{pr.beneficiaryName}</strong></div>
            <div><span style={{ color: '#6B7280' }}>Amount:</span> <strong>{pr.currency} {parseFloat(pr.originalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <div><span style={{ color: '#6B7280' }}>USD Equiv:</span> <strong>$ {parseFloat(pr.usdEquivalent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            {pr.swiftCode && <div><span style={{ color: '#6B7280' }}>SWIFT:</span> <strong>{pr.swiftCode}</strong></div>}
            {pr.bankAccountNumber && <div><span style={{ color: '#6B7280' }}>Account:</span> <strong>{pr.bankAccountNumber}</strong></div>}
          </div>
          {pr.cacObservation && (
            <div style={{ background: '#EDE9FE', border: '1px solid #DDD6FE', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#5B21B6', marginBottom: 4 }}>CAC OBSERVATION</p>
              <p style={{ fontSize: 13, color: '#4C1D95' }}>{pr.cacObservation}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Treasury Action</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['approve', 'Authorize ✓', '#16A34A'], ['query', 'Raise Query ?', '#D97706'], ['reject', 'Reject ✗', '#DC2626']].map(([val, lbl, col]) => (
                  <button key={val} type="button" onClick={() => setForm(p => ({ ...p, action: val as string }))}
                    style={{ flex: 1, padding: '8px', border: `2px solid ${form.action === val ? col : '#D1D5DB'}`, borderRadius: 8, background: form.action === val ? col : 'white', color: form.action === val ? 'white' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Treasury Observation *</label>
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.observation} onChange={e => setForm(p => ({ ...p, observation: e.target.value }))} placeholder="Authorization notes, compliance remarks..." />
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
                {submitting ? 'Submitting...' : form.action === 'approve' ? 'Authorize Payment' : form.action === 'reject' ? 'Reject' : 'Raise Query'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
