'use client';

import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, glass = false, onClick }: CardProps) {
  const baseStyles = 'rounded-2xl p-6';
  const glassStyles = glass
    ? 'glass shadow-glass dark:shadow-glass-dark'
    : 'bg-white dark:bg-dark-800 shadow-lg';
  const hoverStyles = hover ? 'hover-lift cursor-pointer' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
