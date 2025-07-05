import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SafeIcon from '../../common/SafeIcon';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ExamTemplateModal = ({ school, onClose, onTemplateSaved }) => {
  const { state } = useApp();
  const [templateData, setTemplateData] = useState({
    name: `Template Esami - ${school.name}`,
    content: `
RICHIESTA ISCRIZIONE ESAME

Spett.le ${school.name}
${school.address}

Con la presente si richiede l'iscrizione all'esame di idoneità/maturità per lo studente:

DATI STUDENTE:
Nome: {{firstName}}
Cognome: {{lastName}}
Codice Fiscale: {{codiceFiscale}}
Data di Nascita: {{birthDate}}
Luogo di Nascita: {{birthPlace}}
Residenza: {{address}}, {{city}} ({{province}}) {{cap}}

CORSO DI STUDI:
Indirizzo: {{course}}
Classe di destinazione: {{targetClass}}
Anno Scolastico: {{academicYear}}

MATERIE D'ESAME:
{{subjects}}

DOCUMENTI ALLEGATI:
- Carta d'identità dello studente
- Codice fiscale
- Pagelle precedenti
- Certificato di nascita

Si prega di comunicare:
- Data e ora dell'esame
- Eventuale documentazione aggiuntiva richiesta
- Modalità di pagamento tassa d'esame

Cordiali saluti,

Diplomati Online Srl
P.IVA: IT12345678901
Email: info@diplomatonline.it
Telefono: +39 02 1234567

Data: {{currentDate}}
Firma: ____________________
    `,
    variables: [
      { key: '{{firstName}}', label: 'Nome Studente' },
      { key: '{{lastName}}', label: 'Cognome Studente' },
      { key: '{{codiceFiscale}}', label: 'Codice Fiscale' },
      { key: '{{birthDate}}', label: 'Data di Nascita' },
      { key: '{{birthPlace}}', label: 'Luogo di Nascita' },
      { key: '{{address}}', label: 'Indirizzo' },
      { key: '{{city}}', label: 'Città' },
      { key: '{{province}}', label: 'Provincia' },
      { key: '{{cap}}', label: 'CAP' },
      { key: '{{course}}', label: 'Corso di Studi' },
      { key: '{{targetClass}}', label: 'Classe di Destinazione' },
      { key: '{{academicYear}}', label: 'Anno Scolastico' },
      { key: '{{subjects}}', label: 'Materie d\'Esame' },
      { key: '{{currentDate}}', label: 'Data Corrente' }
    ]
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!templateData.name.trim() || !templateData.content.trim()) {
      toast.error('Inserisci nome e contenuto del template');
      return;
    }

    setSaving(true);
    try {
      const template = {
        id: Date.now(),
        schoolId: school.id,
        name: templateData.name,
        content: templateData.content,
        variables: templateData.variables,
        type: 'exam_request',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // In a real app, this would be saved to the database
      if (onTemplateSaved) {
        onTemplateSaved(template);
      }

      toast.success('Template salvato con successo!');
      onClose();
    } catch (error) {
      toast.error('Errore durante il salvataggio del template');
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.querySelector('textarea[name="content"]');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = templateData.content.substring(0, start) + 
                        variable.key + 
                        templateData.content.substring(end);
      setTemplateData(prev => ({ ...prev, content: newContent }));
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
        className="bg-white rounded-2xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                Crea Template Esami
              </h2>
              <p className="text-neutral-600">{school.name}</p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Input
            label="Nome Template"
            value={templateData.name}
            onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome del template"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Editor */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Contenuto Template
              </label>
              <textarea
                name="content"
                value={templateData.content}
                onChange={(e) => setTemplateData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Inserisci il contenuto del template..."
                className="w-full h-96 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
              />
            </div>

            {/* Variables Panel */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-neutral-800 mb-3">Variabili Disponibili</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {templateData.variables.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => insertVariable(variable)}
                      className="w-full text-left p-3 text-sm bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200"
                    >
                      <code className="font-mono font-medium text-primary-600">
                        {variable.key}
                      </code>
                      <p className="text-neutral-600 text-xs mt-1">{variable.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* School Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h5 className="font-medium text-blue-800 mb-2">Info Scuola</h5>
                <div className="space-y-1 text-sm text-blue-700">
                  <p><strong>Nome:</strong> {school.name}</p>
                  <p><strong>Indirizzo:</strong> {school.address}</p>
                  <p><strong>Email:</strong> {school.email}</p>
                  <p><strong>Telefono:</strong> {school.phone}</p>
                  <p><strong>Referente:</strong> {school.contact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <h4 className="font-medium text-neutral-800 mb-3">Anteprima Template</h4>
            <div className="bg-white rounded-lg p-4 border border-neutral-200 max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-neutral-700 font-mono">
                {templateData.content}
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiIcons.FiInfo} className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Come utilizzare il template</p>
                <ul className="text-sm text-orange-700 mt-2 space-y-1">
                  <li>• Clicca sulle variabili per inserirle nel testo</li>
                  <li>• Le variabili verranno sostituite automaticamente con i dati dello studente</li>
                  <li>• Puoi modificare il testo liberamente mantenendo le variabili</li>
                  <li>• Il template sarà utilizzabile per tutti gli studenti di questa scuola</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              icon={FiIcons.FiSave} 
              onClick={handleSave}
              loading={saving}
            >
              Salva Template
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExamTemplateModal;