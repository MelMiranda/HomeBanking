import { CreditCard, Database, Download, FileText, Landmark, RefreshCw, Upload, Users } from 'lucide-react';
import React, { useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { LocalStorageService } from '../services/localStorageService';
import '../styles/pages/DataManagementPage.scss';

const DataManagementPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [importData, setImportData] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isAdmin()) {
    return (
      <div className="data-management-page">
        <div className="access-denied">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos de administrador para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const handleExportData = () => {
    try {
      const data = LocalStorageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homebanking-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Datos exportados exitosamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al exportar los datos' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImportData = () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'Por favor, ingresa los datos JSON' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      const success = LocalStorageService.importData(importData);
      if (success) {
        setMessage({ type: 'success', text: 'Datos importados exitosamente. Recarga la página para ver los cambios.' });
        setImportData('');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Formato de datos inválido' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al importar los datos' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleResetData = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear todos los datos? Esta acción no se puede deshacer.')) {
      LocalStorageService.clearAllData();
      setMessage({ type: 'success', text: 'Datos reseteados exitosamente. Recarga la página para ver los cambios.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Obtener estadísticas actuales
  const users = LocalStorageService.getUsers();
  const accounts = LocalStorageService.getAccounts();
  const cards = LocalStorageService.getCards();
  const transactions = LocalStorageService.getTransactions();

  return (
    <div className="data-management-page">
      <Header title="Gestión de Datos" backButton />
      
      <div className="data-management-content">
        <div className="page-header">
          <h1>Gestión de Datos</h1>
          <p>Administra los datos almacenados en el navegador</p>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <Users size={24} />
            <div className="stat-info">
              <h3>{users.length}</h3>
              <p>Usuarios</p>
            </div>
          </div>
          <div className="stat-card">
            <Landmark size={24} />
            <div className="stat-info">
              <h3>{accounts.length}</h3>
              <p>Cuentas</p>
            </div>
          </div>
          <div className="stat-card">
            <CreditCard size={24} />
            <div className="stat-info">
              <h3>{cards.length}</h3>
              <p>Tarjetas</p>
            </div>
          </div>
          <div className="stat-card">
            <FileText size={24} />
            <div className="stat-info">
              <h3>{transactions.length}</h3>
              <p>Transacciones</p>
            </div>
          </div>
        </div>

        <div className="actions-grid">
          <div className="action-card">
            <div className="action-header">
              <Download size={24} />
              <h3>Exportar Datos</h3>
            </div>
            <p>Descarga todos los datos como archivo JSON</p>
            <button onClick={handleExportData} className="export-btn">
              <Download size={16} />
              Exportar
            </button>
          </div>

          <div className="action-card">
            <div className="action-header">
              <Upload size={24} />
              <h3>Importar Datos</h3>
            </div>
            <p>Restaura datos desde un archivo JSON</p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Pega aquí el contenido JSON..."
              rows={4}
            />
            <button onClick={handleImportData} className="import-btn">
              <Upload size={16} />
              Importar
            </button>
          </div>

          <div className="action-card">
            <div className="action-header">
              <RefreshCw size={24} />
              <h3>Resetear Datos</h3>
            </div>
            <p>Restaura los datos por defecto</p>
            <button onClick={handleResetData} className="reset-btn">
              <RefreshCw size={16} />
              Resetear
            </button>
          </div>
        </div>

        <div className="info-section">
          <div className="info-card">
            <Database size={20} />
            <div>
              <h4>Información del Almacenamiento</h4>
              <p>Los datos se almacenan localmente en tu navegador usando localStorage. 
              Esto significa que los datos persisten entre sesiones pero se eliminan si limpias los datos del navegador.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementPage; 