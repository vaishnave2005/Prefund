import React, { useEffect, useState, useCallback } from 'react';
import {
  Eye, RefreshCw, CheckCircle, XCircle, MessageSquare,
  FileText, Clock, AlertCircle, Shield, X, ChevronRight,
  Send, AlertTriangle
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import RequestTimeline from '../../components/shared/RequestTimeline';

// ─── Status Chip ────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    'Submitted':                                        { bg: '#F1F5F9', color: '#475569', label: 'Submitted' },
    'Under GFSU Review':                                { bg: '#FEF9C3', color: '#854D0E', label: 'Under GFSU Review' },
    'Query Raised':                                     { bg: '#FEF3C7', color: '#92400E', label: 'Query Raised' },
    'CAC Pending':                                      { bg: '#EDE9FE', color: '#5B21B6', label: 'CAC Pending' },
    'CAC Approved':                                     { bg: '#D1FAE5', color: '#065F46', label: 'CAC Approved' },
    'Treasury Approved - Pending GFSU Verification':    { bg: '#DBEAFE', color: '#1E40AF', label: 'Treasury Approved' },
    'Ready for SG AP Execution':                        { bg: '#DCFCE7', color: '#166534', label: 'Ready for AP' },
    'Payment Initiated':                                { bg: '#E0F2FE', color: '#0369A1', label: 'Payment Initiated' },
    'Paid':                                             { bg: '#D1FAE5', color: '#065F46', label: 'Payment Successful' },
    'Rejected by GFSU':                                 { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected by GFSU' },
    'Rejected by CAC':                                  { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected by CAC' },
    'Rejected by Treasury':                             { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected by Treasury' },
    'Clarified - Under GFSU Review':                    { bg: '#FEF9C3', color: '#854D0E', label: 'Clarified - GFSU' },
    'Clarified - Under CAC Review':                     { bg: '#EDE9FE', color: '#5B21B6', label: 'Clarified - CAC' },
    'Clarified - Under Treasury Review':                { bg: '#DBEAFE', color: '#1E40AF', label: 'Clarified - Treasury' },
  };
  const s = map[status] || { bg: '#F1F5F9', color: '#475569', label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

// ─── KPI Box ─────────────────────────────────────────────────────────────────
function KPIBox({ title, value, sub, icon, accent }: { title: string; value: string; sub?: string; icon: React.ReactNode; accent?: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{title}</p>
        <p style={{ fontSize: value.length > 6 ? 20 : 28, fontWeight: 700, color: accent || '#111827', lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{sub}</p>}
      </div>
      <div style={{ color: '#9CA3AF' }}>{icon}</div>
    </div>
  );
}

// ─── Tab definitions ─────────────────────────────────────────────────────────
type TabKey = 'incoming' | 'mycases' | 'posttreasury' | 'all';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'incoming',     label: 'Incoming Queue' },
  { key: 'mycases',      label: 'My Cases' },
  { key: 'posttreasury', label: 'Post-Treasury' },
  { key: 'all',          label: 'All Requests' },
];

const ALL_STATUSES = [
  'All', 'Submitted', 'Under GFSU Review', 'Query Raised', 'CAC Pending',
  'CAC Approved', 'Treasury Approved - Pending GFSU Verification',
  'Ready for SG AP Execution', 'Payment Initiated', 'Paid',
  'Rejected by GFSU', 'Rejected by CAC', 'Rejected by Treasury',
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GFSUDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('incoming');
  const [requests, setRequests]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [reviewReq, setReviewReq] = useState<any | null>(null);
  const [viewId, setViewId]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let params: Record<string, string> = {};
      if (activeTab === 'incoming')     params.queue = 'unassigned';
      if (activeTab === 'posttreasury') params.queue = 'post-treasury';
      const res = await api.get('/payment-requests', { params });
      setRequests(res.data.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { load(); setStatusFilter('All'); }, [load]);

  // KPI counts (across all data in the current tab result)
  const now = new Date();
  const allRequests = requests;
  const pending   = allRequests.filter(r => ['Submitted', 'Under GFSU Review', 'Clarified - Under GFSU Review'].includes(r.status)).length;
  const myActive  = allRequests.filter(r => r.assignedGfsuMember === user?.fullName && !['Paid','Rejected by GFSU','Rejected by CAC','Rejected by Treasury'].includes(r.status)).length;
  const queries   = allRequests.filter(r => r.status === 'Query Raised').length;
  const forwarded = allRequests.filter(r => r.status === 'Ready for SG AP Execution').length;

  // Filter for display
  const filtered = statusFilter === 'All' ? requests : requests.filter(r => r.status === statusFilter);

  // Determine which action button to show per tab
  function renderAction(req: any) {
    if (activeTab === 'incoming') {
      if (req.status === 'Submitted' && !req.assignedGfsuMember) {
        return (
          <button
            id={`claim-${req.id}`}
            onClick={() => handleClaim(req.id)}
            style={{ padding: '5px 12px', background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 6, color: '#065F46', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Claim
          </button>
        );
      }
      return null;
    }
    if (activeTab === 'mycases') {
      if (['Under GFSU Review', 'Clarified - Under GFSU Review'].includes(req.status)) {
        return (
          <button
            id={`review-${req.id}`}
            onClick={() => setReviewReq(req)}
            style={{ padding: '5px 12px', background: '#1E3A8A', border: 'none', borderRadius: 6, color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Review
          </button>
        );
      }
      return null;
    }
    if (activeTab === 'posttreasury') {
      return (
        <button
          id={`fwd-${req.id}`}
          onClick={() => setReviewReq(req)}
          style={{ padding: '5px 12px', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 6, color: '#166534', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Forward to AP
        </button>
      );
    }
    // all tab — eye only
    return (
      <button
        id={`view-${req.id}`}
        onClick={() => setViewId(req.id)}
        title="View Timeline"
        style={{ background: '#EFF6FF', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#1D4ED8', display: 'flex', alignItems: 'center' }}
      >
        <Eye size={13} />
      </button>
    );
  }

  async function handleClaim(id: string) {
    try {
      await api.post(`/payment-requests/${id}/claim`);
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to claim request');
    }
  }

  const selectStyle = {
    fontSize: 13, border: '1px solid #D1D5DB', borderRadius: 8,
    padding: '6px 28px 6px 10px', color: '#111827', background: 'white',
    cursor: 'pointer', appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 28px', fontFamily: "'Inter', system-ui, sans-serif", background: '#F3F4F6', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Shield size={22} color="#1D4ED8" />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>GFSU-AC Verification Hub</h1>
        </div>
        <p style={{ fontSize: 13, color: '#6B7280', marginLeft: 32 }}>Group Finance Service Unit — Accounts &amp; Control</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KPIBox title="PENDING QUEUE"     value={String(pending)}   icon={<Clock size={18} color="#6B7280" />} />
        <KPIBox title="MY ACTIVE CASES"   value={String(myActive)}  icon={<FileText size={18} color="#6B7280" />} />
        <KPIBox title="QUERIES RAISED"    value={String(queries)}   sub="Awaiting response" icon={<AlertCircle size={18} color="#EF4444" />} accent="#EF4444" />
        <KPIBox title="FORWARDED TO AP"   value={String(forwarded)} icon={<CheckCircle size={18} color="#6B7280" />} />
      </div>

      {/* Tab Bar + Table Card */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {/* Tab Bar */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #E5E7EB', padding: '0 20px', background: '#F9FAFB' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '13px 18px', fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? '#1D4ED8' : '#6B7280',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #1D4ED8' : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px 8px', display: 'flex', alignItems: 'center' }} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Table Toolbar */}
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6' }}>
          <p style={{ fontSize: 12, color: '#6B7280' }}>
            {activeTab === 'incoming'     && 'Unassigned requests awaiting GFSU claim.'}
            {activeTab === 'mycases'      && 'Requests assigned to you for review.'}
            {activeTab === 'posttreasury' && 'Treasury-approved requests pending GFSU final verification before SG AP execution.'}
            {activeTab === 'all'          && 'Complete audit view of all payment requests.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>STATUS</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <FileText size={40} color="#E5E7EB" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>No requests found</p>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>This queue is currently empty.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['REQUEST ID', 'TYPE', 'BENEFICIARY', 'AMOUNT', 'USD EQUIV.', 'STATUS', 'ACTIONS'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#6B7280', textAlign: 'left', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr
                    key={req.id}
                    style={{ borderTop: '1px solid #F3F4F6', background: 'white', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#1D4ED8', fontFamily: 'monospace' }}>{req.requestId}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>{req.requestType}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.beneficiaryName}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>{req.currency} {parseFloat(req.originalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#111827' }}>$ {parseFloat(req.usdEquivalent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '12px 16px' }}><StatusChip status={req.status} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {renderAction(req)}
                        {activeTab !== 'all' && (
                          <button
                            onClick={() => setViewId(req.id)}
                            title="View Timeline"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: '4px 6px' }}
                          >
                            <Eye size={13} />
                          </button>
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

      {/* Review Drawer / Modal */}
      {reviewReq && activeTab !== 'posttreasury' && (
        <GFSUReviewDrawer
          request={reviewReq}
          onClose={() => setReviewReq(null)}
          onSuccess={() => { setReviewReq(null); load(); }}
        />
      )}
      {reviewReq && activeTab === 'posttreasury' && (
        <PostTreasuryDrawer
          request={reviewReq}
          onClose={() => setReviewReq(null)}
          onSuccess={() => { setReviewReq(null); load(); }}
        />
      )}
      {viewId && <RequestTimeline requestId={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
}

// ─── GFSU Review Drawer ───────────────────────────────────────────────────────
function GFSUReviewDrawer({ request, onClose, onSuccess }: { request: any; onClose: () => void; onSuccess: () => void }) {
  const [action, setAction]               = useState<'approve' | 'query' | 'reject' | null>(null);
  const [observation, setObservation]     = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [queryTargetRole, setQueryTargetRole] = useState('AGENT');
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');

  async function handleSubmit() {
    if (!action)              { setError('Please select an action'); return; }
    if (!observation.trim())  { setError('GFSU Observation is required'); return; }
    if (action === 'reject' && !rejectionReason.trim()) { setError('Rejection reason is required'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post(`/payment-requests/${request.id}/gfsu-review`, {
        action,
        observation,
        rejectionReason: action === 'reject' ? rejectionReason : undefined,
        queryTargetRole: action === 'query'  ? queryTargetRole  : undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing review');
    } finally { setSubmitting(false); }
  }

  const actionOutcome: Record<string, string> = {
    approve: '→ Moves to CAC Pending',
    reject:  '→ Moves to Rejected by GFSU',
    query:   '→ Moves to Query Raised',
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000 }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 480,
        background: 'white', zIndex: 1001, boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif",
        animation: 'slideIn 0.25s ease',
      }}>
        {/* Drawer Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 2 }}>GFSU Review</h3>
            <p style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>{request.requestId} · {request.beneficiaryName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><X size={18} /></button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Request Detail */}
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Request Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12 }}>
              <div><span style={{ color: '#9CA3AF' }}>Agent:</span> <strong style={{ color: '#111827' }}>{request.agentCode}</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Type:</span> <strong style={{ color: '#111827' }}>{request.requestType}</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Amount:</span> <strong style={{ color: '#111827' }}>{request.currency} {parseFloat(request.originalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>USD Equiv.:</span> <strong style={{ color: '#111827' }}>$ {parseFloat(request.usdEquivalent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
              <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#9CA3AF' }}>Beneficiary:</span> <strong style={{ color: '#111827' }}>{request.beneficiaryName}</strong></div>
              <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#9CA3AF' }}>Status:</span> <StatusChip status={request.status} /></div>
            </div>
          </div>

          {request.agentRemarks && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>AGENT REMARKS</p>
              <p style={{ fontSize: 12, color: '#374151' }}>{request.agentRemarks}</p>
            </div>
          )}

          {/* GFSU Observation */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>GFSU Observation <span style={{ color: '#EF4444' }}>*</span></label>
            <textarea
              value={observation}
              onChange={e => setObservation(e.target.value)}
              rows={4}
              placeholder="Enter your verification observations and notes..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Action Selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Decision</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {([
                { key: 'approve', label: 'Approve', desc: 'Forward to CAC Pending', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
                { key: 'query',   label: 'Raise Query', desc: 'Hold for clarification', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
                { key: 'reject',  label: 'Reject',  desc: 'Reject this request',   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
              ] as const).map(opt => (
                <button
                  key={opt.key}
                  id={`action-${opt.key}`}
                  onClick={() => setAction(opt.key)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    border: `1px solid ${action === opt.key ? opt.border : '#E5E7EB'}`,
                    background: action === opt.key ? opt.bg : 'white',
                    transition: 'all 0.15s',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: action === opt.key ? opt.color : '#374151' }}>{opt.label}</span>
                    <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{opt.desc}</p>
                  </div>
                  {action === opt.key && <CheckCircle size={16} color={opt.color} />}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome hint */}
          {action && (
            <div style={{ padding: '8px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 600 }}>{actionOutcome[action]}</p>
            </div>
          )}

          {/* Query target role */}
          {action === 'query' && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Query Target Role</label>
              <select value={queryTargetRole} onChange={e => setQueryTargetRole(e.target.value)} style={inputStyle}>
                <option value="AGENT">Agent Office</option>
                <option value="CAC">CAC</option>
                <option value="TREASURY">Treasury</option>
              </select>
            </div>
          )}

          {/* Rejection reason */}
          {action === 'reject' && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Rejection Reason <span style={{ color: '#EF4444' }}>*</span></label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Provide a clear reason for rejection..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626', display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 16 }}>
              <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
              {error}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10, justifyContent: 'flex-end', background: '#F9FAFB' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500 }}>
            Cancel
          </button>
          <button
            id="submit-gfsu-review"
            onClick={handleSubmit}
            disabled={submitting || !action}
            style={{
              padding: '9px 20px', background: submitting || !action ? '#9CA3AF' : '#1D4ED8',
              color: 'white', border: 'none', borderRadius: 8,
              cursor: submitting || !action ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Send size={13} />
            {submitting ? 'Processing...' : 'Submit Decision'}
          </button>
        </div>
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
}

// ─── Post-Treasury Drawer ─────────────────────────────────────────────────────
function PostTreasuryDrawer({ request, onClose, onSuccess }: { request: any; onClose: () => void; onSuccess: () => void }) {
  const [gfsuFinalRemarks, setGfsuFinalRemarks] = useState('');
  const [actualReleaseDate, setActualReleaseDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!actualReleaseDate)        { setError('Final Payment Value Date is required'); return; }
    if (!gfsuFinalRemarks.trim())  { setError('GFSU Final Remarks are required'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post(`/payment-requests/${request.id}/post-treasury-review`, {
        action: 'forward',
        gfsuFinalRemarks,
        actualReleaseDate,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error forwarding request');
    } finally { setSubmitting(false); }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 460,
        background: 'white', zIndex: 1001, boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif",
        animation: 'slideIn 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 2 }}>Post-Treasury Verification</h3>
            <p style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>{request.requestId}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Request summary */}
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Request Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12 }}>
              <div><span style={{ color: '#9CA3AF' }}>Agent:</span> <strong style={{ color: '#111827' }}>{request.agentCode}</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Beneficiary:</span> <strong style={{ color: '#111827' }}>{request.beneficiaryName}</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>USD Equiv.:</span> <strong style={{ color: '#111827' }}>$ {parseFloat(request.usdEquivalent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
              <div><span style={{ color: '#9CA3AF' }}>Treasury By:</span> <strong style={{ color: '#111827' }}>{request.treasuryReviewedBy || '—'}</strong></div>
              {request.treasuryObservation && (
                <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#9CA3AF' }}>Treasury Remarks:</span> <span style={{ color: '#374151', fontSize: 12 }}>{request.treasuryObservation}</span></div>
              )}
            </div>
          </div>

          {/* Info banner */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, marginBottom: 20 }}>
            <AlertTriangle size={14} color="#1D4ED8" style={{ marginTop: 1, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: '#1E40AF' }}>Forwarding will move this request to <strong>Ready for SG AP Execution</strong>.</p>
          </div>

          {/* Final Payment Value Date */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Final Payment Value Date <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="date"
              value={actualReleaseDate}
              onChange={e => setActualReleaseDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* GFSU Final Remarks */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>GFSU Final Remarks <span style={{ color: '#EF4444' }}>*</span></label>
            <textarea
              value={gfsuFinalRemarks}
              onChange={e => setGfsuFinalRemarks(e.target.value)}
              rows={5}
              placeholder="Enter final verification remarks before forwarding to SG AP..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10, justifyContent: 'flex-end', background: '#F9FAFB' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500 }}>
            Cancel
          </button>
          <button
            id="submit-post-treasury"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '9px 20px', background: submitting ? '#9CA3AF' : '#059669',
              color: 'white', border: 'none', borderRadius: 8,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <ChevronRight size={14} />
            {submitting ? 'Forwarding...' : 'Forward to SG AP'}
          </button>
        </div>
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5,
};
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #D1D5DB', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: '#111827',
  background: 'white', outline: 'none', boxSizing: 'border-box',
};
