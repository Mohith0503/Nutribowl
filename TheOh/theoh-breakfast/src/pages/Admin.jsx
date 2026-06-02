import React, { useState } from 'react';
import { api } from '../services/api';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());

  if (isAuthenticated) {
    return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />;
  }

  return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
}
