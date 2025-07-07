import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../utils/SafeIcon';
import { Card, Button, Input } from '../components/UI';
import MediaGallery from '../components/MediaGallery';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const CompanyConfig = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState(state.company);
  const [isEditing, setIsEditing] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoSelect = (selectedMedia) => {
    handleInputChange('logo', selectedMedia.url);
    toast.success('Logo aggiornato con successo!');
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
            <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-neutral-300 relative overflow-hidden">
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <SafeIcon icon={FiIcons.FiImage} className="w-8 h-8 text-neutral-400" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                icon={FiIcons.FiImage}
                onClick={() => setShowMediaGallery(true)}
                disabled={!isEditing}
              >
                {formData.logo ? 'Cambia Logo' : 'Carica Logo'}
              </Button>
              {formData.logo && isEditing && (
                <Button
                  variant="outline"
                  icon={FiIcons.FiTrash2}
                  onClick={() => handleInputChange('logo', null)}
                >
                  Rimuovi
                </Button>
              )}
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              Formati supportati: JPG, PNG, SVG. Max 5MB.
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              Il logo verrà ridimensionato automaticamente per adattarsi.
            </p>
          </div>
        </div>
      </Card>

      {/* Company Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">
          Informazioni Aziendali
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Ragione Sociale *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Diplomati Online Srl"
            icon={FiIcons.FiBuilding}
            readOnly={!isEditing}
          />
          <Input
            label="Partita IVA"
            value={formData.vatId}
            onChange={(e) => handleInputChange('vatId', e.target.value)}
            placeholder="IT12345678901"
            icon={FiIcons.FiHash}
            readOnly={!isEditing}
          />
          <Input
            label="Codice SDI"
            value={formData.sdiCode}
            onChange={(e) => handleInputChange('sdiCode', e.target.value)}
            placeholder="ABCDEFG"
            icon={FiIcons.FiCode}
            readOnly={!isEditing}
          />
          <Input
            label="Indirizzo"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Via Roma 123"
            icon={FiIcons.FiMapPin}
            readOnly={!isEditing}
          />
          <Input
            label="Città"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Milano"
            icon={FiIcons.FiMap}
            readOnly={!isEditing}
          />
          <Input
            label="Provincia"
            value={formData.province}
            onChange={(e) => handleInputChange('province', e.target.value)}
            placeholder="MI"
            icon={FiIcons.FiMapPin}
            readOnly={!isEditing}
          />
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">
          Informazioni di Contatto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="info@diplomatonline.it"
            icon={FiIcons.FiMail}
            readOnly={!isEditing}
          />
          <Input
            label="PEC"
            type="email"
            value={formData.pec}
            onChange={(e) => handleInputChange('pec', e.target.value)}
            placeholder="pec@diplomatonline.it"
            icon={FiIcons.FiShield}
            readOnly={!isEditing}
          />
          <Input
            label="Telefono"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+39 02 1234567"
            icon={FiIcons.FiPhone}
            readOnly={!isEditing}
          />
          <Input
            label="WhatsApp"
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => handleInputChange('whatsapp', e.target.value)}
            placeholder="+39 320 1234567"
            icon={FiIcons.FiMessageCircle}
            readOnly={!isEditing}
          />
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Note Aggiuntive
        </h3>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Inserisci note aggiuntive sull'azienda..."
          className={`w-full h-32 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
            !isEditing ? 'bg-neutral-50 cursor-not-allowed' : ''
          }`}
          readOnly={!isEditing}
        />
      </Card>

      {/* Company Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">
          Statistiche Aziendali
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-primary-50 rounded-xl"
          >
            <p className="text-2xl font-bold text-primary-600">{state.students.length}</p>
            <p className="text-sm text-neutral-500">Studenti Totali</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-secondary-50 rounded-xl"
          >
            <p className="text-2xl font-bold text-secondary-600">{state.schools.length}</p>
            <p className="text-sm text-neutral-500">Scuole Partner</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-accent-50 rounded-xl"
          >
            <p className="text-2xl font-bold text-accent-600">{state.courses.length}</p>
            <p className="text-sm text-neutral-500">Corsi Attivi</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-orange-50 rounded-xl"
          >
            <p className="text-2xl font-bold text-orange-600">
              {state.students.reduce((sum, s) => sum + s.paidAmount, 0).toLocaleString()}€
            </p>
            <p className="text-sm text-neutral-500">Fatturato Totale</p>
          </motion.div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Azioni Rapide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            icon={FiIcons.FiDownload}
            className="justify-start"
            onClick={handleExportData}
          >
            Esporta Dati Aziendali
          </Button>
          <Button
            variant="outline"
            icon={FiIcons.FiFileText}
            className="justify-start"
            onClick={handleGenerateReport}
          >
            Genera Report Mensile
          </Button>
          <Button
            variant="outline"
            icon={FiIcons.FiSettings}
            className="justify-start"
            onClick={() => toast.info('Configurazioni avanzate in sviluppo!')}
          >
            Configurazioni Avanzate
          </Button>
        </div>
      </Card>

      {/* Media Gallery Modal */}
      <MediaGallery
        isOpen={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
        onSelect={handleLogoSelect}
        allowedTypes={['image/*']}
        title="Seleziona Logo Aziendale"
      />
    </div>
  );
};

export default CompanyConfig;