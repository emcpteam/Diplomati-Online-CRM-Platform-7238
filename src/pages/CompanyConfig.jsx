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
  const [formData, setFormData] = useState(state.company);
  const [isEditing, setIsEditing] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleMediaSelect = (selectedMedia) => {
    handleInputChange('logo', selectedMedia.url);
    toast.success('Logo aggiornato con successo!');
    setShowMediaGallery(false);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Il nome dell\'azienda è obbligatorio');
      return;
    }

    dispatch({
      type: 'SET_COMPANY',
      payload: formData
    });
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

  const handleGenerateReport = () => {
    toast.loading('Generazione report in corso...', { id: 'report' });
    setTimeout(() => {
      const reportData = {
        period: new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
        students: {
          total: state.students.length,
          active: state.students.filter(s => s.status === 'active').length,
          new: state.students.filter(s => {
            const enrollmentDate = new Date(s.enrollmentDate);
            const thisMonth = new Date();
            return enrollmentDate.getMonth() === thisMonth.getMonth() && 
                   enrollmentDate.getFullYear() === thisMonth.getFullYear();
          }).length
        },
        revenue: {
          total: state.students.reduce((sum, s) => sum + s.paidAmount, 0),
          pending: state.students.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0)
        },
        courses: state.courses.map(course => ({
          name: course.name,
          enrollments: state.students.filter(s => s.course === course.name).length
        }))
      };

      const reportContent = `
REPORT MENSILE - ${reportData.period}

STUDENTI:
- Totali: ${reportData.students.total}
- Attivi: ${reportData.students.active}
- Nuovi questo mese: ${reportData.students.new}

FATTURATO:
- Incassato: €${reportData.revenue.total.toLocaleString()}
- In sospeso: €${reportData.revenue.pending.toLocaleString()}

CORSI PIÙ RICHIESTI:
${reportData.courses.map(c => `- ${c.name}: ${c.enrollments} iscrizioni`).join('\n')}

Generato il: ${new Date().toLocaleDateString('it-IT')}
`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-mensile-${new Date().getMonth() + 1}-${new Date().getFullYear()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Report mensile generato con successo!', { id: 'report' });
    }, 2000);
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
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Logo Aziendale
        </h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div 
              className={`w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center border-2 ${isEditing ? 'border-dashed border-primary-300 hover:border-primary-500' : 'border-neutral-200'} relative overflow-hidden transition-colors`}
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

      {/* Rest of the component remains the same... */}
      
      {/* Media Gallery Modal */}
      <MediaGallery
        isOpen={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
        onSelect={handleMediaSelect}
        allowedTypes={['image/*']}
        title="Seleziona Logo Aziendale"
      />
    </div>
  );
};

export default CompanyConfig;