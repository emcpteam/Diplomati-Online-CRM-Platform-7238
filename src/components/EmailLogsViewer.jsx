import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { getEmailLogs, clearEmailLogs } from '../utils';
import toast from 'react-hot-toast';

const EmailLogsViewer = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = () => {
    const emailLogs = getEmailLogs();
    setLogs(emailLogs.reverse()); // Show newest first
  };

  const handleClearLogs = () => {
    if (window.confirm('Sei sicuro di voler cancellare tutti i log delle email?')) {
      clearEmailLogs();
      setLogs([]);
      toast.success('Log delle email cancellati');
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterStatus === 'all') return true;
    return log.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent': return <Badge variant="success">Inviata</Badge>;
      case 'failed': return <Badge variant="danger">Fallita</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-strong max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">Log Email</h2>
              <p className="text-neutral-600">
                Visualizza i log delle email inviate ({logs.length} totali)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" icon={FiIcons.FiRefreshCw} onClick={loadLogs}>
                Aggiorna
              </Button>
              <Button variant="outline" icon={FiIcons.FiTrash2} onClick={handleClearLogs}>
                Cancella Log
              </Button>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tutti gli stati</option>
              <option value="sent">Inviate</option>
              <option value="failed">Fallite</option>
            </select>
            <div className="text-sm text-neutral-500">
              {filteredLogs.length} di {logs.length} log
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-y-auto max-h-96">
            {filteredLogs.length > 0 ? (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <SafeIcon 
                            icon={log.status === 'sent' ? FiIcons.FiCheckCircle : FiIcons.FiXCircle} 
                            className={`w-5 h-5 ${log.status === 'sent' ? 'text-green-500' : 'text-red-500'}`} 
                          />
                          <div>
                            <p className="font-medium text-neutral-800">{log.subject}</p>
                            <p className="text-sm text-neutral-500">
                              A: {log.to} • {new Date(log.timestamp).toLocaleString('it-IT')}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-500">SMTP Host:</span>
                            <span className="ml-2 font-medium">{log.smtpHost || 'N/A'}</span>
                          </div>
                          {log.messageId && (
                            <div>
                              <span className="text-neutral-500">Message ID:</span>
                              <span className="ml-2 font-mono text-xs">{log.messageId}</span>
                            </div>
                          )}
                        </div>
                        {log.error && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-800">Errore:</p>
                            <p className="text-sm text-red-700 mt-1">{log.error}</p>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(log.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiIcons.FiMail} className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500">
                  {logs.length === 0 ? 'Nessun log email disponibile' : 'Nessun log corrisponde ai filtri'}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              I log sono memorizzati localmente nel browser (ultimi 50)
            </div>
            <Button onClick={onClose}>Chiudi</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmailLogsViewer;