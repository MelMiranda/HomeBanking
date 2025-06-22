import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import AccountAuditPage from './pages/AccountAuditPage';
import AccountDetailPage from './pages/AccountDetailPage';
import AdminPage from './pages/AdminPage';
import CardDetailPage from './pages/CardDetailPage';
import CardExpensePage from './pages/CardExpensePage';
import CardSummaryPage from './pages/CardSummaryPage';
import DashboardPage from './pages/DashboardPage';
import DataManagementPage from './pages/DataManagementPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SummaryPage from './pages/SummaryPage';
import TransferHistoryPage from './pages/TransferHistoryPage';
import TransferPage from './pages/TransferPage';
import './styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
          <Route path="/account-audit/:id" element={
            <AdminRoute>
              <AccountAuditPage />
            </AdminRoute>
          } />
          <Route path="/summary" element={
            <PrivateRoute>
              <SummaryPage />
            </PrivateRoute>
          } />
          <Route path="/transfer" element={
            <PrivateRoute>
              <TransferPage />
            </PrivateRoute>
          } />
          <Route path="/transfer-history" element={
            <PrivateRoute>
              <TransferHistoryPage />
            </PrivateRoute>
          } />
          <Route path="/card-summary" element={
            <PrivateRoute>
              <CardSummaryPage />
            </PrivateRoute>
          } />
          <Route path="/card-summary/:id" element={
            <PrivateRoute>
              <CardSummaryPage />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } />
          <Route path="/card-expenses" element={
            <AdminRoute>
              <CardExpensePage />
            </AdminRoute>
          } />
          <Route path="/data-management" element={
            <AdminRoute>
              <DataManagementPage />
            </AdminRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;