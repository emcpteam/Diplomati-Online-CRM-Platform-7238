import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../utils/SafeIcon';
import { Card, Button, Input, Badge } from '../components/UI';
import HTMLEditor from '../components/HTMLEditor';
import { uploadFile, validateFile } from '../utils';
import toast from 'react-hot-toast';

const TemplateCreator = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const templateTypes = [
    { id: 'email', label: 'Email Templates', icon: FiIcons.FiMail },
    { id: 'document', label: 'Document Templates', icon: FiIcons.FiFile },
    { id: 'media', label: 'Media Gallery', icon: FiIcons.FiImage }
  ];

  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 1,
      name: 'Benvenuto Studente',
      category: 'student',
      subject: 'Benvenuto in Diplomati Online!',
      content: '<h2>Ciao {{firstName}}!</h2><p>Benvenuto nel corso <strong>{{course}}</strong>.</p><p>Siamo felici di averti con noi!</p>',
      variables: [
        { key: '{{firstName}}', label: 'Nome Studente' },
        { key: '{{lastName}}', label: 'Cognome Studente' },
        { key: '{{course}}', label: 'Nome Corso' },
        { key: '{{enrollmentDate}}', label: 'Data Iscrizione' }
      ],
      lastModified: '2024-01-20'
    },
    {
      id: 2,
      name: 'Promemoria Pagamento',
      category: 'payment',
      subject: 'Promemoria Pagamento - Diplomati Online',
      content: '<h2>Ciao {{firstName}}!</h2><p>Ti ricordiamo che hai un pagamento in sospeso di <strong>€{{amount}}</strong>.</p><p>Scadenza: {{dueDate}}</p>',
      variables: [
        { key: '{{firstName}}', label: 'Nome Studente' },
        { key: '{{amount}}', label: 'Importo' },
        { key: '{{dueDate}}', label: 'Data Scadenza' }
      ],
      lastModified: '2024-01-18'
    }
  ]);

  const [documentTemplates, setDocumentTemplates] = useState([
    {
      id: 1,
      name: 'Contratto Iscrizione',
      category: 'contract',
      content: `CONTRATTO DI ISCRIZIONE

Diplomati Online Srl

DATI STUDENTE:
Nome: {{firstName}} {{lastName}}
Codice Fiscale: {{codiceFiscale}}
Email: {{email}}
Telefono: {{phone}}

DETTAGLI CORSO:
Corso: {{course}}
Anni da Recuperare: {{yearsToRecover}}
Importo Totale: €{{totalAmount}}

Data Iscrizione: {{enrollmentDate}}

Diplomati Online Srl
P.IVA: IT12345678901`,
      variables: [
        { key: '{{firstName}}', label: 'Nome' },
        { key: '{{lastName}}', label: 'Cognome' },
        { key: '{{codiceFiscale}}', label: 'Codice Fiscale' },
        { key: '{{email}}', label: 'Email' },
        { key: '{{phone}}', label: 'Telefono' },
        { key: '{{course}}', label: 'Corso' },
        { key: '{{yearsToRecover}}', label: 'Anni da Recuperare' },
        { key: '{{totalAmount}}', label: 'Importo Totale' },
        { key: '{{enrollmentDate}}', label: 'Data Iscrizione' }
      ],
      lastModified: '2024-01-20'
    }
  ]);

  const [mediaItems, setMediaItems] = useState([
    {
      id: 1,
      name: 'Logo Diplomati Online',
      type: 'image',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiByeD0iNjQiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxwYXRoIGQ9Ik0xMjggMTkyQzE2NC4xIDEzMi41IDE5MiA5NiAxOTIgNjRDMTkyIDI4LjcgMTYzLjMgMCAxMjggMEM5Mi43IDAgNjQgMjguNyA2NCA2NEM2NCA5NiA5MS45IDEzMi41IDEyOCAxOTJaIiBmaWxsPSJ3aGl0ZSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDBfbGluZWFyXzFfMSIgeDE9IjAiIHkxPSIwIiB4Mj0iMjU2IiB5Mj0iMjU2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwRUE1RTkiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRDk0NkVGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2Zz4K',
      size: '256x256',
      format: 'SVG',
      category: 'branding',
      uploadedAt: '2024-01-20'
    },
    {
      id: 2,
      name: 'Header Lettera',
      type: 'image',
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      size: '1200x300',
      format: 'PNG',
      category: 'templates',
      uploadedAt: '2024-01-18'
    }
  ]);

  const TemplateEditor = ({ template, type, onClose, onSave }) => {
    const [content, setContent] = useState(template?.content || '');
    const [metadata, setMetadata] = useState({
      name: template?.name || '',
      category: template?.category || '',
      subject: template?.subject || '',
      variables: template?.variables || []
    });

    const handleSave = () => {
      const updatedTemplate = {
        ...template,
        ...metadata,
        content,
        lastModified: new Date().toISOString().split('T')[0]
      };

      if (type === 'email') {
        if (template) {
          setEmailTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t));
        } else {
          updatedTemplate.id = Date.now();
          setEmailTemplates(prev => [...prev, updatedTemplate]);
        }
      } else if (type === 'document') {
        if (template) {
          setDocumentTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t));
        } else {
          updatedTemplate.id = Date.now();
          setDocumentTemplates(prev => [...prev, updatedTemplate]);
        }
      }

      onSave(updatedTemplate);
      toast.success('Template salvato con successo!');
      onClose();
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
          className="bg-white rounded-2xl shadow-strong max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">
                {template ? 'Modifica Template' : 'Nuovo Template'}
              </h2>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome Template"
                value={metadata.name}
                onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome del template"
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Categoria
                </label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleziona categoria</option>
                  {type === 'email' && (
                    <>
                      <option value="student">Studenti</option>
                      <option value="payment">Pagamenti</option>
                      <option value="exam">Esami</option>
                      <option value="lead">Lead</option>
                    </>
                  )}
                  {type === 'document' && (
                    <>
                      <option value="contract">Contratti</option>
                      <option value="exam">Esami</option>
                      <option value="certificate">Certificati</option>
                      <option value="letter">Lettere</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {type === 'email' && (
              <Input
                label="Oggetto Email"
                value={metadata.subject}
                onChange={(e) => setMetadata(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Oggetto dell'email"
              />
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Contenuto Template
              </label>
              {type === 'email' ? (
                <HTMLEditor
                  value={content}
                  onChange={setContent}
                  variables={metadata.variables}
                  placeholder="Inserisci il contenuto del template..."
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Inserisci il contenuto del template..."
                  className="w-full h-96 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                />
              )}
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button icon={FiIcons.FiSave} onClick={handleSave}>
                Salva Template
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const MediaUploader = ({ onClose, onUpload }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

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
      if (e.dataTransfer.files) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    };

    const handleFiles = (files) => {
      const validFiles = [];
      files.forEach(file => {
        const errors = validateFile(file, 10 * 1024 * 1024, ['image/*', 'application/pdf']);
        if (errors.length === 0) {
          validFiles.push({
            file,
            name: file.name.split('.')[0],
            category: 'general',
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
          });
        } else {
          toast.error(`${file.name}: ${errors[0]}`);
        }
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const updateFileName = (index, newName) => {
      setSelectedFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, name: newName } : item
      ));
    };

    const updateFileCategory = (index, category) => {
      setSelectedFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, category } : item
      ));
    };

    const removeFile = (index) => {
      setSelectedFiles(prev => {
        const newFiles = prev.filter((_, i) => i !== index);
        // Clean up preview URLs
        if (prev[index].preview) {
          URL.revokeObjectURL(prev[index].preview);
        }
        return newFiles;
      });
    };

    const handleUpload = async () => {
      if (selectedFiles.length === 0) {
        toast.error('Seleziona almeno un file');
        return;
      }

      setUploading(true);
      toast.loading('Caricamento file in corso...', { id: 'upload' });

      try {
        for (let i = 0; i < selectedFiles.length; i++) {
          const fileData = selectedFiles[i];
          setUploadProgress(((i + 1) / selectedFiles.length) * 100);

          const uploadResult = await uploadFile(fileData.file, 'media');
          
          const newItem = {
            id: Date.now() + i,
            name: fileData.name,
            originalName: fileData.file.name,
            type: fileData.file.type.startsWith('image/') ? 'image' : 'document',
            format: fileData.file.name.split('.').pop().toUpperCase(),
            size: fileData.file.type.startsWith('image/') ? 
              `${Math.round(Math.random() * 1000 + 200)}x${Math.round(Math.random() * 800 + 200)}` : 
              `${(fileData.file.size / 1024).toFixed(0)}KB`,
            url: uploadResult.url,
            category: fileData.category,
            uploadedAt: new Date().toISOString().split('T')[0]
          };

          setMediaItems(prev => [newItem, ...prev]);
          onUpload(newItem);
        }

        toast.success(`${selectedFiles.length} file caricati con successo!`, { id: 'upload' });
        onClose();
      } catch (error) {
        toast.error('Errore durante il caricamento', { id: 'upload' });
      } finally {
        setUploading(false);
        setUploadProgress(0);
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
              <h2 className="text-2xl font-bold text-neutral-800">Carica Media</h2>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'
              }`}
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
                Immagini e PDF supportati (max 10MB)
              </p>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => handleFiles(Array.from(e.target.files))}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload">
                <Button as="span" variant="outline">Seleziona File</Button>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                  File Selezionati ({selectedFiles.length})
                </h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {selectedFiles.map((fileData, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl">
                      <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {fileData.preview ? (
                          <img src={fileData.preview} alt={fileData.name} className="w-full h-full object-cover" />
                        ) : (
                          <SafeIcon icon={FiIcons.FiFile} className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={fileData.name}
                          onChange={(e) => updateFileName(index, e.target.value)}
                          placeholder="Nome del file"
                          className="text-sm"
                        />
                        <select
                          value={fileData.category}
                          onChange={(e) => updateFileCategory(index, e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="general">Generale</option>
                          <option value="branding">Branding</option>
                          <option value="courses">Corsi</option>
                          <option value="templates">Template</option>
                          <option value="documents">Documenti</option>
                        </select>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500 mb-1">{fileData.file.name}</p>
                        <p className="text-xs text-neutral-400">{(fileData.file.size / 1024).toFixed(0)}KB</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={FiIcons.FiX}
                          onClick={() => removeFile(index)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Caricamento in corso...</span>
                  <span className="text-sm font-medium text-neutral-800">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={onClose} disabled={uploading}>
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

  const RenameModal = ({ media, onClose, onRename }) => {
    const [newName, setNewName] = useState(media.name);

    const handleRename = () => {
      if (!newName.trim()) {
        toast.error('Inserisci un nome valido');
        return;
      }
      onRename(media.id, newName.trim());
      onClose();
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
          className="bg-white rounded-2xl shadow-strong max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-800">Rinomina File</h2>
          </div>
          <div className="p-6">
            <Input
              label="Nuovo Nome"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Inserisci nuovo nome"
              autoFocus
            />
          </div>
          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button onClick={handleRename}>
                Rinomina
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const handleRenameMedia = (mediaId, newName) => {
    setMediaItems(prev => prev.map(item => 
      item.id === mediaId ? { ...item, name: newName } : item
    ));
    toast.success('File rinominato con successo!');
  };

  const handleDeleteMedia = (mediaId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo file?')) {
      setMediaItems(prev => prev.filter(item => item.id !== mediaId));
      toast.success('File eliminato con successo!');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'email':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <SafeIcon icon={FiIcons.FiMail} className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">{template.name}</h3>
                      <p className="text-sm text-neutral-500">{template.subject}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Variabili:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map(variable => (
                        <Badge key={variable.key} variant="default" className="text-xs">
                          {variable.key}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="default" className="text-xs">
                          +{template.variables.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Modificato: {template.lastModified}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FiIcons.FiEdit}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowEditor(true);
                    }}
                  >
                    Modifica
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={FiIcons.FiCopy}
                    onClick={() => {
                      const duplicated = { ...template, id: Date.now(), name: `${template.name} (Copia)` };
                      setEmailTemplates(prev => [...prev, duplicated]);
                      toast.success('Template duplicato!');
                    }}
                  >
                    Duplica
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'document':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {documentTemplates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <SafeIcon icon={FiIcons.FiFile} className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">{template.name}</h3>
                      <p className="text-sm text-neutral-500">{template.category}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Variabili:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map(variable => (
                        <Badge key={variable.key} variant="default" className="text-xs">
                          {variable.key}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="default" className="text-xs">
                          +{template.variables.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Modificato: {template.lastModified}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FiIcons.FiEdit}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowEditor(true);
                    }}
                  >
                    Modifica
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={FiIcons.FiDownload}
                    onClick={() => {
                      const blob = new Blob([template.content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${template.name}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                      toast.success('Template scaricato!');
                    }}
                  >
                    Scarica
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'media':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {mediaItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="aspect-square bg-neutral-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <SafeIcon icon={FiIcons.FiFile} className="w-8 h-8 text-neutral-400" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-neutral-800 text-sm line-clamp-2">{item.name}</h3>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{item.format}</span>
                    <span>{item.size}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                </div>
                <div className="flex items-center space-x-1 mt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={FiIcons.FiEye}
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={FiIcons.FiEdit}
                    onClick={() => {
                      setSelectedMedia(item);
                      setShowRenameModal(true);
                    }}
                  >
                    Rinomina
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={FiIcons.FiTrash2}
                    onClick={() => handleDeleteMedia(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Elimina
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Template Creator
          </h1>
          <p className="text-neutral-600 mt-2">
            Crea e gestisci template per email, documenti e media
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {activeTab === 'media' ? (
            <Button icon={FiIcons.FiUpload} onClick={() => setShowMediaUploader(true)}>
              Carica Media
            </Button>
          ) : (
            <Button
              icon={FiIcons.FiPlus}
              onClick={() => {
                setSelectedTemplate(null);
                setShowEditor(true);
              }}
            >
              Nuovo Template
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {templateTypes.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>

      {/* Modals */}
      {showMediaUploader && (
        <MediaUploader
          onClose={() => setShowMediaUploader(false)}
          onUpload={(item) => {
            console.log('Media uploaded:', item);
          }}
        />
      )}

      {showEditor && activeTab !== 'media' && (
        <TemplateEditor
          template={selectedTemplate}
          type={activeTab}
          onClose={() => {
            setShowEditor(false);
            setSelectedTemplate(null);
          }}
          onSave={(template) => {
            console.log('Template saved:', template);
          }}
        />
      )}

      {showRenameModal && selectedMedia && (
        <RenameModal
          media={selectedMedia}
          onClose={() => {
            setShowRenameModal(false);
            setSelectedMedia(null);
          }}
          onRename={handleRenameMedia}
        />
      )}
    </div>
  );
};

export default TemplateCreator;