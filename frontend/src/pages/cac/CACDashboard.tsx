import React, { useEffect, useState, useCallback, CSSProperties } from 'react';
import {
  Eye, CheckCircle, X, DollarSign, FileText, Clock,
  AlertCircle, Activity,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import RequestTimeline from '../../components/shared/RequestTimeline';

// ─── Status chip (same pattern as AgentDashboard) ─────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    'Submitted':                                       { bg: '#F1F5F9', color: '#475569', label: 'Submitted' },
    'Under GFSU Review':                               { bg: '#FEF9C3', color: '#854D0E', label: 'Under GFSU Review' },
    'Query Raised':                                    { bg: '#FEF3C7', color: '#92400E', label: 'Query Raised' },
    'CAC Pending':                                     { bg: '#EDE9FE', color: '#5B21B6', label: 'CAC Pending' },
    'CAC Approved':                                    { bg: '#D1FAE5', color: '#065F46', label: 'CAC Approved' },
    'Treasury Approved - Pending GFSU Verification':   { bg: '#DBEAFE', color: '#1E40AF', label: 'Treasury Approved' },
    'Ready for SG AP Execution':                       { bg: '#DCFCE7', color: '#166534', label: 'Ready for AP' },
    'Payment Initiated':                               { bg: '#E0F2FE', color: '#0369A1', label: 'Payment Initiated' },
    'Paid':                                            { bg: '#D1FAE5', color: '#065F46', label: 'Payment Successful' },
    'Rejected by GFSU':                                { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected by GFSU' },
    'Rejected by CAC':                                 { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected by CAC' },
    'Rejected by Treasury':                            { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected by Treasury' },
    'Clarified - Under GFSU Review':                   { bg: '#FEF9C3', color: '#854D0E', label: 'Clarified - GFSU' },
    'Clarified - Under CAC Review':                    { bg: '#EDE9FE', color: '#5B21B6', label: 'Clarified - CAC' },
    'Clarified - Under Treasury Review':               { bg: '#DBEAFE', color: '#1E40AF', label: 'Clarified - Treasury' },
  };
  const s = map[status] || { bg: '#F1F5F9', color: '#475569', label: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

// ─── KPI box (same pattern as AgentDashboard) ─────────────────────────────────
function KPIBox({
  title, value, sub, icon, accent,
}: {
  title: string; value: string; sub?: string;
  icon: React.ReactNode; accent?: string;
}) {
  return (
    <div style={{
      background: 'white', border: '1px solid #E5E7EB',
      borderRadius: 12, padding: '18px 20px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    }}>
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#6B7280',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
        }}>{title}</p>
        <p style={{
          fontSize: value.length > 6 ? 20 : 28,
          fontWeight: 700, color: accent || '#111827', lineHeight: 1.1,
        }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{sub}</p>}
      </div>
      <div style={{ color: '#9CA3AF' }}>{icon}</div>
    </div>
  );
}

// ─── CAC Review Modal ──────────────────────────────────────────────────────────
function CACReviewModal({ request, onClose, onSuccess }: {
  request: any; onClose: () => void; onSuccess: () => void;
}) {
  const [action, setAction] = useState<'approve' | 'query' | 'reject' | null>(null);
  const [observation, setObservation] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [queryTargetRole, setQueryTargetRole] = useState('AGENT');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!action) { setError('Please select an action.'); return; }
    if (!observation.trim()) { setError('CAC Observation is required.'); return; }
    if (action === 'reject' && !rejectionReason.trim()) {
      setError('Rejection reason is required.'); return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/payment-requests/${request.id}/cac-review`, {
        action,
        observation,
        rejectionReason: action === 'reject' ? rejectionReason : undefined,
        queryTargetRole: action === 'query' ? queryTargetRole : undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error submitting CAC decision.');
    } finally {
      setSubmitting(false);
    }
  }

  const actionBtns: { key: 'approve' | 'query' | 'reject'; label: string; color: string; activeColor: string }[] = [
    { key: 'approve', label: 'Approve',     color: '#16A34A', activeColor: '#F0FDF4' },
    { key: 'query',   label: 'Raise Query', color: '#D97706', activeColor: '#FFFBEB' },
    { key: 'reject',  label: 'Reject',      color: '#DC2626', activeColor: '#FEF2F2' },
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        zIndex: 1000, display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', padding: '40px 20px', overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white', borderRadius: 12, width: '100%', maxWidth: 600,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #E5E7EB',
        }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 2 }}>
              CAC Review
            </h3>
            <p style={{ fontSize: 12, color: '#6B7280' }}>Credit Approvals Committee Decision</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Request Details Summary */}
          <div style={{
            background: '#F9FAFB', border: '1px solid #E5E7EB',
            borderRadius: 10, padding: '14px 16px', marginBottom: 18,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Request Details
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
              {[
                ['Request ID', request.requestId],
                ['Type',       request.requestType],
                ['Beneficiary', request.beneficiaryName],
                ['Agent',       request.agentCode || request.submittedBy || '—'],
                ['Amount',      `${request.currency} ${parseFloat(request.originalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
                ['USD Equiv.',  `$ ${parseFloat(request.usdEquivalent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{k}: </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{v}</span>
                </div>
              ))}
            </div>
            {request.gfsuObservation && (
              <div style={{
                marginTop: 12, padding: '10px 12px',
                background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 8,
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', marginBottom: 4, textTransform: 'uppercase' }}>
                  GFSU Observation
                </p>
                <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{request.gfsuObservation}</p>
              </div>
            )}
          </div>

          {/* CAC Observation */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>CAC Observation <span style={{ color: '#DC2626' }}>*</span></label>
            <textarea
              style={{ ...inputStyle, height: 90, resize: 'vertical' }}
              value={observation}
              onChange={e => setObservation(e.target.value)}
              placeholder="Enter CAC committee observation and review notes..."
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {actionBtns.map(({ key, label, color, activeColor }) => (
              <button
                key={key}
                onClick={() => setAction(key)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8,
                  border: `2px solid ${action === key ? color : '#E5E7EB'}`,
                  background: action === key ? activeColor : 'white',
                  color: action === key ? color : '#6B7280',
                  fontWeight: 700, cursor: 'pointer', fontSize: 13,
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Query Target Role */}
          {action === 'query' && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Query Target Role</label>
              <select
                value={queryTargetRole}
                onChange={e => setQueryTargetRole(e.target.value)}
                style={inputStyle}
              >
                {['AGENT', 'GFSU_AC', 'TREASURY'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {/* Rejection Reason */}
          {action === 'reject' && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                Rejection Reason <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                style={{ ...inputStyle, height: 72, resize: 'vertical' }}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="State the reason for rejection clearly..."
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 14, padding: '10px 14px',
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, fontSize: 13, color: '#DC2626',
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8,
                background: 'white', cursor: 'pointer', fontSize: 13, color: '#374151',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !action}
              style={{
                padding: '9px 20px',
                background: !action || submitting ? '#9CA3AF' : '#1E3A5F',
                color: 'white', border: 'none', borderRadius: 8,
                cursor: !action || submitting ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'background 0.15s',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit CAC Decision'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const ALL_STATUSES = [
  'All', 'CAC Pending', 'Clarified - Under CAC Review',
  'CAC Approved', 'Rejected by CAC',
  'Submitted', 'Under GFSU Review', 'Query Raised',
  'Treasury Approved - Pending GFSU Verification',
  'Ready for SG AP Execution', 'Payment Initiated', 'Paid',
  'Rejected by GFSU', 'Rejected by Treasury',
];

export default function CACDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment-requests');
      setRequests(res.data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // KPI calculations
  const now = new Date();
  const cacReviewStatuses = ['CAC Pending', 'Clarified - Under CAC Review'];
  const pendingApproval = requests.filter(r => cacReviewStatuses.includes(r.status)).length;

  const mtdApproved = requests.filter(r => {
    const d = new Date(r.createdAt);
    return r.status === 'CAC Approved' &&
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const approvedCount = mtdApproved.length;
  const approvedValue = mtdApproved.reduce((s, r) => s + parseFloat(r.usdEquivalent || 0), 0);

  const filtered = statusFilter === 'All'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  return (
    <div style={{
      maxWidth: 1280, margin: '0 auto',
      padding: '32px 28px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          CAC Executive Portal
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280' }}>Credit Approvals Committee</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <KPIBox
          title="Pending Approval"
          value={String(pendingApproval)}
          sub="Awaiting CAC decision"
          icon={<Clock size={18} color="#6B7280" />}
        />
        <KPIBox
          title="Approved This Month"
          value={String(approvedCount)}
          sub="CAC Approved (MTD)"
          icon={<CheckCircle size={18} color="#6B7280" />}
        />
        <KPIBox
          title="Total Value Approved (MTD)"
          value={`$${(approvedValue / 1_000_000).toFixed(2)}M`}
          sub="USD equivalent"
          icon={<DollarSign size={18} color="#6B7280" />}
        />
      </div>

      {/* Requests Table Card */}
      <div style={{
        background: 'white', borderRadius: 12,
        border: '1px solid #E5E7EB', overflow: 'hidden',
      }}>
        {/* Table toolbar */}
        <div style={{
          padding: '16px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
            Payment Requests
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>STATUS</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                fontSize: 13, border: '1px solid #D1D5DB', borderRadius: 8,
                padding: '6px 28px 6px 10px', color: '#111827',
                background: 'white', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
              }}
            >
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table body */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>
            Loading requests...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <FileText size={40} color="#E5E7EB" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>No requests found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {[
                    'REQUEST ID', 'TYPE', 'AGENT', 'BENEFICIARY',
                    'USD EQUIV.', 'REQUEST DATE', 'STATUS', 'ACTIONS',
                  ].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', fontSize: 11, fontWeight: 700,
                      color: '#6B7280', textAlign: 'left',
                      letterSpacing: '0.05em', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => {
                  const canReview = cacReviewStatuses.includes(req.status);
                  const requestDate = req.createdAt
                    ? new Date(req.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr
                      key={req.id}
                      style={{ borderTop: '1px solid #F3F4F6', background: 'white', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    >
                      {/* REQUEST ID */}
                      <td style={{
                        padding: '12px 16px', fontSize: 12, fontWeight: 700,
                        color: '#1D4ED8', fontFamily: 'monospace', whiteSpace: 'nowrap',
                      }}>
                        {req.requestId}
                      </td>
                      {/* TYPE */}
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>
                        {req.requestType}
                      </td>
                      {/* AGENT */}
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>
                        {req.agentCode || req.submittedBy || '—'}
                      </td>
                      {/* BENEFICIARY */}
                      <td style={{
                        padding: '12px 16px', fontSize: 12, color: '#374151',
                        maxWidth: 160, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {req.beneficiaryName}
                      </td>
                      {/* USD EQUIV */}
                      <td style={{
                        padding: '12px 16px', fontSize: 12,
                        fontWeight: 600, color: '#111827', whiteSpace: 'nowrap',
                      }}>
                        $ {parseFloat(req.usdEquivalent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      {/* REQUEST DATE */}
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {requestDate}
                      </td>
                      {/* STATUS */}
                      <td style={{ padding: '12px 16px' }}>
                        <StatusChip status={req.status} />
                      </td>
                      {/* ACTIONS */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
                          {canReview && (
                            <button
                              id={`cac-review-btn-${req.id}`}
                              onClick={() => setSelected(req)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                background: '#1E3A5F', color: 'white',
                                border: 'none', borderRadius: 7,
                                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                                cursor: 'pointer', whiteSpace: 'nowrap',
                              }}
                            >
                              Review &amp; Approve
                            </button>
                          )}
                          <button
                            id={`view-btn-${req.id}`}
                            onClick={() => setViewId(req.id)}
                            title="View details"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              background: 'none', border: '1px solid #E5E7EB',
                              borderRadius: 7, padding: '5px 9px',
                              color: '#6B7280', cursor: 'pointer', fontSize: 12,
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            id={`timeline-btn-${req.id}`}
                            onClick={() => setViewId(req.id)}
                            title="View timeline"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              background: 'none', border: '1px solid #E5E7EB',
                              borderRadius: 7, padding: '5px 9px',
                              color: '#6B7280', cursor: 'pointer', fontSize: 12,
                            }}
                          >
                            <Activity size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {selected && (
        <CACReviewModal
          request={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => { setSelected(null); load(); }}
        />
      )}
      {viewId && (
        <RequestTimeline requestId={viewId} onClose={() => setViewId(null)} />
      )}
    </div>
  );
}

// ─── Shared form styles ────────────────────────────────────────────────────────
const labelStyle: CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: '#374151', marginBottom: 5,
};

const inputStyle: CSSProperties = {
  width: '100%', border: '1px solid #D1D5DB', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: '#111827',
  background: 'white', outline: 'none', boxSizing: 'border-box',
};
