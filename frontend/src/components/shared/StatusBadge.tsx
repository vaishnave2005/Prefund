import React from 'react';
import { displayStatus, getStatusBadgeClass } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cls = getStatusBadgeClass(status);
  const label = displayStatus(status);
  const fontSize = size === 'sm' ? '10px' : '11px';
  return (
    <span
      className={cls}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        borderRadius: '20px',
        fontSize,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  );
}
