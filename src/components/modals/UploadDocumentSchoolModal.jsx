import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SafeIcon from '../../common/SafeIcon';
import { uploadFile, validateFile } from '../../utils/fileUpload';
import toast from 'react-hot-toast';

const UploadDocumentSchoolModal = ({ school, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [documentInfo, setDocumentInfo] = useState({
    name: '',
    category: 'agreement',
    notes: ''
  });

  const documentCategories = [
    { value: 'agreement', label: 'Convenzioni' },
    { value: 'accreditation', label: 'Accreditamenti' },
    { value: 'exam_calendar', label: 'Calendario Esami' },
    { value: 'regulations', label: 'Regolamenti' },
    { value: 'contact_info', label: 'Informazioni Contatto' },
    { value: 'other', label: 'Altri Documenti' }
  ];

  const handleFileSelect = (file) => {
    const errors = validateFile(file, 10 * 1024 * 1024, [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ]);

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setSelectedFile(file);
    if (!documentInfo.name) {
      setDocumentInfo(prev => ({
        ...prev,
        name: file.name.split('.')[0]
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Seleziona un file da caricare');
      return;
    }

    if (!documentInfo.name.trim()) {
      toast.error('Inserisci un nome per il documento');
      return;
    }

    setUploading(true);
    toast.loading('Caricamento documento...', { id: 'upload' });

    try {
      const uploadResult = await uploadFile(selectedFile, 'document');

      const document = {
        id: Date.now(),
        schoolId: school.id,
        name: documentInfo.name.trim(),
        originalName: selectedFile.name,
        category: documentInfo.category,
        notes: documentInfo.notes.trim(),
        type: selectedFile.type,
        size: selectedFile.size,
        url: uploadResult.url,
        uploadedAt: uploadResult.uploadedAt,
        uploadedBy: 'current_user' // In a real app, this would be the current user ID
      };

      onUpload(document);
      toast.success('Documento caricato con successo!', { id: 'upload' });
      onClose();
    } catch (error) {
      toast.error(error.message, { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'agreement': return FiIcons.FiFileText;
      case 'accreditation': return FiIcons.FiAward;
      case 'exam_calendar': return FiIcons.FiCalendar;
      case 'regulations': return FiIcons.FiBook;
      case 'contact_info': return FiIcons.FiPhone;
      default: return FiIcons.FiFile;
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
        className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                Carica Documento
              </h2>
              <p className="text-neutral-600">{school.name}</p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-neutral-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto">
                  <SafeIcon icon={getCategoryIcon(documentInfo.category)} className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-800">{selectedFile.name}</p>
                  <p className="text-sm text-neutral-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Cambia File
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto">
                  <SafeIcon icon={FiIcons.FiUpload} className="w-6 h-6 text-neutral-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-800">
                    Trascina il file qui o clicca per selezionare
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button as="span" variant="outline">
                    Seleziona File
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* Document Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Documento *"
              value={documentInfo.name}
              onChange={(e) => setDocumentInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome del documento"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Categoria *
              </label>
              <select
                value={documentInfo.category}
                onChange={(e) => setDocumentInfo(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {documentCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Note
            </label>
            <textarea
              value={documentInfo.notes}
              onChange={(e) => setDocumentInfo(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Note aggiuntive sul documento..."
              className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Preview */}
          {selectedFile && documentInfo.name && (
            <div className="p-4 bg-neutral-50 rounded-xl">
              <h4 className="font-medium text-neutral-800 mb-3">Anteprima Documento</h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={getCategoryIcon(documentInfo.category)} className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-800">{documentInfo.name}</p>
                  <p className="text-sm text-neutral-500">
                    {documentCategories.find(c => c.value === documentInfo.category)?.label}
                  </p>
                  {documentInfo.notes && (
                    <p className="text-sm text-neutral-400 mt-1">{documentInfo.notes}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-neutral-500 space-y-1">
            <p>• Dimensione massima: 10MB</p>
            <p>• Formati supportati: PDF, DOC, DOCX, JPG, PNG</p>
            <p>• Il documento verrà associato alla scuola selezionata</p>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              icon={FiIcons.FiUpload} 
              onClick={handleUpload}
              loading={uploading}
              disabled={!selectedFile || !documentInfo.name.trim()}
            >
              Carica Documento
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UploadDocumentSchoolModal;