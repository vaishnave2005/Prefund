import React, { useEffect, useState, CSSProperties } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import RequestTimeline from '../../components/shared/RequestTimeline';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentRequest {
  id: string;
  requestId: string;
  beneficiary: string;
  agent: string;
  usdEquivalent: number;
  swiftCode: string;
  bank: string;
  status: string;
  mt103Url?: string;
  actualReleaseDate?: string;
  lmsEntry?: boolean;
  currency?: string;
  amount?: number;
}

// ─── Status Chip ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  'Ready for SG AP Execution': { bg: '#EFF6FF', color: '#1D4ED8', label: 'Ready for Execution' },
  'Payment Initiated':          { bg: '#FFF7ED', color: '#C2410C', label: 'Payment Initiated'   },
  'Paid':                       { bg: '#F0FDF4', color: '#15803D', label: 'Paid'                },
  'Pending Approval':           { bg: '#FEF3C7', color: '#B45309', label: 'Pending Approval'    },
  'Approved':                   { bg: '#F0FDF4', color: '#166534', label: 'Approved'             },
  'Rejected':                   { bg: '#FFF1F2', color: '#BE123C', label: 'Rejected'             },
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_COLORS[status] ?? { bg: '#F3F4F6', color: '#374151', label: status };
  const chipStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 600,
    background: cfg.bg,
    color: cfg.color,
    whiteSpace: 'nowrap',
    letterSpacing: 0.3,
  };
  return <span style={chipStyle}>{cfg.label}</span>;
};

// ─── Upload MT103 Modal ───────────────────────────────────────────────────────

