import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'navy' | 'red' | 'emerald' | 'amber';
  onClick?: () => void;
}

const colorMap = {
  navy: { bg: '#EFF6FF', icon: '#0A2540', border: '#BFDBFE' },
  red: { bg: '#FEF2F2', icon: '#D32F2F', border: '#FECACA' },
  emerald: { bg: '#ECFDF5', icon: '#10B981', border: '#A7F3D0' },
  amber: { bg: '#FFFBEB', icon: '#D97706', border: '#FDE68A' },
};

export default function KPICard({ title, value, subtitle, icon, color = 'navy', onClick }: KPICardProps) {
  const colors = colorMap[color];
  return (
    <div className="kpi-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{title}</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#0A2540', fontFamily: 'Georgia, serif', lineHeight: 1 }}>{value}</p>
          {subtitle && <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>{subtitle}</p>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: colors.bg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.icon, flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
