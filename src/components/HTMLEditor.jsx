import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../utils/SafeIcon';
import { Button } from './UI';

const HTMLEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Inserisci contenuto...', 
  variables = [],
  showToolbar = true,
  className = ''
}) => {
  const [content, setContent] = useState(value);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleContentChange = () => {
    let newContent;
    if (isHtmlMode) {
      newContent = textareaRef.current?.value || '';
    } else {
      newContent = editorRef.current?.innerHTML || '';
    }
    setContent(newContent);
    onChange?.(newContent);
  };

  const insertVariable = (variable) => {
    if (isHtmlMode) {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + variable.key + content.substring(end);
        setContent(newContent);
        onChange?.(newContent);
        
        // Restore cursor position
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + variable.key.length;
          textarea.focus();
        }, 0);
      }
    } else {
      execCommand('insertText', variable.key);
    }
  };

  const toggleMode = () => {
    if (isHtmlMode) {
      // Switching from HTML to visual
      setContent(textareaRef.current?.value || '');
    } else {
      // Switching from visual to HTML
      setContent(editorRef.current?.innerHTML || '');
    }
    setIsHtmlMode(!isHtmlMode);
  };

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
    { command: 'unlink', icon: FiIcons.FiLinkOff, title: 'Rimuovi link' },
  ];

  const handleToolbarClick = (button) => {
    if (button.needsInput) {
      const url = prompt('Inserisci URL:');
      if (url) {
        execCommand(button.command, url);
      }
    } else {
      execCommand(button.command);
    }
  };

  return (
    <div className={`border border-neutral-200 rounded-xl overflow-hidden ${className}`}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="bg-neutral-50 border-b border-neutral-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {toolbarButtons.map((button, index) => {
                if (button.command === 'separator') {
                  return <div key={index} className="w-px h-6 bg-neutral-300 mx-2" />;
                }
                
                return (
                  <motion.button
                    key={button.command}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToolbarClick(button)}
                    className="p-2 rounded-lg hover:bg-neutral-200 transition-colors"
                    title={button.title}
                  >
                    <SafeIcon icon={button.icon} className="w-4 h-4 text-neutral-600" />
                  </motion.button>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleMode}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  isHtmlMode 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                {isHtmlMode ? 'HTML' : 'Visual'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex">
        {/* Main Editor */}
        <div className="flex-1">
          {isHtmlMode ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                onChange?.(e.target.value);
              }}
              placeholder={placeholder}
              className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none"
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable
              dangerouslySetInnerHTML={{ __html: content }}
              onInput={handleContentChange}
              className="w-full h-96 p-4 focus:outline-none overflow-y-auto"
              style={{ minHeight: '24rem' }}
            />
          )}
        </div>

        {/* Variables Sidebar */}
        {variables.length > 0 && (
          <div className="w-64 border-l border-neutral-200 bg-neutral-50">
            <div className="p-4">
              <h4 className="font-medium text-neutral-800 mb-3">Variabili</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {variables.map((variable) => (
                  <motion.button
                    key={variable.key}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => insertVariable(variable)}
                    className="w-full text-left p-3 text-sm bg-white hover:bg-primary-50 rounded-lg transition-colors border border-neutral-200"
                  >
                    <code className="font-mono font-medium text-primary-600">
                      {variable.key}
                    </code>
                    <p className="text-neutral-600 text-xs mt-1">{variable.label}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HTMLEditor;