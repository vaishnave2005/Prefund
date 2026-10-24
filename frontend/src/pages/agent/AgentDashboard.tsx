import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Plus, Eye, RefreshCw, Edit2, DollarSign, Clock, AlertTriangle,
  CheckCircle, FileText, X, Download, Upload, Lock, AlertCircle,
  ChevronDown, Shield
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate, displayStatus } from '../../lib/utils';
import RequestTimeline from '../../components/shared/RequestTimeline';

// DB-valid currencies only
const CURRENCIES = ['USD', 'EUR', 'XOF', 'CNY', 'SGD', 'INR'];
const REQUEST_TYPES = ['Pre-Funding', 'Cost-Plus Commission'];

// Exact status badge from screenshots
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    'Submitted':                              { bg: '#F1F5F9', color: '#475569', label: 'Submitted' },
    'Under GFSU Review':                      { bg: '#FEF9C3', color: '#854D0E', label: 'Under GFSU Review' },
    'Query Raised':                           { bg: '#FEF3C7', color: '#92400E', label: 'Query Raised' },
    'CAC Pending':                            { bg: '#EDE9FE', color: '#5B21B6', label: 'CAC Pending' },
    'CAC Approved':                           { bg: '#D1FAE5', color: '#065F46', label: 'CAC Approved' },
    'Treasury Approved - Pending GFSU Verification': { bg: '#DBEAFE', color: '#1E40AF', label: 'Treasury Approved' },
    'Ready for SG AP Execution':              { bg: '#DCFCE7', color: '#166534', label: 'Ready for AP' },
    'Payment Initiated':                      { bg: '#E0F2FE', color: '#0369A1', label: 'Payment Initiated' },
    'Paid':                                   { bg: '#D1FAE5', color: '#065F46', label: 'Payment Successful' },
    'Rejected by GFSU':                       { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected by GFSU' },
    'Rejected by CAC':                        { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected by CAC' },
    'Rejected by Treasury':                   { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected by Treasury' },
    'Clarified - Under GFSU Review':          { bg: '#FEF9C3', color: '#854D0E', label: 'Clarified - GFSU' },
    'Clarified - Under CAC Review':           { bg: '#EDE9FE', color: '#5B21B6', label: 'Clarified - CAC' },
    'Clarified - Under Treasury Review':      { bg: '#DBEAFE', color: '#1E40AF', label: 'Clarified - Treasury' },
  };
  const s = map[status] || { bg: '#F1F5F9', color: '#475569', label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editRequest, setEditRequest] = useState<any>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, agentRes] = await Promise.all([
        api.get('/payment-requests'),
        api.get(`/master-data/agents/${user?.assignedOfficeCode}`),
      ]);
      setRequests(reqRes.data.items || []);
      setAgentInfo(agentRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const mtdRequests = requests.filter(r => {
    const d = new Date(r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalMTD = mtdRequests.reduce((s, r) => s + parseFloat(r.usdEquivalent || 0), 0);
  const pending = requests.filter(r => !['Paid', 'Rejected by GFSU', 'Rejected by CAC', 'Rejected by Treasury'].includes(r.status)).length;
  const actionRequired = requests.filter(r => ['Query Raised', 'Rejected by GFSU', 'Rejected by CAC', 'Rejected by Treasury'].includes(r.status)).length;
  const paid = requests.filter(r => r.status === 'Paid').length;

  const ALL_STATUSES = ['All', 'Submitted', 'Under GFSU Review', 'CAC Pending', 'CAC Approved', 'Payment Initiated', 'Paid', 'Rejected by GFSU', 'Rejected by CAC', 'Rejected by Treasury', 'Query Raised'];
  const filtered = statusFilter === 'All' ? requests : requests.filter(r => r.status === statusFilter);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Agent Dashboard</h1>
        <p style={{ fontSize: 13, color: '#6B7280' }}>
          Agency Office — {agentInfo?.agentName || user?.assignedOfficeCode} ({user?.assignedOfficeCode})
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KPIBox title="TOTAL REQUESTED (MTD)" value={`$ ${totalMTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={<FileText size={18} color="#6B7280" />} />
        <KPIBox title="PENDING REVIEW" value={String(pending)} icon={<Clock size={18} color="#6B7280" />} />
        <KPIBox title="ACTION REQUIRED" value={String(actionRequired)} sub="Open queries & rejections" icon={<AlertCircle size={18} color="#EF4444" />} accent="#EF4444" />
        <KPIBox title="PAYMENT SUCCESSFUL" value={String(paid)} icon={<CheckCircle size={18} color="#6B7280" />} />
      </div>

      {/* Live Tracker */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Live Tracker</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>STATUS</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ fontSize: 13, border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 28px 6px 10px', color: '#111827', background: 'white', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
              >
                {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button
              id="create-request-btn"
              onClick={() => setShowCreate(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={15} /> Create New Request
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <FileText size={40} color="#E5E7EB" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>No requests found</p>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Click "Create New Request" to submit your first payment</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['ID', 'TYPE', 'BENEFICIARY', 'AMOUNT', 'USD EQUIV.', 'STATUS', 'ACTIONS'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#6B7280', textAlign: 'left', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((req, i) => (
                  <tr key={req.id} style={{ borderTop: '1px solid #F3F4F6', background: i % 2 === 0 ? 'white' : 'white', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#1D4ED8', fontFamily: 'monospace' }}>{req.requestId}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>{req.requestType}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.beneficiaryName}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#374151' }}>{req.currency} {parseFloat(req.originalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#111827' }}>$ {parseFloat(req.usdEquivalent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '12px 16px' }}><StatusChip status={req.status} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={() => setViewId(req.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                          <Eye size={14} /> Timeline
                        </button>
                        {req.mt103Url && (
                          <a href={req.mt103Url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                            <Download size={13} /> MT103
                          </a>
                        )}
                        {['Rejected by GFSU', 'Rejected by CAC', 'Rejected by Treasury', 'Query Raised'].includes(req.status) && (
                          <button onClick={() => setEditRequest(req)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FEE2E2', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#DC2626', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            <Edit2 size={12} /> Edit
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

      {showCreate && <CreateRequestModal agentInfo={agentInfo} user={user} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); load(); }} />}
      {editRequest && <EditResubmitModal request={editRequest} onClose={() => setEditRequest(null)} onSuccess={() => { setEditRequest(null); load(); }} />}
      {viewId && <RequestTimeline requestId={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
}

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

function CreateRequestModal({ agentInfo, user, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    requestType: 'Pre-Funding',
    currency: agentInfo?.defaultCurrency || 'USD',
    beneficiaryName: agentInfo?.agentName || '',
    remittanceBank: agentInfo?.bankName || '',
    bankAccountNumber: agentInfo?.accountNumberIban || '',
    swiftCode: agentInfo?.swiftCode || '',
    originalAmount: '',
    roe: '1',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const usdEq = form.originalAmount && form.roe
    ? (parseFloat(form.originalAmount) * parseFloat(form.roe)).toFixed(2)
    : '0.00';

  // Check if submitted after Thursday 18:00 IST
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dayIST = ist.getUTCDay(); // 4 = Thursday
  const hourIST = ist.getUTCHours();
  const isAfterCutoff = dayIST > 4 || (dayIST === 4 && hourIST >= 18);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.beneficiaryName || !form.originalAmount) {
      setError('Beneficiary name and amount are required');
      return;
    }
    if (!CURRENCIES.includes(form.currency)) {
      setError('Please select a valid currency');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        requestType: form.requestType,
        beneficiaryName: form.beneficiaryName,
        currency: form.currency,
        originalAmount: parseFloat(form.originalAmount),
        roe: parseFloat(form.roe) || 1,
        remarks: form.remarks,
      };
      await api.post('/payment-requests', payload);
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: "'Inter', system-ui, sans-serif" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Create New Request</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Ad-hoc warning */}
          {isAfterCutoff && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: 14 }}>
              <AlertCircle size={15} color="#DC2626" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#DC2626', fontWeight: 500 }}>Submitted past Thursday 18:00 IST — Ad-hoc approval by Evelyn required.</p>
            </div>
          )}

          {/* Office lock strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={14} color="#16A34A" />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#15803D' }}>{user?.assignedOfficeCode}</span>
              <span style={{ fontSize: 12, color: '#374151' }}>· {agentInfo?.agentName}</span>
            </div>
            <span style={{ fontSize: 11, color: '#6B7280' }}>Locked to signed-in office</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Row 1: Type + Currency */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Request Type</label>
                <select style={inputStyle} value={form.requestType} onChange={e => setForm(p => ({ ...p, requestType: e.target.value }))}>
                  {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Currency</label>
                <select style={inputStyle} value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Beneficiary */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Beneficiary / Agent Name</label>
              <input style={inputStyle} value={form.beneficiaryName} onChange={e => setForm(p => ({ ...p, beneficiaryName: e.target.value }))} placeholder="PIL Nigeria Ltd" />
            </div>

            {/* Bank + Account */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Remittance Bank</label>
                <input style={inputStyle} value={form.remittanceBank} onChange={e => setForm(p => ({ ...p, remittanceBank: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Account / IBAN</label>
                <input style={inputStyle} value={form.bankAccountNumber} onChange={e => setForm(p => ({ ...p, bankAccountNumber: e.target.value }))} />
              </div>
            </div>

            {/* SWIFT + Amount */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>SWIFT Code</label>
                <input style={inputStyle} value={form.swiftCode} onChange={e => setForm(p => ({ ...p, swiftCode: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Payment Amount</label>
                <input style={inputStyle} type="number" step="0.01" value={form.originalAmount} onChange={e => setForm(p => ({ ...p, originalAmount: e.target.value }))} placeholder="0.00" />
              </div>
            </div>

            {/* ROE */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>ROE (to USD)</label>
              <input style={{ ...inputStyle, maxWidth: 180 }} type="number" step="0.000001" value={form.roe} onChange={e => setForm(p => ({ ...p, roe: e.target.value }))} />
            </div>

            {/* USD Equivalent */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>USD Equivalent</label>
              <div style={{ ...inputStyle, background: '#F9FAFB', display: 'flex', alignItems: 'center', color: '#111827', fontWeight: 600 }}>
                $ {parseFloat(usdEq).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Remarks */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Remarks</label>
              <textarea style={{ ...inputStyle, height: 72, resize: 'vertical' }} value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
            </div>

            <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 16 }}>Bank fields auto-fetched from Agent Master — editable for approved one-off transactions.</p>

            {/* Excel Bulk Sheet */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <FileText size={16} color="#16A34A" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Excel Bulk Sheet</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#6B7280' }}>Download the template, fill offline, then attach the completed workbook.</p>
                </div>
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 12px', background: 'white', cursor: 'pointer', fontSize: 12, color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  <FileText size={13} /> Download Demo Template (.xlsx)
                </button>
              </div>
              {/* Upload drop zone */}
              <div
                onClick={() => docRef.current?.click()}
                style={{ border: '2px dashed #D1D5DB', borderRadius: 8, padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA' }}
              >
                <Upload size={22} color="#9CA3AF" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: 12, color: '#6B7280' }}>Upload / Import Filled Excel (.xlsx)</p>
                <p style={{ fontSize: 12, color: '#DC2626', fontWeight: 600, marginTop: 2 }}>browse .xlsx file</p>
                <input ref={docRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={e => setDocFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            {/* Supporting docs drop zone */}
            <div
              style={{ border: '2px dashed #D1D5DB', borderRadius: 8, padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA', marginBottom: 16 }}
              onClick={() => docRef.current?.click()}
            >
              <Upload size={22} color="#9CA3AF" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: 12, color: '#6B7280' }}>Drag & drop supporting PDFs / Invoices / PO</p>
              <p style={{ fontSize: 12, color: '#DC2626', fontWeight: 600, marginTop: 2 }}>browse files</p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 14, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', background: submitting ? '#FCA5A5' : '#E57373', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: '0.02em' }}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditResubmitModal({ request, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    beneficiaryName: request.beneficiaryName,
    currency: request.currency,
    originalAmount: String(request.originalAmount),
    roe: String(request.roe),
    remarks: request.remarks || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const usdEq = form.originalAmount && form.roe
    ? (parseFloat(form.originalAmount) * parseFloat(form.roe)).toFixed(2)
    : '0.00';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await api.put(`/payment-requests/${request.id}/resubmit`, form);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Resubmit failed');
    } finally { setSubmitting(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Edit & Resubmit</h3>
            <p style={{ fontSize: 12, color: '#6B7280' }}>{request.requestId}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
        </div>
        {request.rejectionReason && (
          <div style={{ margin: '16px 24px 0', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', marginBottom: 2 }}>Rejection Reason</p>
            <p style={{ fontSize: 13, color: '#374151' }}>{request.rejectionReason}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Beneficiary Name</label>
            <input style={inputStyle} value={form.beneficiaryName} onChange={e => setForm(p => ({ ...p, beneficiaryName: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Amount</label>
              <input style={inputStyle} type="number" step="0.01" value={form.originalAmount} onChange={e => setForm(p => ({ ...p, originalAmount: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>ROE</label>
              <input style={inputStyle} type="number" step="0.000001" value={form.roe} onChange={e => setForm(p => ({ ...p, roe: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: 14, padding: '8px 12px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8 }}>
            <p style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 700 }}>USD Equivalent: <span style={{ fontSize: 15 }}>$ {parseFloat(usdEq).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Remarks</label>
            <textarea style={{ ...inputStyle, height: 64, resize: 'vertical' }} value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
          </div>
          {error && <div style={{ marginBottom: 12, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13, color: '#374151' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '9px 18px', background: '#1D4ED8', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {submitting ? 'Resubmitting...' : 'Resubmit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5,
};
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#111827', background: 'white', outline: 'none', boxSizing: 'border-box',
};
