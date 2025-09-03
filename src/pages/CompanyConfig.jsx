import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { validateFile, uploadFile } from '../utils';

const CompanyConfig = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState(state.company);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Informazioni Generali', icon: FiIcons.FiInfo },
    { id: 'address', label: 'Sede e Contatti', icon: FiIcons.FiMapPin },
    { id: 'fiscal', label: 'Dati Fiscali', icon: FiIcons.FiFileText },
    { id: 'banking', label: 'Dati Bancari', icon: FiIcons.FiCreditCard },
    { id: 'branding', label: 'Logo e Branding', icon: FiIcons.FiImage }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
    // Validate required fields
    const requiredFields = {
      name: 'Nome azienda',
      vatId: 'Partita IVA',
      fiscalCode: 'Codice Fiscale',
      address: 'Indirizzo',
      city: 'Città',
      cap: 'CAP',
      email: 'Email',
      phone: 'Telefono'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]?.trim()) {
        toast.error(`Il campo "${label}" è obbligatorio`);
        return;
      }
    }

    // Validate VAT format (basic)
    if (formData.vatId && !formData.vatId.match(/^IT\d{11}$/)) {
      toast.error('Formato Partita IVA non valido (es: IT12345678901)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      toast.error('Formato email non valido');
      return;
    }

    // Validate PEC email format if provided
    if (formData.pec && !emailRegex.test(formData.pec)) {
      toast.error('Formato PEC non valido');
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome Azienda *"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Diplomati Online Srl"
                disabled={!isEditing}
                required
              />
              <Input
                label="Nome Commerciale"
                value={formData.tradeName || ''}
                onChange={(e) => handleInputChange('tradeName', e.target.value)}
                placeholder="Diplomati Online"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Settore di Attività"
                value={formData.businessSector || ''}
                onChange={(e) => handleInputChange('businessSector', e.target.value)}
                placeholder="Formazione e Istruzione"
                disabled={!isEditing}
              />
              <Input
                label="Forma Giuridica"
                value={formData.legalForm || ''}
                onChange={(e) => handleInputChange('legalForm', e.target.value)}
                placeholder="Società a Responsabilità Limitata"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Data di Costituzione"
                type="date"
                value={formData.foundationDate || ''}
                onChange={(e) => handleInputChange('foundationDate', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Numero REA"
                value={formData.reaNumber || ''}
                onChange={(e) => handleInputChange('reaNumber', e.target.value)}
                placeholder="MI-1234567"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Descrizione Attività
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrivi l'attività principale dell'azienda..."
                className="w-full h-24 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                disabled={!isEditing}
              />
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-6">
            <div>
              <Input
                label="Indirizzo Sede Legale *"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Via Roma, 123"
                disabled={!isEditing}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Città *"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Milano"
                disabled={!isEditing}
                required
              />
              <Input
                label="Provincia"
                value={formData.province || ''}
                onChange={(e) => handleInputChange('province', e.target.value)}
                placeholder="MI"
                disabled={!isEditing}
              />
              <Input
                label="CAP *"
                value={formData.cap || ''}
                onChange={(e) => handleInputChange('cap', e.target.value)}
                placeholder="20100"
                disabled={!isEditing}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nazione"
                value={formData.country || 'Italia'}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Regione"
                value={formData.region || ''}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder="Lombardia"
                disabled={!isEditing}
              />
            </div>

            <hr className="border-neutral-200" />

            <h3 className="text-lg font-semibold text-neutral-800">Contatti</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Telefono Principale *"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+39 02 1234567"
                disabled={!isEditing}
                required
              />
              <Input
                label="Telefono Secondario"
                value={formData.phoneSecondary || ''}
                onChange={(e) => handleInputChange('phoneSecondary', e.target.value)}
                placeholder="+39 02 7654321"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="WhatsApp Business"
                value={formData.whatsapp || ''}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="+39 320 1234567"
                disabled={!isEditing}
              />
              <Input
                label="Fax"
                value={formData.fax || ''}
                onChange={(e) => handleInputChange('fax', e.target.value)}
                placeholder="+39 02 1234568"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email Principale *"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="info@diplomatonline.it"
                disabled={!isEditing}
                required
              />
              <Input
                label="Email Amministrazione"
                type="email"
                value={formData.emailAdmin || ''}
                onChange={(e) => handleInputChange('emailAdmin', e.target.value)}
                placeholder="admin@diplomatonline.it"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Sito Web"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.diplomatonline.it"
                disabled={!isEditing}
              />
              <Input
                label="Social Media"
                value={formData.socialMedia || ''}
                onChange={(e) => handleInputChange('socialMedia', e.target.value)}
                placeholder="@diplomatonline"
                disabled={!isEditing}
              />
            </div>
          </div>
        );

      case 'fiscal':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Partita IVA *"
                value={formData.vatId || ''}
                onChange={(e) => handleInputChange('vatId', e.target.value)}
                placeholder="IT12345678901"
                disabled={!isEditing}
                required
              />
              <Input
                label="Codice Fiscale *"
                value={formData.fiscalCode || ''}
                onChange={(e) => handleInputChange('fiscalCode', e.target.value)}
                placeholder="12345678901"
                disabled={!isEditing}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Codice SDI"
                value={formData.sdiCode || ''}
                onChange={(e) => handleInputChange('sdiCode', e.target.value)}
                placeholder="ABCDEFG"
                disabled={!isEditing}
              />
              <Input
                label="Codice ATECO"
                value={formData.atecoCode || ''}
                onChange={(e) => handleInputChange('atecoCode', e.target.value)}
                placeholder="85.59.20"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Regime Fiscale"
                value={formData.taxRegime || ''}
                onChange={(e) => handleInputChange('taxRegime', e.target.value)}
                placeholder="RF01 - Ordinario"
                disabled={!isEditing}
              />
              <Input
                label="Codice Univoco Ufficio"
                value={formData.uniqueOfficeCode || ''}
                onChange={(e) => handleInputChange('uniqueOfficeCode', e.target.value)}
                placeholder="UFXXXX"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="PEC Aziendale"
                type="email"
                value={formData.pec || ''}
                onChange={(e) => handleInputChange('pec', e.target.value)}
                placeholder="pec@diplomatonline.it"
                disabled={!isEditing}
              />
              <Input
                label="Capitale Sociale"
                value={formData.shareCapital || ''}
                onChange={(e) => handleInputChange('shareCapital', e.target.value)}
                placeholder="€ 10.000,00"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Note Fiscali
              </label>
              <textarea
                value={formData.taxNotes || ''}
                onChange={(e) => handleInputChange('taxNotes', e.target.value)}
                placeholder="Note aggiuntive sui dati fiscali..."
                className="w-full h-20 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                disabled={!isEditing}
              />
            </div>
          </div>
        );

      case 'banking':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-neutral-800">Conto Corrente Principale</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="IBAN"
                value={formData.iban || ''}
                onChange={(e) => handleInputChange('iban', e.target.value)}
                placeholder="IT60 X054 2811 1010 0000 0123 456"
                disabled={!isEditing}
              />
              <Input
                label="BIC/SWIFT"
                value={formData.bic || ''}
                onChange={(e) => handleInputChange('bic', e.target.value)}
                placeholder="BCITITMM"
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Banca"
                value={formData.bankName || ''}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                placeholder="Banca Intesa Sanpaolo"
                disabled={!isEditing}
              />
              <Input
                label="Filiale"
                value={formData.bankBranch || ''}
                onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                placeholder="Milano Centro"
                disabled={!isEditing}
              />
            </div>

            <div>
              <Input
                label="Indirizzo Filiale"
                value={formData.bankAddress || ''}
                onChange={(e) => handleInputChange('bankAddress', e.target.value)}
                placeholder="Piazza San Fedele, 2 - 20121 Milano"
                disabled={!isEditing}
              />
            </div>

            <div>
              <Input
                label="Intestazione Conto"
                value={formData.accountHolder || ''}
                onChange={(e) => handleInputChange('accountHolder', e.target.value)}
                placeholder="Diplomati Online Srl"
                disabled={!isEditing}
              />
            </div>

            <hr className="border-neutral-200" />

            <h3 className="text-lg font-semibold text-neutral-800">Conto Corrente Secondario (Opzionale)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="IBAN Secondario"
                value={formData.ibanSecondary || ''}
                onChange={(e) => handleInputChange('ibanSecondary', e.target.value)}
                placeholder="IT60 X054 2811 1010 0000 0123 457"
                disabled={!isEditing}
              />
              <Input
                label="Banca Secondaria"
                value={formData.bankNameSecondary || ''}
                onChange={(e) => handleInputChange('bankNameSecondary', e.target.value)}
                placeholder="UniCredit"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Note Bancarie
              </label>
              <textarea
                value={formData.bankNotes || ''}
                onChange={(e) => handleInputChange('bankNotes', e.target.value)}
                placeholder="Note aggiuntive sui dati bancari..."
                className="w-full h-20 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                disabled={!isEditing}
              />
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
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
                        <img
                          src={formData.logo}
                          alt="Logo"
                          className="w-full h-full object-cover rounded-xl"
                        />
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
                          <p className="text-xs text-neutral-500 mt-2">Trascina o clicca</p>
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
                      <Button
                        variant="outline"
                        icon={FiIcons.FiUpload}
                        onClick={() => document.getElementById('logo-upload').click()}
                        disabled={uploading}
                      >
                        {uploading ? 'Caricamento...' : 'Carica File'}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-2">
                    Formati supportati: JPG, PNG, SVG. Max 5MB.
                  </p>
                  <p className="text-sm text-neutral-400 mt-1">
                    {isEditing
                      ? 'Trascina un\'immagine o clicca per caricare'
                      : 'Il logo verrà ridimensionato automaticamente.'}
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Colore Primario Brand"
                value={formData.brandPrimaryColor || ''}
                onChange={(e) => handleInputChange('brandPrimaryColor', e.target.value)}
                placeholder="#0ea5e9"
                disabled={!isEditing}
              />
              <Input
                label="Colore Secondario Brand"
                value={formData.brandSecondaryColor || ''}
                onChange={(e) => handleInputChange('brandSecondaryColor', e.target.value)}
                placeholder="#d946ef"
                disabled={!isEditing}
              />
            </div>

            <div>
              <Input
                label="Slogan/Tagline"
                value={formData.tagline || ''}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="Il tuo futuro inizia qui"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Note Branding
              </label>
              <textarea
                value={formData.brandNotes || ''}
                onChange={(e) => handleInputChange('brandNotes', e.target.value)}
                placeholder="Linee guida per il brand, font, colori, etc..."
                className="w-full h-20 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                disabled={!isEditing}
              />
            </div>
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
            Configurazione Azienda
          </h1>
          <p className="text-neutral-600 mt-2">
            Configura tutte le informazioni dell'azienda
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            icon={FiIcons.FiDownload}
            onClick={handleExportData}
          >
            Esporta Dati
          </Button>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                icon={FiIcons.FiRefreshCw}
                onClick={handleReset}
              >
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

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
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

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          {renderTabContent()}
        </Card>
      </motion.div>

      {/* Summary Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Riepilogo Configurazione
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-primary-50 rounded-xl">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiIcons.FiCheck} className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-primary-800">
              {Object.values(formData).filter(v => v && v.toString().trim()).length}
            </p>
            <p className="text-sm text-primary-600">Campi Compilati</p>
          </div>
          <div className="text-center p-4 bg-accent-50 rounded-xl">
            <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiIcons.FiUsers} className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-accent-800">{state.students.length}</p>
            <p className="text-sm text-accent-600">Studenti Totali</p>
          </div>
          <div className="text-center p-4 bg-secondary-50 rounded-xl">
            <div className="w-12 h-12 bg-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiIcons.FiCalendar} className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-secondary-800">
              {formData.foundationDate ? new Date().getFullYear() - new Date(formData.foundationDate).getFullYear() : 'N/A'}
            </p>
            <p className="text-sm text-secondary-600">Anni di Attività</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompanyConfig;