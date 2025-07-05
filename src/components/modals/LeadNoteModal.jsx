import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import SafeIcon from '../../common/SafeIcon';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const LeadNoteModal = ({ lead, onClose, onNoteSaved }) => {
  const { dispatch } = useApp();
  const [note, setNote] = useState(lead.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedLead = {
        ...lead,
        notes: note,
        lastNoteUpdate: new Date().toISOString()
      };

      dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
      
      if (onNoteSaved) {
        onNoteSaved(updatedLead);
      }

      toast.success('Nota salvata con successo!');
      onClose();
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

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
        className="bg-white rounded-2xl shadow-strong max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiIcons.FiEdit3} className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-800">
                  Aggiungi Note
                </h2>
                <p className="text-neutral-600">
                  {lead.firstName} {lead.lastName}
                </p>
              </div>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Note Lead
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Inserisci note dettagliate sul lead..."
                className="w-full h-40 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="bg-neutral-50 rounded-xl p-4">
              <h4 className="font-medium text-neutral-800 mb-2">Informazioni Lead</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Piano di Studi:</span>
                  <p className="font-medium text-neutral-800">{lead.studyPlan}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Fonte:</span>
                  <p className="font-medium text-neutral-800">{lead.source}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Anni da Recuperare:</span>
                  <p className="font-medium text-neutral-800">{lead.yearsToRecover}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Disponibilità:</span>
                  <p className="font-medium text-neutral-800">{lead.availableTime}</p>
                </div>
              </div>
            </div>

            {lead.lastNoteUpdate && (
              <div className="text-xs text-neutral-500">
                Ultima modifica: {new Date(lead.lastNoteUpdate).toLocaleString('it-IT')}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              icon={FiIcons.FiSave} 
              onClick={handleSave}
              loading={saving}
            >
              Salva Nota
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LeadNoteModal;