import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Button from './ui/Button';
import Card from './ui/Card';

const ProductionNotice = () => {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('productionNoticeDismissed') === 'true'
  );

  const isProduction = window.location.hostname !== 'localhost';

  if (!isProduction || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('productionNoticeDismissed', 'true');
  };

  const handleConfigureSMTP = () => {
    window.location.hash = '/integrations';
    handleDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50 max-w-md"
    >
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-primary-50 border-primary-200">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiIcons.FiGlobe} className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-primary-800 mb-1">
              🚀 App in Produzione!
            </h3>
            <p className="text-xs text-primary-700 mb-3">
              La tua app è attiva su <strong>{window.location.hostname}</strong>.
              Per abilitare le email, configura SMTP.
            </p>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleConfigureSMTP}
                icon={FiIcons.FiSettings}
                className="text-xs"
              >
                Configura SMTP
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                icon={FiIcons.FiX}
                className="text-xs"
              >
                Chiudi
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductionNotice;