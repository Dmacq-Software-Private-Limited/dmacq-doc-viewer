import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import TickIcon from '../../assets/icons/tick.svg';
import CloseIcon from '../../assets/icons/CloseFilled.svg';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, onClose }) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
      transition={{
        type: 'spring',
        stiffness: 28.8,
        damping: 12,
        mass: 1,
      }}
      style={{
        position: 'absolute',
        left: '40px',
        bottom: '40px',
        width: '389px',
        height: '48px',
        backgroundColor: '#D4EED4',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        display: 'flex',
        alignItems: 'center',
        padding: '0px 8px',
        zIndex: 100,
        gap: '8px',
        flex: '1 0 0',
      }}
    >
      <img src={TickIcon} alt="Success" className="w-6 h-6" />
      <span
        style={{
          flexGrow: 1,
          color: 'var(--flow-primary-primary-700, #136449)',
          fontFeatureSettings: "'liga' off, 'clig' off",
          fontFamily: '"Noto Sans"',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: 'normal',
        }}
      >
        {message}
      </span>
      <button onClick={onClose}>
        <img
          src={CloseIcon}
          alt="Close"
          className="w-6 h-6"
        />
      </button>
    </motion.div>
  );
};

export default SuccessToast;
