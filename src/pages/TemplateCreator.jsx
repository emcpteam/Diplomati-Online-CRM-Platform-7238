import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../utils/SafeIcon';
import { Card, Button, Input, Badge } from '../components/UI';
import HTMLEditor from '../components/HTMLEditor';
import MediaGallery from '../components/MediaGallery';
import toast from 'react-hot-toast';

const TemplateCreator = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  const templateTypes = [
    { id: 'email', label: 'Email Templates', icon: FiIcons.FiMail },
    { id: 'pdf', label: 'PDF Templates', icon: FiIcons.FiFileText },
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

  const [pdfTemplates, setPdfTemplates] = useState([
    {
      id: 1,
      name: 'Contratto Iscrizione',
      category: 'contract',
      backgroundImage: null,
      elements: [
        { type: 'text', content: 'CONTRATTO DI ISCRIZIONE', x: 50, y: 100, fontSize: 24, fontWeight: 'bold' },
        { type: 'variable', content: '{{firstName}} {{lastName}}', x: 50, y: 200, fontSize: 16 },
        { type: 'text', content: 'Corso:', x: 50, y: 250, fontSize: 14 },
        { type: 'variable', content: '{{course}}', x: 120, y: 250, fontSize: 14 }
      ],
      variables: [
        { key: '{{firstName}}', label: 'Nome' },
        { key: '{{lastName}}', label: 'Cognome' },
        { key: '{{course}}', label: 'Corso' },
        { key: '{{totalAmount}}', label: 'Importo Totale' }
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
      uploadedAt: '2024-01-20'
    },
    {
      id: 2,
      name: 'Template Lettera PDF',
      type: 'document',
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      size: 'A4',
      format: 'PDF',
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
              <HTMLEditor
                value={content}
                onChange={setContent}
                variables={metadata.variables}
                placeholder="Inserisci il contenuto del template..."
              />
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

  const PDFTemplateEditor = ({ template, onClose, onSave }) => {
    const [elements, setElements] = useState(template?.elements || []);
    const [backgroundImage, setBackgroundImage] = useState(template?.backgroundImage || null);
    const [metadata, setMetadata] = useState({
      name: template?.name || '',
      category: template?.category || ''
    });
    const [selectedElement, setSelectedElement] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const addTextElement = () => {
      const newElement = {
        id: Date.now(),
        type: 'text',
        content: 'Nuovo testo',
        x: 50,
        y: 100,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000'
      };
      setElements(prev => [...prev, newElement]);
    };

    const addVariableElement = () => {
      const newElement = {
        id: Date.now(),
        type: 'variable',
        content: '{{firstName}}',
        x: 50,
        y: 150,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000'
      };
      setElements(prev => [...prev, newElement]);
    };

    const updateElement = (id, updates) => {
      setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteElement = (id) => {
      setElements(prev => prev.filter(el => el.id !== id));
      setSelectedElement(null);
    };

    const handleSave = () => {
      const updatedTemplate = {
        ...template,
        ...metadata,
        elements,
        backgroundImage,
        lastModified: new Date().toISOString().split('T')[0]
      };

      if (template) {
        setPdfTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t));
      } else {
        updatedTemplate.id = Date.now();
        setPdfTemplates(prev => [...prev, updatedTemplate]);
      }

      onSave(updatedTemplate);
      toast.success('Template PDF salvato con successo!');
      onClose();
    };

    const handleBackgroundSelect = (media) => {
      setBackgroundImage(media.url);
      toast.success('Sfondo aggiornato!');
    };

    if (!backgroundImage && !template) {
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
            <div className="p-6 text-center">
              <SafeIcon icon={FiIcons.FiFileText} className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Carica Documento PDF
              </h3>
              <p className="text-neutral-600 mb-6">
                Per creare un template PDF, carica prima un documento da usare come sfondo
              </p>
              <div className="flex items-center justify-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Annulla
                </Button>
                <Button icon={FiIcons.FiUpload} onClick={() => setShowMediaGallery(true)}>
                  Carica PDF
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      );
    }

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
          className="bg-white rounded-2xl shadow-strong max-w-7xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">
                Editor Template PDF
              </h2>
              <div className="flex items-center space-x-3">
                <Button variant="outline" icon={FiIcons.FiEye} onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? 'Nascondi' : 'Anteprima'}
                </Button>
                <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
              </div>
            </div>
          </div>

          <div className="flex h-[80vh]">
            {/* Toolbar */}
            <div className="w-64 border-r border-neutral-200 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <Input
                    label="Nome Template"
                    value={metadata.name}
                    onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome del template"
                  />
                </div>

                <div>
                  <h4 className="font-medium text-neutral-800 mb-2">Strumenti</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" icon={FiIcons.FiType} onClick={addTextElement} className="w-full justify-start">
                      Aggiungi Testo
                    </Button>
                    <Button variant="outline" size="sm" icon={FiIcons.FiCode} onClick={addVariableElement} className="w-full justify-start">
                      Aggiungi Variabile
                    </Button>
                    <Button variant="outline" size="sm" icon={FiIcons.FiImage} onClick={() => setShowMediaGallery(true)} className="w-full justify-start">
                      Cambia Sfondo
                    </Button>
                  </div>
                </div>

                {selectedElement && (
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-2">Proprietà Elemento</h4>
                    <div className="space-y-3">
                      {selectedElement.type === 'text' ? (
                        <textarea
                          value={selectedElement.content}
                          onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                          className="w-full h-20 px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                          placeholder="Testo..."
                        />
                      ) : (
                        <Input
                          value={selectedElement.content}
                          onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                          placeholder="{{variabile}}"
                          className="text-sm"
                        />
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="X"
                          type="number"
                          value={selectedElement.x}
                          onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) })}
                          className="text-sm"
                        />
                        <Input
                          label="Y"
                          type="number"
                          value={selectedElement.y}
                          onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) })}
                          className="text-sm"
                        />
                      </div>

                      <Input
                        label="Dimensione Font"
                        type="number"
                        value={selectedElement.fontSize}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                        className="text-sm"
                      />

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Peso Font</label>
                        <select
                          value={selectedElement.fontWeight}
                          onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg"
                        >
                          <option value="normal">Normale</option>
                          <option value="bold">Grassetto</option>
                        </select>
                      </div>

                      <Button
                        variant="danger"
                        size="sm"
                        icon={FiIcons.FiTrash2}
                        onClick={() => deleteElement(selectedElement.id)}
                        className="w-full"
                      >
                        Elimina Elemento
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 p-4 bg-neutral-100">
              <div className="relative bg-white shadow-lg mx-auto" style={{ width: '595px', height: '842px' }}>
                {/* Background */}
                {backgroundImage && (
                  <img
                    src={backgroundImage}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Elements */}
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute cursor-pointer border-2 ${
                      selectedElement?.id === element.id ? 'border-primary-500' : 'border-transparent hover:border-primary-300'
                    }`}
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      fontSize: `${element.fontSize}px`,
                      fontWeight: element.fontWeight,
                      color: element.color || '#000000'
                    }}
                    onClick={() => setSelectedElement(element)}
                  >
                    {element.content}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="w-80 border-l border-neutral-200 p-4 bg-neutral-50">
                <h4 className="font-medium text-neutral-800 mb-4">Anteprima</h4>
                <div className="bg-white rounded-lg shadow-medium p-4 text-sm">
                  <p><strong>Nome:</strong> {metadata.name || 'Template senza nome'}</p>
                  <p><strong>Elementi:</strong> {elements.length}</p>
                  <p><strong>Sfondo:</strong> {backgroundImage ? 'Presente' : 'Nessuno'}</p>
                  
                  <div className="mt-4">
                    <p className="font-medium mb-2">Variabili utilizzate:</p>
                    <div className="space-y-1">
                      {[...new Set(elements.filter(el => el.type === 'variable').map(el => el.content))].map(variable => (
                        <Badge key={variable} variant="secondary" className="text-xs mr-1">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
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

        {/* Media Gallery for background */}
        <MediaGallery
          isOpen={showMediaGallery}
          onClose={() => setShowMediaGallery(false)}
          onSelect={handleBackgroundSelect}
          allowedTypes={['application/pdf', 'image/*']}
          title="Seleziona Sfondo PDF"
        />
      </motion.div>
    );
  };

  const MediaUploader = ({ onClose, onUpload }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [mediaInfo, setMediaInfo] = useState({
      name: '',
      category: 'general',
      notes: ''
    });

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
        setSelectedFile(e.dataTransfer.files[0]);
        if (!mediaInfo.name) {
          setMediaInfo(prev => ({
            ...prev,
            name: e.dataTransfer.files[0].name.split('.')[0]
          }));
        }
      }
    };

    const handleUpload = () => {
      if (!selectedFile || !mediaInfo.name) {
        toast.error('Completa tutti i campi richiesti');
        return;
      }

      const newItem = {
        id: Date.now(),
        ...mediaInfo,
        originalName: selectedFile.name,
        type: selectedFile.type.startsWith('image/') ? 'image' : 'document',
        format: selectedFile.name.split('.').pop().toUpperCase(),
        size: selectedFile.type.startsWith('image/') ? '1024x768' : `${(selectedFile.size / 1024).toFixed(0)}KB`,
        url: URL.createObjectURL(selectedFile),
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      setMediaItems(prev => [newItem, ...prev]);
      onUpload(newItem);
      toast.success('File caricato con successo!');
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
          className="bg-white rounded-2xl shadow-strong max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">Carica Media</h2>
              <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
            </div>
          </div>

          <div className="p-6 space-y-6">
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
                  <SafeIcon icon={FiIcons.FiFile} className="w-12 h-12 text-accent-600 mx-auto" />
                  <div>
                    <p className="font-medium text-neutral-800">{selectedFile.name}</p>
                    <p className="text-sm text-neutral-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <SafeIcon icon={FiIcons.FiUpload} className="w-12 h-12 text-neutral-400 mx-auto" />
                  <p className="font-medium text-neutral-800">
                    Trascina qui il file o clicca per selezionare
                  </p>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        if (!mediaInfo.name) {
                          setMediaInfo(prev => ({
                            ...prev,
                            name: e.target.files[0].name.split('.')[0]
                          }));
                        }
                      }
                    }}
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload">
                    <Button as="span" variant="outline">Seleziona File</Button>
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome File"
                value={mediaInfo.name}
                onChange={(e) => setMediaInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome del file"
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Categoria
                </label>
                <select
                  value={mediaInfo.category}
                  onChange={(e) => setMediaInfo(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="general">Generale</option>
                  <option value="branding">Branding</option>
                  <option value="courses">Corsi</option>
                  <option value="templates">Template</option>
                  <option value="documents">Documenti</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200">
            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>Annulla</Button>
              <Button icon={FiIcons.FiUpload} onClick={handleUpload}>
                Carica File
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
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
                      const duplicated = {
                        ...template,
                        id: Date.now(),
                        name: `${template.name} (Copia)`
                      };
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

      case 'pdf':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pdfTemplates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <SafeIcon icon={FiIcons.FiFileText} className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">{template.name}</h3>
                      <p className="text-sm text-neutral-500">{template.category}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Elementi:</p>
                    <Badge variant="secondary" className="text-xs">
                      {template.elements.length} elementi
                    </Badge>
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
                      setShowPDFPreview(true);
                    }}
                  >
                    Modifica
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={FiIcons.FiDownload}
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
                  <h3 className="font-medium text-neutral-800 text-sm">{item.name}</h3>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{item.format}</span>
                    <span>{item.size}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                </div>
                <div className="flex items-center space-x-1 mt-3">
                  <Button size="sm" variant="ghost" icon={FiIcons.FiEye}>
                    Preview
                  </Button>
                  <Button size="sm" variant="ghost" icon={FiIcons.FiEdit}>
                    Rinomina
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={FiIcons.FiTrash2}
                    onClick={() => {
                      setMediaItems(prev => prev.filter(i => i.id !== item.id));
                      toast.success('File eliminato!');
                    }}
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
            Crea e gestisci template per email, PDF e documenti
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {activeTab === 'media' ? (
            <Button icon={FiIcons.FiUpload} onClick={() => setShowEditor(true)}>
              Carica Media
            </Button>
          ) : (
            <Button
              icon={FiIcons.FiPlus}
              onClick={() => {
                setSelectedTemplate(null);
                if (activeTab === 'pdf') {
                  setShowPDFPreview(true);
                } else {
                  setShowEditor(true);
                }
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
      {showEditor && activeTab === 'media' && (
        <MediaUploader
          onClose={() => setShowEditor(false)}
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

      {showPDFPreview && (
        <PDFTemplateEditor
          template={selectedTemplate}
          onClose={() => {
            setShowPDFPreview(false);
            setSelectedTemplate(null);
          }}
          onSave={(template) => {
            console.log('PDF Template saved:', template);
          }}
        />
      )}
    </div>
  );
};

export default TemplateCreator;