import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const version = '1.2.0';
  const buildDate = new Date().toLocaleDateString('it-IT');

  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-neutral-200/50 px-6 py-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0"
      >
        <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4">
          <p className="text-sm text-neutral-600">
            © {currentYear} Diplomati Online - Powered by{' '}
            <span className="font-medium text-primary-600">Copilots Srl</span>
          </p>
          <div className="flex items-center space-x-2 text-xs text-neutral-500">
            <span>P.IVA: IT12345678901</span>
            <span>•</span>
            <span>SDI: ABCDEFG</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 text-neutral-500">
            <span>Sviluppato da Emanuele Marchiori</span>
            <span>•</span>
            <span className="font-medium text-primary-600">v{version}</span>
            <span>•</span>
            <span>{buildDate}</span>
          </div>
          
          {/* Environment Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-accent-600 font-medium">PROD</span>
          </div>
        </div>
      </motion.div>
      
      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-2 pt-2 border-t border-neutral-200/50"
      >
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center space-x-4">
            <span>Sistema CRM completo per la gestione studenti</span>
            <span>•</span>
            <span>Database: PostgreSQL</span>
            <span>•</span>
            <span>Framework: React + Vite</span>
          </div>
          
          <div className="flex items-center space-x-2 mt-1 md:mt-0">
            <span>Build: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            <span>•</span>
            <span>Node: 18.x</span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;