import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const SubjectExpandModal = ({ course, onClose }) => {
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
        className="bg-white rounded-2xl shadow-strong max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                Materie del Corso
              </h2>
              <p className="text-neutral-600">{course.name}</p>
            </div>
            <Button variant="ghost" icon={FiIcons.FiX} onClick={onClose} />
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-neutral-500 mb-3">
              Totale materie: {course.subjects.length}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {course.subjects.map((subject, index) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800 text-sm">{subject}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {course.subjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiIcons.FiBookOpen className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-neutral-500">Nessuna materia configurata per questo corso</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <Badge variant="primary">
              {course.subjects.length} materie totali
            </Badge>
            <Button onClick={onClose}>
              Chiudi
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubjectExpandModal;