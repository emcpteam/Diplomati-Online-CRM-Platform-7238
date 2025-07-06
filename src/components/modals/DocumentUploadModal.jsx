import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import { uploadFile, validateFile } from '../../utils/fileUpload';
import toast from 'react-hot-toast';

const DocumentUploadModal = ({ onClose, onUpload, title = "Carica Documento", acceptedTypes = [] }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    const errors = validateFile(file, 10 * 1024 * 1024, acceptedTypes);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    setSelectedFile(file);
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

    setUploading(true);
    toast.loading('Caricamento in corso...', { id: 'upload' });

    try {
      const uploadResult = await uploadFile(selectedFile, 'document');

      const document = {
        id: Date.now(),
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        url: uploadResult.url,
        uploadedAt: uploadResult.uploadedAt
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
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-800">{title}</h2>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto">
                  <FiIcons.FiFile className="w-6 h-6 text-accent-600" />
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
                  <FiIcons.FiUpload className="w-6 h-6 text-neutral-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-800">
                    Trascina il file qui o clicca per selezionare
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Tipi supportati: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept={acceptedTypes.join(',') || '.pdf,.doc,.docx,.jpg,.jpeg,.png'}
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

          {/* Info */}
          <div className="text-xs text-neutral-500">
            <p>• Dimensione massima: 10MB</p>
            <p>• Formati supportati: PDF, DOC, DOCX, JPG, PNG</p>
            <p>• Il documento verrà associato automaticamente</p>
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
              disabled={!selectedFile}
            >
              Carica
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DocumentUploadModal;