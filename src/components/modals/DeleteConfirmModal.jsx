import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import SafeIcon from '../../common/SafeIcon';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Conferma Eliminazione", 
  message = "Sei sicuro di voler eliminare questo elemento?",
  itemName = "",
  loading = false 
}) => {
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
        className="bg-white rounded-2xl shadow-strong max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiAlertTriangle} className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
              {itemName && (
                <p className="text-sm text-neutral-500">Elemento: {itemName}</p>
              )}
            </div>
          </div>

          <p className="text-neutral-600 mb-6">{message}</p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiIcons.FiAlertCircle} className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Attenzione</p>
                <p className="text-sm text-red-700">
                  Questa azione non può essere annullata. Tutti i dati associati verranno eliminati definitivamente.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button
              variant="danger"
              icon={FiIcons.FiTrash2}
              onClick={onConfirm}
              loading={loading}
            >
              Elimina Definitivamente
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteConfirmModal;