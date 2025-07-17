import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Button from './ui/Button';
import Input from './ui/Input';
import Badge from './ui/Badge';
import { uploadFile, validateFile } from '../utils';
import toast from 'react-hot-toast';

const MediaGallery = ({ isOpen, onClose, onSelect, allowedTypes = ['image/*'], multiple = false, title = "Galleria Media" }) => {
  const [mediaItems, setMediaItems] = useState([
    {
      id: 1,
      name: 'Logo Diplomati Online',
      type: 'image',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiByeD0iNjQiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxwYXRoIGQ9Ik0xMjggMTkyQzE2NC4xIDEzMi41IDE5MiA5NiAxOTIgNjRDMTkyIDI4LjcgMTYzLjMgMCAxMjggMEM5Mi43IDAgNjQgMjguNyA2NCA2NEM2NCA5NiA5MS45IDEzMi41IDEyOCAxOTJaIiBmaWxsPSJ3aGl0ZSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDBfbGluZWFyXzFfMSIgeDE9IjAiIHkxPSIwIiB4Mj0iMjU2IiB5Mj0iMjU2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwRUE1RTkiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRDk0NkVGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHN2Zz4K',
      size: '256x256',
      format: 'SVG',
      uploadedAt: '2024-01-20'
    }
  ]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    toast.loading('Caricamento file in corso...', { id: 'upload' });

    try {
      for (const file of Array.from(files)) {
        const errors = validateFile(file, 10 * 1024 * 1024, allowedTypes);
        if (errors.length > 0) {
          toast.error(errors[0]);
          continue;
        }

        const uploadResult = await uploadFile(file, 'media');
        const newItem = {
          id: Date.now() + Math.random(),
          name: file.name.split('.')[0],
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: uploadResult.url,
          size: file.type.startsWith('image/') ? '1024x768' : `${(file.size / 1024).toFixed(0)}KB`,
          format: file.name.split('.').pop().toUpperCase(),
          uploadedAt: new Date().toISOString().split('T')[0]
        };
        setMediaItems(prev => [newItem, ...prev]);
      }
      toast.success('File caricati con successo!', { id: 'upload' });
    } catch (error) {
      toast.error('Errore durante il caricamento', { id: 'upload' });
    } finally {
      setUploading(false);
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
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleItemToggle = (item) => {
    if (multiple) {
      setSelectedItems(prev => 
        prev.find(i => i.id === item.id) 
          ? prev.filter(i => i.id !== item.id) 
          : [...prev, item]
      );
    } else {
      setSelectedItems([item]);
    }
  };

  const handleSelect = () => {
    if (selectedItems.length === 0) {
      toast.error('Seleziona almeno un elemento');
      return;
    }
    onSelect(multiple ? selectedItems : selectedItems[0]);
    onClose();
  };

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
        className="bg-white rounded-2xl shadow-strong max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">{title}</h2>
              <p className="text-neutral-600">Seleziona file dalla galleria o carica nuovi</p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Input 
                placeholder="Cerca file..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                icon={FiIcons.FiSearch} 
                className="w-64" 
              />
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)} 
                className="px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tutti i tipi</option>
                <option value="image">Immagini</option>
                <option value="document">Documenti</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              {selectedItems.length > 0 && (
                <Badge variant="primary">
                  {selectedItems.length} selezionati
                </Badge>
              )}
              <input 
                type="file" 
                multiple 
                accept={allowedTypes.join(',')} 
                onChange={(e) => handleFileSelect(e.target.files)} 
                className="hidden" 
                id="file-upload" 
              />
              <label htmlFor="file-upload">
                <Button as="span" variant="outline" icon={FiIcons.FiUpload} loading={uploading}>
                  Carica File
                </Button>
              </label>
            </div>
          </div>
        </div>

        {/* Upload Drop Zone */}
        <div 
          className={`mx-6 mb-4 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <SafeIcon icon={FiIcons.FiUpload} className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="font-medium text-neutral-800">
            Trascina i file qui per caricare
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            Oppure clicca su "Carica File" sopra
          </p>
        </div>

        {/* Media Grid */}
        <div className="px-6 pb-6 max-h-96 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedItems.find(i => i.id === item.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => handleItemToggle(item)}
                >
                  {/* Preview */}
                  <div className="aspect-square bg-neutral-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <SafeIcon icon={FiIcons.FiFile} className="w-8 h-8 text-neutral-400" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-800 truncate">{item.name}</p>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>{item.format}</span>
                      <span>{item.size}</span>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedItems.find(i => i.id === item.id) && (
                    <div className="absolute top-1 right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiIcons.FiCheck} className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiIcons.FiImage} className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500">Nessun file trovato</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              {filteredItems.length} file totali
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button 
                icon={FiIcons.FiCheck} 
                onClick={handleSelect} 
                disabled={selectedItems.length === 0}
              >
                Seleziona ({selectedItems.length})
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MediaGallery;