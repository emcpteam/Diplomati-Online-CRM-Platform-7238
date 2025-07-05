import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SafeIcon from '../../common/SafeIcon';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const LeadReminderModal = ({ lead, onClose, onReminderSet }) => {
  const { dispatch } = useApp();
  const [reminderData, setReminderData] = useState({
    date: '',
    time: '',
    note: '',
    type: 'call'
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!reminderData.date || !reminderData.time) {
      toast.error('Inserisci data e ora per il promemoria');
      return;
    }

    setSaving(true);
    try {
      const reminderDateTime = new Date(`${reminderData.date}T${reminderData.time}`);
      
      const reminder = {
        id: Date.now(),
        leadId: lead.id,
        date: reminderData.date,
        time: reminderData.time,
        datetime: reminderDateTime.toISOString(),
        note: reminderData.note,
        type: reminderData.type,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const updatedLead = {
        ...lead,
        status: 'da_ricontattare',
        reminder: reminder,
        lastUpdate: new Date().toISOString()
      };

      dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });

      // Generate Google Calendar link
      const startTime = reminderDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endTime = new Date(reminderDateTime.getTime() + 30 * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Ricontattare ${lead.firstName} ${lead.lastName}&dates=${startTime}/${endTime}&details=${encodeURIComponent(`Promemoria: ${reminderData.note}\n\nLead: ${lead.firstName} ${lead.lastName}\nTelefono: ${lead.phone}\nEmail: ${lead.email}\nPiano di Studi: ${lead.studyPlan}`)}&location=${encodeURIComponent('Diplomati Online')}`;

      if (onReminderSet) {
        onReminderSet(updatedLead, calendarUrl);
      }

      toast.success('Promemoria impostato con successo!');
      
      // Ask if user wants to add to Google Calendar
      if (window.confirm('Vuoi aggiungere questo promemoria a Google Calendar?')) {
        window.open(calendarUrl, '_blank');
      }

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
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiIcons.FiClock} className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-800">
                  Imposta Promemoria
                </h2>
                <p className="text-neutral-600">
                  {lead.firstName} {lead.lastName}
                </p>
              </div>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data Promemoria *"
              type="date"
              value={reminderData.date}
              onChange={(e) => setReminderData(prev => ({ ...prev, date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
            <Input
              label="Ora Promemoria *"
              type="time"
              value={reminderData.time}
              onChange={(e) => setReminderData(prev => ({ ...prev, time: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tipo di Promemoria
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReminderData(prev => ({ ...prev, type: 'call' }))}
                className={`p-3 rounded-xl border-2 transition-all ${
                  reminderData.type === 'call'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiIcons.FiPhone} className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Telefonata</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setReminderData(prev => ({ ...prev, type: 'email' }))}
                className={`p-3 rounded-xl border-2 transition-all ${
                  reminderData.type === 'email'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiIcons.FiMail} className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Email</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Note Promemoria
            </label>
            <textarea
              value={reminderData.note}
              onChange={(e) => setReminderData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Note per il promemoria..."
              className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiIcons.FiCalendar} className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Integrazione Google Calendar</p>
                <p className="text-sm text-orange-700">
                  Dopo aver salvato il promemoria, potrai aggiungerlo automaticamente a Google Calendar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              icon={FiIcons.FiClock} 
              onClick={handleSave}
              loading={saving}
            >
              Imposta Promemoria
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LeadReminderModal;