import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { Card, Button, Input, Badge } from './UI';
import { validateFile, uploadFile } from '../utils';
import toast from 'react-hot-toast';

const DocumentManager = ({ 
  documents = [], 
  onUpload, 
  onDelete,
  title = "Documenti",
  allowedTypes = ['application/pdf', 'image/*', 'application/msword'],
  maxSize = 10 * 1024 * 1024 // 10MB
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'Tutti' },
    { value: 'contract', label: 'Contratti' },
    { value: 'identity', label: 'Documenti Identità' },
    { value: 'academic', label: 'Documenti Scolastici' },
    { value: 'payment', label: 'Pagamenti' },
    { value: 'other', label: 'Altri' }
  ];

  const handleDelete = (docId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo documento?')) {
      onDelete(docId);
      toast.success('Documento eliminato con successo!');
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return FiIcons.FiImage;
    if (type.includes('pdf')) return FiIcons.FiFileText;
    if (type.includes('word')) return FiIcons.FiFile;
    return FiIcons.FiFile;
  };

  const UploadModal = () => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    };

    const handleFiles = (files) => {
      const validFiles = [];
      files.forEach(file => {
        const errors = validateFile(file, maxSize, allowedTypes);
        if (errors.length === 0) {
          validFiles.push({
            file,
            name: file.name.split('.')[0],
            category: 'other',
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
          });
        } else {
          toast.error(`${file.name}: ${errors[0]}`);
        }
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const handleUpload = async () => {
      if (selectedFiles.length === 0) {
        toast.error('Seleziona almeno un file');
        return;
      }

      setUploading(true);
      toast.loading('Caricamento in corso...', { id: 'upload' });

      try {
        for (const fileData of selectedFiles) {
          const uploadResult = await uploadFile(fileData.file, 'document');
          const newDoc = {
            id: Date.now(),
            name: fileData.name,
            category: fileData.category,
            type: fileData.file.type,
            size: fileData.file.size,
            url: uploadResult.url,
            uploadedAt: new Date().toISOString()
          };
          onUpload(newDoc);
        }

        toast.success(`${selectedFiles.length} file caricati con successo!`, { id: 'upload' });
        setShowUploadModal(false);
      } catch (error) {
        toast.error('Errore durante il caricamento', { id: 'upload' });
      } finally {
        setUploading(false);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowUploadModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-strong max-w-3xl w-full"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">Carica Documenti</h2>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={() => setShowUploadModal(false)} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
                ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <SafeIcon icon={FiIcons.FiUpload} className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <p className="font-medium text-neutral-800 mb-2">
                Trascina i file qui o clicca per selezionare
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                PDF, DOC, DOCX, JPG, PNG supportati (max 10MB)
              </p>
              <input
                type="file"
                multiple
                accept={allowedTypes.join(',')}
                onChange={e => handleFiles(Array.from(e.target.files))}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button as="span" variant="outline">Seleziona File</Button>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                  File Selezionati ({selectedFiles.length})
                </h3>
                <div className="space-y-4">
                  {selectedFiles.map((fileData, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl">
                      <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {fileData.preview ? (
                          <img src={fileData.preview} alt={fileData.name} className="w-full h-full object-cover" />
                        ) : (
                          <SafeIcon icon={getFileIcon(fileData.file.type)} className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          value={fileData.name}
                          onChange={e => {
                            const newFiles = [...selectedFiles];
                            newFiles[index].name = e.target.value;
                            setSelectedFiles(newFiles);
                          }}
                          placeholder="Nome del file"
                          className="mb-2"
                        />
                        <select
                          value={fileData.category}
                          onChange={e => {
                            const newFiles = [...selectedFiles];
                            newFiles[index].category = e.target.value;
                            setSelectedFiles(newFiles);
                          }}
                          className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          {categories.filter(c => c.value !== 'all').map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <Button
                        variant="ghost"
                        icon={FiIcons.FiX}
                        onClick={() => {
                          if (fileData.preview) URL.revokeObjectURL(fileData.preview);
                          setSelectedFiles(files => files.filter((_, i) => i !== index));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Annulla
              </Button>
              <Button
                icon={FiIcons.FiUpload}
                onClick={handleUpload}
                loading={uploading}
                disabled={selectedFiles.length === 0}
              >
                Carica {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">{title}</h2>
          <p className="text-neutral-600 mt-1">{documents.length} documenti totali</p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            placeholder="Cerca documenti..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={FiIcons.FiSearch}
            className="w-64"
          />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <Button icon={FiIcons.FiUpload} onClick={() => setShowUploadModal(true)}>
            Carica
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocuments.map(doc => (
          <Card key={doc.id} className="p-4">
            <div className="aspect-square bg-neutral-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
              {doc.type.startsWith('image/') ? (
                <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
              ) : (
                <SafeIcon icon={getFileIcon(doc.type)} className="w-8 h-8 text-neutral-400" />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-neutral-800 text-sm line-clamp-2">{doc.name}</h3>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{new Date(doc.uploadedAt).toLocaleDateString('it-IT')}</span>
                <span>{(doc.size / 1024).toFixed(0)} KB</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {categories.find(c => c.value === doc.category)?.label || 'Altro'}
              </Badge>
            </div>
            <div className="flex items-center space-x-1 mt-3">
              <Button size="sm" variant="ghost" icon={FiIcons.FiEye} onClick={() => window.open(doc.url, '_blank')}>
                Visualizza
              </Button>
              <Button size="sm" variant="ghost" icon={FiIcons.FiDownload} onClick={() => window.open(doc.url, '_blank')}>
                Scarica
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={FiIcons.FiTrash2}
                onClick={() => handleDelete(doc.id)}
                className="text-red-600 hover:text-red-700"
              >
                Elimina
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiIcons.FiFile} className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-neutral-500">Nessun documento trovato</p>
        </div>
      )}

      <AnimatePresence>
        {showUploadModal && <UploadModal />}
      </AnimatePresence>
    </div>
  );
};

export default DocumentManager;