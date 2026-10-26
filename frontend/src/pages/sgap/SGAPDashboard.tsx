import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Eye, RefreshCw, Upload, Download, CheckCircle, Clock, DollarSign, FileText, X, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/utils';
import RequestTimeline from '../../components/shared/RequestTimeline';

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Ready for SG AP Execution': { bg: '#DCFCE7', color: '#166534' },
    'Payment Initiated':         { bg: '#E0F2FE', color: '#0369A1' },
    'Paid':                      { bg: '#D1FAE5', color: '#065F46' },
  };
  const s = map[status] || { bg: '#F1F5F9', color: '#475569' };
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#111827', background: 'white', outline: 'none', boxSizing: 'border-box' as const };

export default function SGAPDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState<any[]>([]);
  const [completed, setCompleted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<string | null>(null);
  const [uploadPr, setUploadPr] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, compRes] = await Promise.all([
        api.get('/payment-requests'),
        api.get('/payment-requests/completed'),
      ]);
      setRequests(res.data.items || []);
      setCompleted(compRes.data.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ready = requests.filter(r => r.status === 'Ready for SG AP Execution').length;
  const initiated = requests.filter(r => r.status === 'Payment Initiated').length;

  async function markInitiated(id: string) {
    try { await api.patch(`/payment-requests/${id}/payment-initiated`); load(); }
    catch (e: any) { alert(e.response?.data?.message || 'Failed'); }
  }

  const activeList = tab === 0 ? requests : completed;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>SG AP — Creditors Portal</h1>
        <p style={{ fontSize: 13, color: '#6B7280' }}>Accounts Payable — Payment Execution &amp; MT103 Upload (Stored in PostgreSQL)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { title: 'READY TO EXECUTE', value: ready, icon: <Clock size={18} color="#D97706" /> },
          { title: 'PAYMENT INITIATED', value: initiated, icon: <DollarSign size={18} color="#1D4ED8" /> },
          { title: 'COMPLETED (PAID)', value: completed.length, icon: <CheckCircle size={18} color="#16A34A" /> },
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
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', padding: '0 20px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
            {['Ready for Execution', 'Completed'].map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{ padding: '14px 18px', fontSize: 13, fontWeight: tab === i ? 700 : 500, color: tab === i ? '#0A2540' : '#6B7280', background: 'none', border: 'none', borderBottom: `2px solid ${tab === i ? '#0A2540' : 'transparent'}`, cursor: 'pointer', marginBottom: -1 }}>{t}</button>
            ))}
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 12px', background: 'white', cursor: 'pointer', fontSize: 12, color: '#374151' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>
        ) : activeList.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <CheckCircle size={36} color="#D1FAE5" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#6B7280' }}>{tab === 0 ? 'No requests ready for execution' : 'No completed payments yet'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['REQUEST ID', 'BENEFICIARY', 'AGENT', 'USD EQUIV.', 'SWIFT CODE', 'BANK', 'STATUS', 'ACTIONS'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#6B7280', textAlign: 'left', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeList.map(req => (
                  <tr key={req.id} style={{ borderTop: '1px solid #F3F4F6' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#1D4ED8', fontFamily: 'monospace' }}>{req.requestId}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.beneficiaryName}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>{req.agentCode}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600 }}>$ {parseFloat(req.usdEquivalent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', fontFamily: 'monospace' }}>{req.swiftCode || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.remittanceBank || '—'}</td>
                    <td style={{ padding: '12px 16px' }}><StatusChip status={req.status} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button onClick={() => setViewId(req.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 12 }}><Eye size={13} /> Timeline</button>
                        {req.status === 'Ready for SG AP Execution' && (
                          <button onClick={() => markInitiated(req.id)} style={{ background: '#0A2540', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Mark Initiated</button>
                        )}
                        {['Ready for SG AP Execution', 'Payment Initiated'].includes(req.status) && (
                          <button onClick={() => setUploadPr(req)} style={{ background: '#16A34A', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Upload size={12} /> Upload MT103
                          </button>
                        )}
                        {tab === 1 && req.mt103Url && req.mt103Url !== 'STORED_IN_PG' && (
                          <a href={req.mt103Url} download={`MT103-${req.requestId}.pdf`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                            <Download size={13} /> MT103
                          </a>
                        )}
                        {tab === 1 && req.mt103Url === 'STORED_IN_PG' && (
                          <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>✓ MT103 in PG</span>
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
      {uploadPr && <MT103UploadModal pr={uploadPr} user={user} onClose={() => setUploadPr(null)} onSuccess={() => { setUploadPr(null); load(); }} />}
    </div>
  );
}

function MT103UploadModal({ pr, user, onClose, onSuccess }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [releaseDate, setReleaseDate] = useState('');
  const [lmsEntry, setLmsEntry] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!releaseDate) { setError('Release date is required'); return; }
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('actualReleaseDate', releaseDate);
      fd.append('lmsEntry', String(lmsEntry));
      if (file) fd.append('mt103', file);
      await api.post(`/payment-requests/${pr.id}/execute-payment`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess();
    } catch (err: any) { setError(err.response?.data?.message || 'Upload failed'); }
    finally { setSubmitting(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Upload MT103 &amp; Mark Paid</h3>
            <p style={{ fontSize: 12, color: '#6B7280' }}>{pr.requestId} · {pr.beneficiaryName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>✓ File will be stored as base64 in PostgreSQL JSONB — no disk or MongoDB</p>
          </div>
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px 14px', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            <div><span style={{ color: '#6B7280' }}>SWIFT:</span> <strong>{pr.swiftCode || '—'}</strong></div>
            <div><span style={{ color: '#6B7280' }}>USD Equiv:</span> <strong>$ {parseFloat(pr.usdEquivalent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <div><span style={{ color: '#6B7280' }}>Bank:</span> <strong style={{ fontSize: 11 }}>{pr.remittanceBank || '—'}</strong></div>
            <div><span style={{ color: '#6B7280' }}>Account:</span> <strong>{pr.bankAccountNumber || '—'}</strong></div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* MT103 Upload Zone */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>MT103 SWIFT Document (PDF)</label>
              <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed #D1D5DB', borderRadius: 8, padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA' }}>
                <Upload size={22} color="#9CA3AF" style={{ margin: '0 auto 6px' }} />
                {file ? (
                  <p style={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>✓ {file.name}</p>
                ) : (
                  <>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>Drag &amp; drop MT103 PDF or click to browse</p>
                    <p style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, marginTop: 2 }}>browse file</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.PDF" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Actual Release / Value Date *</label>
              <input type="date" style={inputStyle} value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <input type="checkbox" id="lms-entry" checked={lmsEntry} onChange={e => setLmsEntry(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="lms-entry" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>LMS Entry Recorded</label>
            </div>

            {error && <div style={{ marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626', display: 'flex', gap: 8 }}><AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button type="submit" disabled={submitting} style={{ padding: '9px 20px', background: '#16A34A', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={14} />
                {submitting ? 'Uploading...' : 'Mark Paid & Save MT103'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
