

import React, { useEffect } from 'react';
import { Check, AlertTriangle, X } from './icons';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const config = {
    success: {
      icon: <Check size={20} />,
      bgColor: 'bg-emerald-500',
      textColor: 'text-white',
    },
    error: {
      icon: <AlertTriangle size={20} />,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
    },
    warning: {
      icon: <AlertTriangle size={20} />,
      bgColor: 'bg-amber-500',
      textColor: 'text-white',
    },
  };

  const { icon, bgColor, textColor } = config[type];

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg ${bgColor} ${textColor} animate-slide-in-right`}>
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button onClick={onClose} className="ml-auto -mr-1.5 -my-1.5 p-1.5 rounded-md inline-flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50">
        <span className="sr-only">Close</span>
        <X size={20} />
      </button>
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Toast;