interface UploadModalProps {
  request: PaymentRequest;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ request, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [releaseDate, setReleaseDate] = useState('');
  const [lmsEntry, setLmsEntry] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select an MT103 PDF file.'); return; }
    if (!releaseDate) { setError('Please select a release date.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('mt103', file);
      formData.append('releaseDate', releaseDate);
      formData.append('lmsEntry', String(lmsEntry));
      await api.post(`/payment-requests/${request.id}/execute-payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'rgba(17,24,39,0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  };

  const modalStyle: CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    padding: '32px 36px',
    width: '100%',
    maxWidth: 520,
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    position: 'relative',
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Upload MT103 & Mark Paid</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Attach the SWIFT MT103 document to complete payment</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9CA3AF', lineHeight: 1 }}>✕</button>
        </div>

        {/* Request Summary */}
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13 }}>
            <div><span style={{ color: '#6B7280' }}>Request ID: </span><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1D4ED8' }}>{request.requestId}</span></div>
            <div><span style={{ color: '#6B7280' }}>Beneficiary: </span><span style={{ fontWeight: 600, color: '#111827' }}>{request.beneficiary}</span></div>
            <div><span style={{ color: '#6B7280' }}>Agent: </span><span style={{ color: '#374151' }}>{request.agent}</span></div>
            <div><span style={{ color: '#6B7280' }}>USD Equiv.: </span><span style={{ fontWeight: 600, color: '#059669' }}>${request.usdEquivalent?.toLocaleString()}</span></div>
            <div><span style={{ color: '#6B7280' }}>SWIFT: </span><span style={{ fontFamily: 'monospace', color: '#374151' }}>{request.swiftCode}</span></div>
            <div><span style={{ color: '#6B7280' }}>Bank: </span><span style={{ color: '#374151' }}>{request.bank}</span></div>
          </div>
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>MT103 SWIFT Document (PDF) <span style={{ color: '#EF4444' }}>*</span></label>
          <label htmlFor="mt103-file-input" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            border: '2px dashed #D1D5DB', borderRadius: 10, padding: '14px 16px',
            cursor: 'pointer', background: file ? '#F0FDF4' : '#FAFAFA',
            borderColor: file ? '#34D399' : '#D1D5DB', transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 22 }}>{file ? '✅' : '📎'}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: file ? '#065F46' : '#374151' }}>
                {file ? file.name : 'Click to select MT103 PDF'}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Accepted: PDF only'}
              </div>
            </div>
          </label>
          <input
            id="mt103-file-input"
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Release Date */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Actual Release Date <span style={{ color: '#EF4444' }}>*</span></label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* LMS Entry */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={lmsEntry}
              onChange={(e) => setLmsEntry(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#1D4ED8', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>LMS Entry Completed</span>
          </label>
          <p style={{ margin: '4px 0 0 26px', fontSize: 12, color: '#9CA3AF' }}>Check if this payment has been recorded in the LMS system</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#BE123C' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={submitting} style={{
            padding: '10px 20px', borderRadius: 8, border: '1.5px solid #D1D5DB',
            background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting} style={{
            padding: '10px 22px', borderRadius: 8, border: 'none',
            background: submitting ? '#86EFAC' : '#16A34A', color: '#fff',
            fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s',
          }}>
            {submitting ? (
              <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Uploading...</>
            ) : (
              <><span>✔</span> Upload & Mark Paid</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard: React.FC<{ label: string; value: number; icon: string; color: string; bgColor: string }> = ({
  label, value, icon, color, bgColor,
}) => (
  <div style={{
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 14,
    padding: '22px 26px',
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    flex: 1,
    minWidth: 0,
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: 12,
      background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
    <div style={{ marginLeft: 'auto', width: 4, height: 44, borderRadius: 99, background: color, flexShrink: 0 }} />
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type TabKey = 'ready' | 'completed';

const SGAPDashboard: React.FC = () => {
  useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('ready');
  const [uploadTarget, setUploadTarget] = useState<PaymentRequest | null>(null);
  const [timelineTarget, setTimelineTarget] = useState<string | null>(null);
  const [initiating, setInitiating] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payment-requests', { params: { role: 'sgap' } });
      const data: PaymentRequest[] = res.data?.data ?? res.data ?? [];
      setRequests(data);
    } catch {
      showToast('Failed to load payment requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleMarkInitiated = async (req: PaymentRequest) => {
    setInitiating((prev) => ({ ...prev, [req.id]: true }));
    try {
      await api.patch(`/payment-requests/${req.id}/payment-initiated`);
      showToast(`Payment initiated for ${req.requestId}.`, 'success');
      fetchRequests();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? 'Failed to mark initiated.', 'error');
    } finally {
      setInitiating((prev) => ({ ...prev, [req.id]: false }));
    }
  };

  // Derived lists
  const readyRows = requests.filter((r) => r.status === 'Ready for SG AP Execution');
  const completedRows = requests.filter((r) => ['Paid', 'Payment Initiated'].includes(r.status));

  const kpiReady     = readyRows.length;
  const kpiInitiated = requests.filter((r) => r.status === 'Payment Initiated').length;
  const kpiCompleted = requests.filter((r) => r.status === 'Paid').length;

  const tableRows = activeTab === 'ready' ? readyRows : completedRows;

  // ─── Styles ───────────────────────────────────────────────────────────────

  const pageStyle: CSSProperties = {
    minHeight: '100vh',
    background: '#F3F4F6',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: '28px 32px',
    boxSizing: 'border-box',
  };

  const headerCardStyle: CSSProperties = {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 16,
    padding: '24px 28px',
    marginBottom: 22,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  };

  const cardStyle: CSSProperties = {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  };

  const thStyle: CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: 11,
    fontWeight: 700,
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    background: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
    whiteSpace: 'nowrap' as const,
  };

  const tdStyle: CSSProperties = {
    padding: '13px 16px',
    fontSize: 13,
    color: '#374151',
    borderBottom: '1px solid #F3F4F6',
    verticalAlign: 'middle',
  };

  const tabBtnStyle = (active: boolean): CSSProperties => ({
    padding: '9px 20px',
    borderRadius: 8,
    border: 'none',
    background: active ? '#1E3A5F' : 'transparent',
    color: active ? '#fff' : '#6B7280',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: 0.2,
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={pageStyle}>
      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={headerCardStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: -0.5 }}>
              SG AP — Creditors Portal
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280', fontWeight: 400 }}>
              Accounts Payable — Payment Execution &amp; MT103 Upload
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Live</span>
            <button onClick={fetchRequests} style={{
              marginLeft: 8, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E5E7EB',
              background: '#F9FAFB', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <KpiCard label="Ready to Execute"    value={kpiReady}     icon="⚡" color="#3B82F6" bgColor="#EFF6FF" />
        <KpiCard label="Payments Initiated"  value={kpiInitiated} icon="🔄" color="#F97316" bgColor="#FFF7ED" />
        <KpiCard label="Completed (Paid)"    value={kpiCompleted} icon="✅" color="#22C55E" bgColor="#F0FDF4" />
      </div>

      {/* Table Card */}
      <div style={cardStyle}>
        {/* Tabs */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 6, background: '#fff' }}>
          <button style={tabBtnStyle(activeTab === 'ready')}     onClick={() => setActiveTab('ready')}>
            Ready for Execution
            {kpiReady > 0 && (
              <span style={{ marginLeft: 8, background: '#3B82F6', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                {kpiReady}
              </span>
            )}
          </button>
          <button style={tabBtnStyle(activeTab === 'completed')} onClick={() => setActiveTab('completed')}>
            Completed
            {kpiCompleted + kpiInitiated > 0 && (
              <span style={{ marginLeft: 8, background: '#22C55E', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                {kpiCompleted + kpiInitiated}
              </span>
            )}
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #E5E7EB', borderTopColor: '#1E3A5F', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Loading payment requests…
          </div>
        ) : tableRows.length === 0 ? (
          <div style={{ padding: 56, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{activeTab === 'ready' ? '⚡' : '🎉'}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>
              {activeTab === 'ready' ? 'No requests awaiting execution' : 'No completed payments yet'}
            </div>
            <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>
              {activeTab === 'ready' ? 'All payments have been processed.' : 'Completed payments will appear here.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Request ID</th>
                  <th style={thStyle}>Beneficiary</th>
                  <th style={thStyle}>Agent</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>USD Equiv.</th>
                  <th style={thStyle}>Swift Code</th>
                  <th style={thStyle}>Bank</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((req) => (
                  <tr key={req.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    {/* REQUEST ID */}
                    <td style={tdStyle}>
                      <button onClick={() => setTimelineTarget(req.id)} style={{
                        fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#1D4ED8',
                        background: '#EFF6FF', border: 'none', borderRadius: 6, padding: '3px 8px',
                        cursor: 'pointer', letterSpacing: 0.5,
                      }}>
                        {req.requestId}
                      </button>
                    </td>
                    {/* BENEFICIARY */}
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#111827', maxWidth: 160 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.beneficiary}</div>
                    </td>
                    {/* AGENT */}
                    <td style={{ ...tdStyle, maxWidth: 140 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6B7280' }}>{req.agent}</div>
                    </td>
                    {/* USD EQUIV */}
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#059669', fontSize: 14 }}>
                      ${req.usdEquivalent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    {/* SWIFT */}
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#F3F4F6', padding: '2px 7px', borderRadius: 5, color: '#374151' }}>
                        {req.swiftCode}
                      </span>
                    </td>
                    {/* BANK */}
                    <td style={{ ...tdStyle, maxWidth: 160 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.bank}</div>
                    </td>
                    {/* STATUS */}
                    <td style={tdStyle}><StatusChip status={req.status} /></td>
                    {/* ACTIONS */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {activeTab === 'ready' ? (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {req.status === 'Ready for SG AP Execution' && (
                            <button
                              onClick={() => handleMarkInitiated(req)}
                              disabled={!!initiating[req.id]}
                              style={{
                                padding: '7px 13px', borderRadius: 7, border: 'none',
                                background: initiating[req.id] ? '#93C5FD' : '#1E3A5F',
                                color: '#fff', fontSize: 12, fontWeight: 700,
                                cursor: initiating[req.id] ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap', transition: 'background 0.2s',
                                display: 'flex', alignItems: 'center', gap: 5,
                              }}
                              title="Mark Payment as Initiated"
                            >
                              {initiating[req.id]
                                ? <><span style={{ display: 'inline-block', width: 11, height: 11, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Initiating…</>
                                : <>🔄 Mark Initiated</>
                              }
                            </button>
                          )}
                          <button
                            onClick={() => setUploadTarget(req)}
                            style={{
                              padding: '7px 13px', borderRadius: 7, border: 'none',
                              background: '#16A34A', color: '#fff', fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s',
                              display: 'flex', alignItems: 'center', gap: 5,
                            }}
                            title="Upload MT103 and Mark Paid"
                          >
                            📎 Upload MT103 &amp; Mark Paid
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                          {req.mt103Url ? (
                            <a
                              href={req.mt103Url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '7px 13px', borderRadius: 7,
                                background: '#EFF6FF', color: '#1D4ED8',
                                fontSize: 12, fontWeight: 700, textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                                border: '1px solid #BFDBFE',
                              }}
                            >
                              📄 Download MT103
                            </a>
                          ) : (
                            <span style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>No MT103</span>
                          )}
                          <button onClick={() => setTimelineTarget(req.id)} style={{
                            padding: '7px 11px', borderRadius: 7, border: '1px solid #E5E7EB',
                            background: '#F9FAFB', color: '#6B7280', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}>
                            🕐 Timeline
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && tableRows.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#9CA3AF', background: '#FAFAFA' }}>
            Showing {tableRows.length} record{tableRows.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadTarget && (
        <UploadModal
          request={uploadTarget}
          onClose={() => setUploadTarget(null)}
          onSuccess={() => { fetchRequests(); showToast('Payment marked as Paid. MT103 uploaded.', 'success'); }}
        />
      )}

      {/* Timeline Modal */}
      {timelineTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9998,
        }} onClick={(e) => { if (e.target === e.currentTarget) setTimelineTarget(null); }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '28px 32px',
            width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Request Timeline</h2>
              <button onClick={() => setTimelineTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9CA3AF' }}>✕</button>
            </div>
            <RequestTimeline requestId={timelineTarget} />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 99999,
          background: toast.type === 'success' ? '#065F46' : '#7F1D1D',
          color: '#fff', borderRadius: 12, padding: '14px 20px',
          fontSize: 14, fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 10, maxWidth: 360,
          animation: 'fadeIn 0.3s ease',
        }}>
          <span style={{ fontSize: 18 }}>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default SGAPDashboard;
