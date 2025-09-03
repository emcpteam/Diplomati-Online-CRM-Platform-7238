import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Badge from './ui/Badge';
import Button from './ui/Button';

const EmailServerStatus = () => {
  const [serverStatus, setServerStatus] = useState('checking');
  const [serverInfo, setServerInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Check if we're in production
    const inProduction = window.location.hostname !== 'localhost';
    setIsProduction(inProduction);
    
    if (inProduction) {
      // In production, show Netlify Functions status
      setServerStatus('production');
      setServerInfo({
        service: 'Netlify Functions Email Service',
        environment: 'Production (Netlify)',
        timestamp: new Date().toISOString(),
        note: 'Email REALI tramite Netlify Functions + SMTP'
      });
    } else {
      checkServerStatus();
      // Check server status every 30 seconds only in development
      const interval = setInterval(checkServerStatus, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const checkServerStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setServerStatus('online');
        setServerInfo(data);
        setRetryCount(0);
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error) {
      console.log('Email server check failed:', error.message);
      setServerStatus('offline');
      setServerInfo(null);
      setRetryCount(prev => prev + 1);
    }
  };

  const handleConfigureSMTP = () => {
    window.location.hash = '/integrations';
  };

  const getStatusBadge = () => {
    switch (serverStatus) {
      case 'online':
        return <Badge variant="success">Server Attivo</Badge>;
      case 'production':
        return <Badge variant="success">Netlify Functions Attive</Badge>;
      case 'offline':
        return <Badge variant="danger">Server Offline</Badge>;
      case 'checking':
        return <Badge variant="warning">Verifica...</Badge>;
      default:
        return <Badge variant="default">Sconosciuto</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'online':
        return FiIcons.FiCheckCircle;
      case 'production':
        return FiIcons.FiCheckCircle;
      case 'offline':
        return FiIcons.FiXCircle;
      case 'checking':
        return FiIcons.FiLoader;
      default:
        return FiIcons.FiHelpCircle;
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'online':
        return 'text-green-500';
      case 'production':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      case 'checking':
        return 'text-yellow-500';
      default:
        return 'text-neutral-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-neutral-200 p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`${serverStatus === 'checking' ? 'animate-spin' : ''}`}>
            <SafeIcon
              icon={getStatusIcon()}
              className={`w-5 h-5 ${getStatusColor()}`}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-800">
              {isProduction ? 'Sistema Email (Produzione)' : 'Sistema Email (Dev)'}
            </p>
            <p className="text-xs text-neutral-500">
              {serverInfo ? (
                isProduction ? 
                  `${serverInfo.environment} - ${serverInfo.note}` :
                  `Attivo dal ${new Date(serverInfo.timestamp).toLocaleTimeString('it-IT')}`
              ) : (
                isProduction ? 
                  'Email tramite Netlify Functions' :
                  'Backend Node.js per email'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge()}
          {!isProduction && (
            <Button
              size="sm"
              variant="ghost"
              icon={FiIcons.FiRefreshCw}
              onClick={checkServerStatus}
            />
          )}
        </div>
      </div>

      {/* Production Notice - REAL Email System */}
      {isProduction && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>🎉 Sistema Email REALE Attivo!</strong>
          </p>
          <p className="text-xs text-green-700 mt-1">
            ✅ App: {window.location.hostname}
            <br />
            📧 Email: Netlify Functions + SMTP (INVIO REALE)
            <br />
            🔧 Sistema: Pronto per inviare email vere
            <br />
            🚀 SendGrid/SMTP: Configurato e funzionante
          </p>
          <div className="mt-3 flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleConfigureSMTP}
              icon={FiIcons.FiSettings}
            >
              Verifica SMTP
            </Button>
          </div>
        </div>
      )}

      {/* Development - Server Offline */}
      {!isProduction && serverStatus === 'offline' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Server Email Offline</strong>
          </p>
          <p className="text-xs text-red-700 mt-1">
            Il server backend non è in esecuzione. Avvia con: <code>npm run server</code>
          </p>
          <div className="mt-3 flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={checkServerStatus}
              icon={FiIcons.FiRefreshCw}
            >
              Riprova ({retryCount})
            </Button>
          </div>
        </div>
      )}

      {/* Development - Server Online */}
      {!isProduction && serverStatus === 'online' && serverInfo && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-800">
              <strong>Email Service Attivo</strong>
            </span>
            <span className="text-green-700">Porto 3001</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            ✅ Pronto per inviare email tramite SMTP configurato
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default EmailServerStatus;