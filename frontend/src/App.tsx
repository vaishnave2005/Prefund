import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import AgentDashboard from './pages/agent/AgentDashboard';
import GFSUDashboard from './pages/gfsu/GFSUDashboard';
import CACDashboard from './pages/cac/CACDashboard';
import TreasuryDashboard from './pages/treasury/TreasuryDashboard';
import SGAPDashboard from './pages/sgap/SGAPDashboard';
import AdminConsole from './pages/admin/AdminConsole';

function RoleRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontFamily: 'Georgia,serif', color: '#0A2540', marginBottom: 8 }}>PIL Portal</div><div style={{ color: '#64748B', fontSize: 13 }}>Loading...</div></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'AGENT': return <AgentDashboard />;
    case 'GFSU_AC': return <GFSUDashboard />;
    case 'CAC': return <CACDashboard />;
    case 'TREASURY': return <TreasuryDashboard />;
    case 'SG_AP': return <SGAPDashboard />;
    case 'ADMIN': return <AdminConsole />;
    default: return <Navigate to="/login" replace />;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/" element={<RoleRoute />} />
            <Route path="/agent" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
            <Route path="/gfsu" element={<ProtectedRoute><GFSUDashboard /></ProtectedRoute>} />
            <Route path="/cac" element={<ProtectedRoute><CACDashboard /></ProtectedRoute>} />
            <Route path="/treasury" element={<ProtectedRoute><TreasuryDashboard /></ProtectedRoute>} />
            <Route path="/sgap" element={<ProtectedRoute><SGAPDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminConsole /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
