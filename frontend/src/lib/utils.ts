import { format, formatDistanceToNow } from 'date-fns';

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
}

export function formatNotifDate(date: string | Date | null | undefined) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatIST(date: string | Date | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export type StatusKey = string;

export const STATUS_DISPLAY: Record<string, string> = {
  'Paid': 'Payment Successful',
  'Scheduled': 'Ready for SG AP Execution',
  'Ready for SG AP Execution': 'Ready for SG AP Execution',
};

export function displayStatus(status: string) {
  return STATUS_DISPLAY[status] || status;
}

export function getStatusBadgeClass(status: string) {
  const s = status?.toLowerCase() || '';
  if (s === 'submitted') return 'badge-submitted';
  if (s.includes('gfsu review') || s.includes('gfsu')) return 'badge-gfsu';
  if (s.includes('cac')) return 'badge-cac';
  if (s.includes('treasury')) return 'badge-treasury';
  if (s === 'paid') return 'badge-paid';
  if (s.includes('rejected')) return 'badge-rejected';
  if (s.includes('query')) return 'badge-query';
  if (s === 'payment initiated') return 'badge-initiated';
  if (s.includes('ready') || s.includes('scheduled')) return 'badge-ready';
  if (s.includes('clarified')) return 'badge-clarified';
  return 'badge-submitted';
}

export function getPipelineStage(status: string): number {
  const stages: Record<string, number> = {
    'Submitted': 0,
    'Under GFSU Review': 1,
    'Clarified - Under GFSU Review': 1,
    'Query Raised': 1,
    'CAC Pending': 2,
    'Clarified - Under CAC Review': 2,
    'CAC Approved': 3,
    'Clarified - Under Treasury Review': 3,
    'Treasury Approved - Pending GFSU Verification': 4,
    'Ready for SG AP Execution': 5,
    'Payment Initiated': 5,
    'Paid': 6,
  };
  return stages[status] ?? 0;
}

export function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    AGENT: 'Agent Office',
    GFSU_AC: 'GFSU-AC Analyst',
    CAC: 'CAC Executive',
    TREASURY: 'SG Treasury',
    SG_AP: 'SG AP / Creditors',
    ADMIN: 'System Admin',
  };
  return labels[role] || role;
}

export function getModuleName(role: string) {
  const modules: Record<string, string> = {
    AGENT: 'Agent Portal',
    GFSU_AC: 'GFSU-AC Hub',
    CAC: 'CAC Executive Portal',
    TREASURY: 'SG Treasury Portal',
    SG_AP: 'SG AP Creditors Portal',
    ADMIN: 'Admin Console',
  };
  return modules[role] || 'PIL Portal';
}
