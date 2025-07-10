import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { Card, Button, Input, Badge } from '../components/UI';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const LearningPaths = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPath, setShowAddPath] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);

  const [learningPaths] = useState([
    {
      id: 1,
      name: 'Diploma Scientifico',
      description: 'Percorso completo per il recupero anni scolastici del liceo scientifico',
      duration: '12-24 months',
      subjects: ['Matematica', 'Fisica', 'Scienze', 'Italiano', 'Latino'],
      requirements: ['Licenza Media', 'Età minima 16 anni'],
      milestones: [
        { id: 1, name: 'Fondamenti', duration: '3 months' },
        { id: 2, name: 'Consolidamento', duration: '6 months' },
        { id: 3, name: 'Preparazione Esami', duration: '3 months' }
      ],
      status: 'active'
    }
  ]);

  const filteredPaths = learningPaths.filter(path =>
    path.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    path.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Percorsi Formativi
          </h1>
          <p className="text-neutral-600 mt-2">
            Gestisci i percorsi di studio e le progressioni degli studenti
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button variant="outline" icon={FiIcons.FiDownload}>
            Esporta
          </Button>
          <Button icon={FiIcons.FiPlus} onClick={() => setShowAddPath(true)}>
            Nuovo Percorso
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-6">
        <Input
          placeholder="Cerca percorsi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FiIcons.FiSearch}
          className="max-w-md"
        />
      </Card>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPaths.map((path) => (
          <Card key={path.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <SafeIcon icon={FiIcons.FiBookOpen} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800">{path.name}</h3>
                  <p className="text-sm text-neutral-500">{path.duration}</p>
                </div>
              </div>
              <Badge variant="primary">
                {path.status === 'active' ? 'Attivo' : 'Inattivo'}
              </Badge>
            </div>

            <p className="text-neutral-600 text-sm mb-4">
              {path.description}
            </p>

            <div className="space-y-4">
              {/* Subjects */}
              <div>
                <p className="text-xs text-neutral-500 mb-2">Materie:</p>
                <div className="flex flex-wrap gap-2">
                  {path.subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <p className="text-xs text-neutral-500 mb-2">Milestone:</p>
                <div className="space-y-2">
                  {path.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg text-sm"
                    >
                      <span className="font-medium text-neutral-700">
                        {milestone.name}
                      </span>
                      <span className="text-neutral-500">
                        {milestone.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
              <Button
                variant="ghost"
                size="sm"
                icon={FiIcons.FiUsers}
                onClick={() => toast.info('Funzionalità in sviluppo')}
              >
                Studenti
              </Button>
              <Button
                size="sm"
                icon={FiIcons.FiEdit}
                onClick={() => {
                  setSelectedPath(path);
                  setShowAddPath(true);
                }}
              >
                Modifica
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPaths.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiIcons.FiBookOpen} className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Nessun percorso trovato
          </h3>
          <p className="text-neutral-500 mb-6">
            Non ci sono percorsi formativi che corrispondono ai criteri di ricerca.
          </p>
          <Button icon={FiIcons.FiPlus} onClick={() => setShowAddPath(true)}>
            Aggiungi Primo Percorso
          </Button>
        </Card>
      )}

      {/* Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-neutral-800">
              {learningPaths.length}
            </p>
            <p className="text-sm text-neutral-500">Percorsi Totali</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-600">
              {learningPaths.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-neutral-500">Percorsi Attivi</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {state.students.length}
            </p>
            <p className="text-sm text-neutral-500">Studenti Iscritti</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-600">
              {learningPaths.reduce((acc, path) => acc + path.subjects.length, 0)}
            </p>
            <p className="text-sm text-neutral-500">Materie Totali</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LearningPaths;