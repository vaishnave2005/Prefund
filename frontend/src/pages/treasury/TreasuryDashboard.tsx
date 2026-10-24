import React, { useEffect, useState, CSSProperties } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import RequestTimeline from '../../components/shared/RequestTimeline';

/* ─────────────────────────── types ─────────────────────────── */
interface PaymentRequest {
  id: string;
  requestId: string;
  type: string;
  agentCode: string;
  beneficiary: string;
  usdEquivalent: number;
  status: string;
  cacObservation?: string;
  remarks?: string;
}

/* ─────────────────────────── helpers ─────────────────────────── */
const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#6B7280',
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #D1D5DB',
  borderRadius: 8,
  fontSize: 14,
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  fontFamily: 'inherit',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

/* ─── StatusChip ─── */
const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  'CAC Approved': { bg: '#DBEAFE', color: '#1D4ED8', label: 'CAC Approved' },
  'Clarified - Under Treasury Review': { bg: '#FEF3C7', color: '#92400E', label: 'Clarified · Under Review' },
  'Treasury Approved - Pending GFSU Verification': { bg: '#D1FAE5', color: '#065F46', label: 'Treasury Approved' },
  'Rejected by Treasury': { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected by Treasury' },
  'Query Raised': { bg: '#F3E8FF', color: '#6B21A8', label: 'Query Raised' },
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const cfg = statusColors[status] ?? { bg: '#F3F4F6', color: '#374151', label: status };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
};

/* ─── TierBadge ─── */
const TierBadge: React.FC<{ usdEquivalent: number }> = ({ usdEquivalent }) => {
  const isTier1 = usdEquivalent <= 50000;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        background: isTier1 ? '#DBEAFE' : '#FEF3C7',
        color: isTier1 ? '#1D4ED8' : '#92400E',
      }}
    >
      {isTier1 ? 'Tier 1' : 'Tier 2'}
    </span>
  );
};

/* ─── KPI Card ─── */
const KpiCard: React.FC<{ label: string; value: string | number; accent: string; icon: string }> = ({
  label,
  value,
  accent,
  icon,
}) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 14,
      padding: '22px 26px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      flex: 1,
      minWidth: 200,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: accent + '18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  </div>
);

/* ─────────────────────────── main component ─────────────────────────── */
const TreasuryDashboard: React.FC = () => {
  const { user } = useAuth();

  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filtered, setFiltered] = useState<PaymentRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* modal state */
  const [selected, setSelected] = useState<PaymentRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [observation, setObservation] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [queryTargetRole, setQueryTargetRole] = useState('CAC');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  /* timeline modal */
  const [timelineRequestId, setTimelineRequestId] = useState<string | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  /* ── fetch ── */
  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/payment-requests?scope=treasury');
      const data: PaymentRequest[] = res.data?.data ?? res.data ?? [];
      setRequests(data);
    } catch {
      setError('Failed to load payment requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!statusFilter) {
      setFiltered(requests);
    } else {
      setFiltered(requests.filter((r) => r.status === statusFilter));
    }
  }, [requests, statusFilter]);

  /* ── KPI derived ── */
  const pendingCount = requests.filter(
    (r) => r.status === 'CAC Approved' || r.status === 'Clarified - Under Treasury Review'
  ).length;

  const authorizedMonth = requests.filter((r) =>
    r.status.startsWith('Treasury Approved')
  ).length;

  const totalAuthorizedMTD = fmt(
    requests
      .filter((r) => r.status.startsWith('Treasury Approved'))
      .reduce((sum, r) => sum + (r.usdEquivalent ?? 0), 0)
  );

  /* ── open modal ── */
  const openModal = (req: PaymentRequest) => {
    setSelected(req);
    setObservation('');
    setRejectionReason('');
    setQueryTargetRole('CAC');
    setModalError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  /* ── submit action ── */
  const handleAction = async (action: 'approve' | 'reject' | 'query') => {
    if (!selected) return;
    if (!observation.trim()) {
      setModalError('Treasury observation is required.');
      return;
    }
    if (action === 'reject' && !rejectionReason.trim()) {
      setModalError('Rejection reason is required.');
      return;
    }
    setSubmitting(true);
    setModalError('');
    try {
      await api.post(`/payment-requests/${selected.id}/treasury-review`, {
        action,
        observation: observation.trim(),
        rejectionReason: action === 'reject' ? rejectionReason.trim() : undefined,
        queryTargetRole: action === 'query' ? queryTargetRole : undefined,
      });
      closeModal();
      await fetchRequests();
    } catch (e: any) {
      setModalError(e?.response?.data?.message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── unique statuses for filter ── */
  const uniqueStatuses = Array.from(new Set(requests.map((r) => r.status)));

  /* ─────────────────────────── render ─────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* ── Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 36px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.2 }}>
                SG Treasury Portal
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6B7280' }}>
                Singapore Treasury — Payment Authorization
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#1E3A5F',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {user?.name?.charAt(0) ?? 'T'}
              </div>
              <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{user?.name ?? 'Treasury Officer'}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 36px' }}>
        {/* ── KPI Cards ── */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
          <KpiCard label="Pending Authorization" value={pendingCount} accent="#1D4ED8" icon="⏳" />
          <KpiCard label="Authorized This Month" value={authorizedMonth} accent="#059669" icon="✅" />
          <KpiCard label="Total Authorized (MTD)" value={totalAuthorizedMTD} accent="#7C3AED" icon="💰" />
        </div>

        {/* ── Table Card ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            overflow: 'hidden',
          }}
        >
          {/* Table header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid #F3F4F6',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Payment Requests</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  ...inputStyle,
                  width: 260,
                  padding: '8px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={fetchRequests}
                style={{
                  padding: '8px 16px',
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#374151',
                  fontWeight: 500,
                }}
              >
                ↺ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>Loading requests…</div>
          ) : error ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#DC2626' }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>No payment requests found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['REQUEST ID', 'TYPE', 'AGENT', 'BENEFICIARY', 'USD EQUIV.', 'TIER', 'STATUS', 'ACTIONS'].map(
                      (col) => (
                        <th
                          key={col}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#6B7280',
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid #E5E7EB',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req, idx) => (
                    <tr
                      key={req.id}
                      style={{
                        background: idx % 2 === 0 ? '#fff' : '#FAFAFA',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#EFF6FF')}
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLTableRowElement).style.background =
                          idx % 2 === 0 ? '#fff' : '#FAFAFA')
                      }
                    >
                      <td style={{ padding: '13px 16px', color: '#1D4ED8', fontWeight: 600, borderBottom: '1px solid #F3F4F6' }}>
                        {req.requestId}
                      </td>
                      <td style={{ padding: '13px 16px', color: '#374151', borderBottom: '1px solid #F3F4F6' }}>{req.type}</td>
                      <td style={{ padding: '13px 16px', color: '#374151', borderBottom: '1px solid #F3F4F6' }}>{req.agentCode}</td>
                      <td style={{ padding: '13px 16px', color: '#374151', borderBottom: '1px solid #F3F4F6', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.beneficiary}
                      </td>
                      <td style={{ padding: '13px 16px', color: '#111827', fontWeight: 600, borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }}>
                        {fmt(req.usdEquivalent)}
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: '1px solid #F3F4F6' }}>
                        <TierBadge usdEquivalent={req.usdEquivalent} />
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: '1px solid #F3F4F6' }}>
                        <StatusChip status={req.status} />
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: '1px solid #F3F4F6' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {(req.status === 'CAC Approved' || req.status === 'Clarified - Under Treasury Review') && (
                            <button
                              id={`authorize-btn-${req.id}`}
                              onClick={() => openModal(req)}
                              style={{
                                padding: '6px 14px',
                                background: '#1E3A5F',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 7,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#162D4A')}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#1E3A5F')}
                            >
                              Authorize
                            </button>
                          )}
                          <button
                            id={`timeline-btn-${req.id}`}
                            title="View Timeline"
                            onClick={() => {
                              setTimelineRequestId(req.id);
                              setTimelineOpen(true);
                            }}
                            style={{
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#F3F4F6',
                              border: '1px solid #E5E7EB',
                              borderRadius: 7,
                              cursor: 'pointer',
                              fontSize: 15,
                              color: '#6B7280',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#E5E7EB')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6')}
                          >
                            👁
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════ Treasury Review Modal ══════════════════ */}
      {modalOpen && selected && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 580,
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Treasury Review</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Authorize, query or reject this request</div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  width: 32,
                  height: 32,
                  border: 'none',
                  background: '#F3F4F6',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 18,
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {/* Request Summary */}
            <div
              style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 10,
                padding: 18,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                Request Summary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                {[
                  { label: 'Request ID', value: selected.requestId },
                  { label: 'Beneficiary', value: selected.beneficiary },
                  { label: 'Agent Code', value: selected.agentCode },
                  { label: 'USD Equivalent', value: fmt(selected.usdEquivalent) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginTop: 2 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <TierBadge usdEquivalent={selected.usdEquivalent} />
                <span style={{ marginLeft: 8 }}>
                  <StatusChip status={selected.status} />
                </span>
              </div>
            </div>

            {/* CAC Observation */}
            {selected.cacObservation && (
              <div
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  CAC Observation
                </div>
                <div style={{ fontSize: 14, color: '#1E3A5F', lineHeight: 1.5 }}>{selected.cacObservation}</div>
              </div>
            )}

            {/* Treasury Observation */}
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="treasury-observation" style={labelStyle}>
                Treasury Observation <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                id="treasury-observation"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={4}
                placeholder="Enter your treasury observation / remarks…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {/* Rejection Reason */}
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="rejection-reason" style={labelStyle}>
                Rejection Reason <span style={{ color: '#9CA3AF' }}>(required if rejecting)</span>
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                placeholder="State reason for rejection…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {/* Query Target Role */}
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="query-target-role" style={labelStyle}>
                Query Target Role <span style={{ color: '#9CA3AF' }}>(if raising query)</span>
              </label>
              <select
                id="query-target-role"
                value={queryTargetRole}
                onChange={(e) => setQueryTargetRole(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="CAC">CAC</option>
                <option value="Agent">Agent</option>
                <option value="GFSU">GFSU</option>
              </select>
            </div>

            {/* Error */}
            {modalError && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FECACA',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 18,
                  color: '#991B1B',
                  fontSize: 13,
                }}
              >
                {modalError}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={closeModal}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: '#fff',
                  border: '1px solid #D1D5DB',
                  borderRadius: 9,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                }}
              >
                Cancel
              </button>

              <button
                id="modal-raise-query-btn"
                onClick={() => handleAction('query')}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: '#FFFBEB',
                  border: '1px solid #F59E0B',
                  borderRadius: 9,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#92400E',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                ⚠ Raise Query
              </button>

              <button
                id="modal-reject-btn"
                onClick={() => handleAction('reject')}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 9,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#991B1B',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                ✕ Reject
              </button>

              <button
                id="modal-authorize-btn"
                onClick={() => handleAction('approve')}
                disabled={submitting}
                style={{
                  padding: '10px 22px',
                  background: submitting ? '#6EE7B7' : '#059669',
                  border: 'none',
                  borderRadius: 9,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#fff',
                  opacity: submitting ? 0.8 : 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = '#047857';
                }}
                onMouseLeave={(e) => {
                  if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = '#059669';
                }}
              >
                {submitting ? 'Processing…' : '✓ Authorize'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ Timeline Modal ══════════════════ */}
      {timelineOpen && timelineRequestId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { setTimelineOpen(false); setTimelineRequestId(null); } }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 560,
              maxHeight: '88vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Request Timeline</div>
              <button
                onClick={() => { setTimelineOpen(false); setTimelineRequestId(null); }}
                style={{
                  width: 32,
                  height: 32,
                  border: 'none',
                  background: '#F3F4F6',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 18,
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
            <RequestTimeline requestId={timelineRequestId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasuryDashboard;
