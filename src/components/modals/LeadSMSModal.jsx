import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const LeadSMSModal = ({ lead, onClose }) => {
  const handleClose = () => {
    toast.info('Funzionalità SMS temporaneamente disabilitata');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-strong max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiIcons.FiMessageSquare} className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-800">
                  SMS Non Disponibile
                </h2>
                <p className="text-neutral-600">
                  {lead.firstName} {lead.lastName}
                </p>
              </div>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={handleClose} />
          </div>
        </div>

        <div className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <SafeIcon icon={FiIcons.FiMessageSquare} className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Funzionalità SMS
              </h3>
              <p className="text-neutral-600">
                La funzionalità di invio SMS è stata temporaneamente disabilitata.
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm text-orange-800">
                Per comunicare con il lead, utilizza l'email o contatta direttamente tramite telefono.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-center">
            <Button onClick={handleClose}>
              Chiudi
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LeadSMSModal;