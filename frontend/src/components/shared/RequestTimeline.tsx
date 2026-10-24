import React, { useEffect, useState } from 'react';
import { X, FileText, Download, Clock, CheckCircle, User } from 'lucide-react';
import api from '../../lib/api';
import { formatCurrency, formatDateTime, formatIST, displayStatus, getPipelineStage } from '../../lib/utils';
import StatusBadge from './StatusBadge';

interface RequestTimelineProps {
  requestId: string;
  onClose: () => void;
}

const PIPELINE_STAGES = [
  { label: 'Submitted', stage: 0 },
  { label: 'GFSU Review', stage: 1 },
  { label: 'CAC Approval', stage: 2 },
  { label: 'Treasury Auth', stage: 3 },
  { label: 'GFSU Verify', stage: 4 },
  { label: 'SG AP', stage: 5 },
  { label: 'Complete', stage: 6 },
];

export default function RequestTimeline({ requestId, onClose }: RequestTimelineProps) {
  const [pr, setPr] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prRes, auditRes] = await Promise.all([
          api.get(`/payment-requests/${requestId}`),
          api.get(`/audit-log/${pr?.requestId || ''}`).catch(() => ({ data: [] })),
        ]);
        setPr(prRes.data);
        // Load audit by request UUID
        const auditRes2 = await api.get(`/audit-log/${prRes.data.requestId}`).catch(() => ({ data: [] }));
        setAuditLogs(Array.isArray(auditRes2.data) ? auditRes2.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [requestId]);

  if (loading) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 680, padding: 40, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div className="skeleton" style={{ height: 20, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 20, width: '60%' }} />
      </div>
    </div>
  );

  if (!pr) return null;

  const currentStage = getPipelineStage(pr.status);
  const isRejected = pr.status?.toLowerCase().includes('rejected');

  // Merge query thread + audit logs into timeline
  const timelineEvents = [
    ...(pr.queryThread || []).map((q: any) => ({ ...q, type: 'query', createdAt: q.timestamp })),
    ...auditLogs.map((a: any) => ({ ...a, type: 'audit' })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 780, padding: 0 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0A2540', borderRadius: '16px 16px 0 0' }}>
          <div>
            <h2 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: 18, margin: 0 }}>Request Details</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>{pr.requestId}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge status={pr.status} />
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Pipeline Strip */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Workflow Pipeline</p>
            <div className="pipeline-strip">
              {PIPELINE_STAGES.map((s, i) => (
                <React.Fragment key={s.stage}>
                  <div className="pipeline-step">
                    <div className={`pipeline-node${currentStage > s.stage ? ' done' : currentStage === s.stage ? ' active' : ''}`}>
                      {s.label}
                    </div>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && <span className="pipeline-arrow">›</span>}
                </React.Fragment>
              ))}
            </div>
            {isRejected && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
                ⚠️ Rejected by {pr.rejectedBy}: {pr.rejectionReason}
              </div>
            )}
          </div>

          {/* Submission Specs */}
          <div className="card">
            <div className="card-header"><p style={{ fontWeight: 600, fontSize: 13, color: '#0A2540' }}>📋 Submission Details</p></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: 13 }}>
                {[
                  ['Request ID', pr.requestId],
                  ['Request Type', pr.requestType],
                  ['Agent Code', pr.agentCode],
                  ['Beneficiary', pr.beneficiaryName],
                  ['Currency', pr.currency],
                  ['Original Amount', formatCurrency(pr.originalAmount, pr.currency)],
                  ['Rate of Exchange', pr.roe ? `${pr.roe}` : '—'],
                  ['USD Equivalent', pr.usdEquivalent ? formatCurrency(pr.usdEquivalent) : '—'],
                  ['Remittance Bank', pr.remittanceBank || '—'],
                  ['Account / IBAN', pr.bankAccountNumber || '—'],
                  ['SWIFT Code', pr.swiftCode || '—'],
                  ['Value Date', pr.actualReleaseDate ? formatDate(pr.actualReleaseDate) : '—'],
                  ['LMS Entry', pr.lmsEntry ? 'Yes' : 'No'],
                  ['Initiated By', pr.initiatedBy || '—'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                    <p style={{ color: '#1E293B', marginTop: 2, fontWeight: 500 }}>{val}</p>
                  </div>
                ))}
              </div>
              {pr.remarks && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: '#F8FAFC', borderRadius: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>REMARKS</p>
                  <p style={{ fontSize: 13, color: '#1E293B' }}>{pr.remarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {(pr.documents?.length > 0 || pr.mt103Url) && (
            <div className="card">
              <div className="card-header"><p style={{ fontWeight: 600, fontSize: 13, color: '#0A2540' }}>📎 Attached Documents</p></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(pr.documents || []).map((doc: any, i: number) => (
                  <a key={i} href={doc.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F8FAFC', borderRadius: 8, textDecoration: 'none', color: '#0A2540', fontSize: 13, border: '1px solid #E2E8F0' }}>
                    <FileText size={14} /><span style={{ flex: 1 }}>{doc.name}</span><Download size={14} />
                  </a>
                ))}
                {pr.mt103Url && (
                  <a href={pr.mt103Url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#ECFDF5', borderRadius: 8, textDecoration: 'none', color: '#059669', fontSize: 13, border: '1px solid #A7F3D0', fontWeight: 600 }}>
                    <FileText size={14} /><span style={{ flex: 1 }}>SWIFT MT103 Receipt</span><Download size={14} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Stage Observations */}
          <div className="card">
            <div className="card-header"><p style={{ fontWeight: 600, fontSize: 13, color: '#0A2540' }}>🗒️ Stage Observations</p></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'GFSU Observation', value: pr.gfsuObservation, reviewer: pr.gfsuReviewedBy, at: pr.gfsuReviewedAt },
                { label: 'CAC Observation', value: pr.cacObservation, reviewer: pr.cacReviewedBy, at: pr.cacReviewedAt },
                { label: 'Treasury Remarks', value: pr.treasuryObservation, reviewer: pr.treasuryReviewedBy, at: pr.treasuryReviewedAt },
                { label: 'GFSU Final Remarks', value: pr.gfsuFinalRemarks, reviewer: pr.gfsuForwardedBy, at: null },
                { label: 'Rejection Reason', value: pr.rejectionReason, reviewer: pr.rejectedBy, at: null },
              ].filter(o => o.value).map((obs, i) => (
                <div key={i} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, borderLeft: '3px solid #0A2540' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>{obs.label}</p>
                  <p style={{ fontSize: 13, color: '#1E293B' }}>{obs.value}</p>
                  {obs.reviewer && <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>— {obs.reviewer} {obs.at ? `· ${formatDateTime(obs.at)}` : ''}</p>}
                </div>
              ))}
              {!pr.gfsuObservation && !pr.cacObservation && !pr.treasuryObservation && !pr.rejectionReason && (
                <p style={{ fontSize: 13, color: '#94A3B8' }}>No stage observations yet.</p>
              )}
            </div>
          </div>

          {/* 360° Communication & Audit Timeline */}
          {timelineEvents.length > 0 && (
            <div className="card">
              <div className="card-header"><p style={{ fontWeight: 600, fontSize: 13, color: '#0A2540' }}>🔄 360° Communication & Audit History</p></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {timelineEvents.map((event, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 16, borderLeft: '2px solid #E2E8F0', marginLeft: 16, paddingLeft: 16, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -8, top: 0, width: 14, height: 14, borderRadius: '50%', background: event.type === 'query' ? '#D32F2F' : '#0A2540', border: '2px solid white' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: event.type === 'query' ? '#FEF2F2' : '#EFF6FF', color: event.type === 'query' ? '#D32F2F' : '#0A2540' }}>
                          {event.type === 'query' ? 'QUERY' : event.action}
                        </span>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>{formatIST(event.createdAt)}</span>
                      </div>
                      {event.type === 'query' ? (
                        <p style={{ fontSize: 13, color: '#1E293B' }}>{event.message}</p>
                      ) : (
                        <p style={{ fontSize: 13, color: '#1E293B' }}>
                          {event.previousStatus && <span style={{ color: '#94A3B8', textDecoration: 'line-through', marginRight: 6 }}>{event.previousStatus}</span>}
                          {event.newStatus && <span style={{ fontWeight: 600 }}>{event.newStatus}</span>}
                          {event.remarks && <span style={{ color: '#64748B' }}> — {event.remarks}</span>}
                        </p>
                      )}
                      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                        <User size={10} style={{ display: 'inline', marginRight: 3 }} />
                        {event.from || event.actorId} {event.actorRole ? `· ${event.actorRole}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
