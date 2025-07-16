import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Button from './ui/Button';

const toolbarButtons = [
  { command: 'bold', icon: FiIcons.FiBold, title: 'Grassetto' },
  { command: 'italic', icon: FiIcons.FiItalic, title: 'Corsivo' },
  { command: 'underline', icon: FiIcons.FiUnderline, title: 'Sottolineato' },
  { command: 'separator' },
  { command: 'justifyLeft', icon: FiIcons.FiAlignLeft, title: 'Allinea a sinistra' },
  { command: 'justifyCenter', icon: FiIcons.FiAlignCenter, title: 'Centra' },
  { command: 'justifyRight', icon: FiIcons.FiAlignRight, title: 'Allinea a destra' },
  { command: 'separator' },
  { command: 'insertUnorderedList', icon: FiIcons.FiList, title: 'Elenco puntato' },
  { command: 'insertOrderedList', icon: FiIcons.FiHash, title: 'Elenco numerato' },
  { command: 'separator' },
  { command: 'createLink', icon: FiIcons.FiLink, title: 'Inserisci link', needsInput: true },
  { command: 'unlink', icon: FiIcons.FiSlash, title: 'Rimuovi link' }, // Changed from FiLinkOff to FiSlash
];

const HTMLEditor = ({ value, onChange, variables = [], placeholder }) => {
  const [html, setHtml] = useState(value || '');
  const [showVariableDropdown, setShowVariableDropdown] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    setHtml(value || '');
  }, [value]);

  const handleChange = (e) => {
    setHtml(e.target.innerHTML);
    onChange(e.target.innerHTML);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtml(html);
      onChange(html);
    }
  };

  const handleToolbarAction = (button) => {
    if (button.command === 'separator') return;
    
    if (button.needsInput) {
      if (button.command === 'createLink') {
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          execCommand(button.command, url);
        }
      }
    } else {
      execCommand(button.command);
    }
    
    editorRef.current.focus();
  };

  const insertVariable = (variable) => {
    execCommand('insertHTML', variable.key);
    setShowVariableDropdown(false);
    editorRef.current.focus();
  };

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-neutral-50 border-b border-neutral-200 p-2 flex flex-wrap items-center gap-1">
        {toolbarButtons.map((button, index) => 
          button.command === 'separator' ? (
            <div key={`sep-${index}`} className="h-6 border-r border-neutral-200 mx-1" />
          ) : (
            <button
              key={button.command}
              type="button"
              onClick={() => handleToolbarAction(button)}
              className="p-2 rounded hover:bg-neutral-200 transition-colors"
              title={button.title}
            >
              <SafeIcon icon={button.icon} className="w-4 h-4" />
            </button>
          )
        )}
        
        {/* Variables dropdown */}
        {variables.length > 0 && (
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setShowVariableDropdown(!showVariableDropdown)}
              className="p-2 rounded hover:bg-neutral-200 transition-colors"
            >
              <SafeIcon icon={FiIcons.FiCode} className="w-4 h-4" />
              <span className="ml-1 text-xs">Variabili</span>
            </button>
            
            {showVariableDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-2 border-b border-neutral-200">
                  <p className="text-xs text-neutral-500">Inserisci variabile</p>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {variables.map((variable) => (
                    <button
                      key={variable.key}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-sm"
                      onClick={() => insertVariable(variable)}
                    >
                      <span className="font-mono text-primary-600">{variable.key}</span>
                      <span className="text-xs text-neutral-500 ml-2">{variable.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-36 max-h-96 overflow-y-auto p-4 focus:outline-none"
        dangerouslySetInnerHTML={{ __html: html }}
        onInput={(e) => handleChange(e.target)}
        onBlur={() => onChange(html)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default HTMLEditor;