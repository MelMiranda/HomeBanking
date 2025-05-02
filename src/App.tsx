import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CardDetailPage from './pages/CardDetailPage';
import AccountDetailPage from './pages/AccountDetailPage';
import SummaryPage from './pages/SummaryPage';
import './styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          <Route path="/cards/:id" element={
            <PrivateRoute>
              <CardDetailPage />
            </PrivateRoute>
          } />
          <Route path="/accounts/:id" element={
            <PrivateRoute>
              <AccountDetailPage />
            </PrivateRoute>
          } />
          <Route path="/summary" element={
            <PrivateRoute>
              <SummaryPage />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;