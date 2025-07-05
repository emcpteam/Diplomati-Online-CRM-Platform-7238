import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)' } : {}}
      transition={{ duration: 0.2 }}
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft border border-neutral-200/50 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;