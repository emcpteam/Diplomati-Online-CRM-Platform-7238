import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const LearningPathModal = ({ path, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    subjects: [],
    requirements: [],
    milestones: [],
    status: 'active',
    ...path
  });

  const [newSubject, setNewSubject] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newMilestone, setNewMilestone] = useState({ name: '', duration: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    onSave(formData);
    onClose();
  };

  const addSubject = () => {
    if (newSubject.trim()) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()]
      }));
      setNewSubject('');
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const addMilestone = () => {
    if (newMilestone.name.trim() && newMilestone.duration.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [
          ...prev.milestones,
          { 
            id: Date.now(),
            ...newMilestone 
          }
        ]
      }));
      setNewMilestone({ name: '', duration: '' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-800">
              {path ? 'Modifica Percorso' : 'Nuovo Percorso'}
            </h2>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Percorso *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="es. Diploma Scientifico"
              required
            />
            <Input
              label="Durata"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="es. 12-24 mesi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Descrizione *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrivi il percorso formativo..."
              className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              required
            />
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Materie
            </label>
            <div className="flex space-x-2 mb-4">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Aggiungi materia..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
              />
              <Button type="button" icon={FiIcons.FiPlus} onClick={addSubject}>
                Aggiungi
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.subjects.map((subject, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{subject}</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      subjects: prev.subjects.filter((_, i) => i !== index)
                    }))}
                    className="hover:text-red-500"
                  >
                    <SafeIcon icon={FiIcons.FiX} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Requisiti
            </label>
            <div className="flex space-x-2 mb-4">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Aggiungi requisito..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" icon={FiIcons.FiPlus} onClick={addRequirement}>
                Aggiungi
              </Button>
            </div>
            <div className="space-y-2">
              {formData.requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
                >
                  <span className="text-sm">{requirement}</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      requirements: prev.requirements.filter((_, i) => i !== index)
                    }))}
                    className="text-red-500 hover:text-red-600"
                  >
                    <SafeIcon icon={FiIcons.FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Milestone
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                placeholder="Nome milestone..."
              />
              <div className="flex space-x-2">
                <Input
                  value={newMilestone.duration}
                  onChange={(e) => setNewMilestone({ ...newMilestone, duration: e.target.value })}
                  placeholder="Durata..."
                />
                <Button type="button" icon={FiIcons.FiPlus} onClick={addMilestone}>
                  Aggiungi
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {formData.milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-neutral-800">{milestone.name}</p>
                    <p className="text-sm text-neutral-500">{milestone.duration}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      milestones: prev.milestones.filter((_, i) => i !== index)
                    }))}
                    className="text-red-500 hover:text-red-600"
                  >
                    <SafeIcon icon={FiIcons.FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button variant="outline" type="button" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" icon={FiIcons.FiSave}>
              {path ? 'Salva Modifiche' : 'Crea Percorso'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LearningPathModal;