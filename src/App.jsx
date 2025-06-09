
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Estoque from '@/pages/Estoque';
import Pedidos from '@/pages/Pedidos';
import NovoPedido from '@/pages/NovoPedido';
import Fornecedores from '@/pages/Fornecedores';
import Usuarios from '@/pages/Usuarios';
import Auditoria from '@/pages/Auditoria';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/estoque" element={<Estoque />} />
                        <Route path="/pedidos" element={<Pedidos />} />
                        <Route path="/pedidos/novo" element={<NovoPedido />} />
                        <Route path="/fornecedores" element={<Fornecedores />} />
                        <Route path="/usuarios" element={<Usuarios />} />
                        <Route path="/auditoria" element={<Auditoria />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
