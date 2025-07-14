```jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import SafeIcon from '../common/SafeIcon';
import { Card, Button, Input } from '../components/UI';
import MediaGallery from '../components/MediaGallery';
import { useApp } from '../context/AppContext';
import { validateFile, uploadFile } from '../utils';

const CompanyConfig = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: state.company.name || '',
    logo: state.company.logo || null,
    vatId: state.company.vatId || '',
    sdiCode: state.company.sdiCode || '',
    address: state.company.address || '',
    city: state.company.city || '',
    province: state.company.province || '',
    cap: state.company.cap || '',
    email: state.company.email || '',
    pec: state.company.pec || '',
    phone: state.company.phone || '',
    whatsapp: state.company.whatsapp || '',
    notes: state.company.notes || '',
    website: state.company.website || '',
    socialMedia: state.company.socialMedia || {
      facebook: '',
      instagram: '',
      linkedin: ''
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    const errors = validateFile(file, 5 * 1024 * 1024, ['image/jpeg', 'image/png', 'image/svg+xml']);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setUploading(true);
    try {
      const uploadResult = await uploadFile(file, 'logo');
      handleInputChange('logo', uploadResult.url);
      toast.success('Logo caricato con successo!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Errore durante il caricamento del logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Il nome dell\'azienda è obbligatorio');
      return;
    }
    dispatch({ type: 'SET_COMPANY', payload: formData });
    setIsEditing(false);
    toast.success('Configurazione aziendale salvata con successo!');
  };

  const handleReset = () => {
    setFormData(state.company);
    setIsEditing(false);
    toast.info('Modifiche ripristinate');
  };

  const handleExportData = () => {
    const companyData = {
      company: state.company,
      stats: {
        totalStudents: state.students.length,
        totalSchools: state.schools.length,
        totalCourses: state.courses.length,
        totalRevenue: state.students.reduce((sum, s) => sum + s.paidAmount, 0)
      },
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(companyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'company-data-export.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Dati aziendali esportati con successo!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Configurazione Azienda
          </h1>
          <p className="text-neutral-600 mt-2">
            Configura le informazioni principali dell'azienda
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {isEditing ? (
            <>
              <Button variant="outline" icon={FiIcons.FiRefreshCw} onClick={handleReset}>
                Ripristina
              </Button>
              <Button icon={FiIcons.FiSave} onClick={handleSave}>
                Salva Modifiche
              </Button>
            </>
          ) : (
            <Button icon={FiIcons.FiEdit} onClick={() => setIsEditing(true)}>
              Modifica
            </Button>
          )}
        </div>
      </div>

      {/* Company Logo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Logo Aziendale</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div
              className={`w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center border-2 ${
                isEditing ? 'border-dashed border-primary-300 hover:border-primary-500' : 'border-neutral-200'
              } relative overflow-hidden transition-colors`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isEditing) {
                  e.currentTarget.classList.add('border-primary-500', 'bg-primary-50');
                }
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isEditing) {
                  e.currentTarget.classList.remove('border-primary-500', 'bg-primary-50');
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isEditing) return;
                e.currentTarget.classList.remove('border-primary-500', 'bg-primary-50');
                const file = e.dataTransfer.files[0];
                if (file) {
                  handleLogoUpload(file);
                }
              }}
              onClick={() => {
                if (isEditing) {
                  document.getElementById('logo-upload').click();
                }
              }}
            >
              {formData.logo ? (
                <>
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="danger"
                        size="sm"
                        icon={FiIcons.FiTrash2}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Sei sicuro di voler eliminare il logo?')) {
                            handleInputChange('logo', null);
                            toast.success('Logo eliminato con successo');
                          }
                        }}
                      >
                        Elimina
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <SafeIcon
                    icon={FiIcons.FiImage}
                    className={`w-8 h-8 ${isEditing ? 'text-primary-400' : 'text-neutral-400'}`}
                  />
                  {isEditing && (
                    <p className="text-xs text-neutral-500 mt-2">
                      Trascina o clicca
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleLogoUpload(file);
                  }
                }}
                className="hidden"
                id="logo-upload"
                disabled={!isEditing}
              />
              {isEditing && (
                <>
                  <Button
                    variant="outline"
                    icon={FiIcons.FiUpload}
                    onClick={() => document.getElementById('logo-upload').click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Caricamento...' : 'Carica File'}
                  </Button>
                  <Button
                    variant="outline"
                    icon={FiIcons.FiImage}
                    onClick={() => setShowMediaGallery(true)}
                    disabled={uploading}
                  >
                    Galleria
                  </Button>
                </>
              )}
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              Formati supportati: JPG, PNG, SVG. Max 5MB.
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              {isEditing ? 'Trascina un\'immagine o clicca per caricare' : 'Il logo verrà ridimensionato automaticamente.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Company Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">Informazioni Aziendali</h3>
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome Azienda *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
              required
            />
            <Input
              label="Partita IVA"
              value={formData.vatId}
              onChange={(e) => handleInputChange('vatId', e.target.value)}
              disabled={!isEditing}
            />
            <Input
              label="Codice SDI"
              value={formData.sdiCode}
              onChange={(e) => handleInputChange('sdiCode', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {/* Address */}
          <div>
            <h4 className="text-sm font-medium text-neutral-800 mb-4">Indirizzo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Indirizzo"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Città"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Provincia"
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="CAP"
                value={formData.cap}
                onChange={(e) => handleInputChange('cap', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-medium text-neutral-800 mb-4">Contatti</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="PEC"
                type="email"
                value={formData.pec}
                onChange={(e) => handleInputChange('pec', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Telefono"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="WhatsApp"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Online Presence */}
          <div>
            <h4 className="text-sm font-medium text-neutral-800 mb-4">Presenza Online</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Sito Web"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Facebook"
                value={formData.socialMedia.facebook}
                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Instagram"
                value={formData.socialMedia.instagram}
                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="LinkedIn"
                value={formData.socialMedia.linkedin}
                onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Note</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={!isEditing}
              placeholder="Note aggiuntive sull'azienda..."
              className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Media Gallery Modal */}
      <MediaGallery
        isOpen={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
        onSelect={(media) => {
          handleInputChange('logo', media.url);
          setShowMediaGallery(false);
          toast.success('Logo aggiornato con successo!');
        }}
        allowedTypes={['image/*']}
        title="Seleziona Logo Aziendale"
      />
    </div>
  );
};

export default CompanyConfig;
```