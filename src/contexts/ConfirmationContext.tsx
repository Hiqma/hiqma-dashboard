'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(options);
      setResolver(() => resolve);
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    resolver?.(true);
    setIsOpen(false);
    setResolver(null);
  };

  const handleCancel = () => {
    resolver?.(false);
    setIsOpen(false);
    setResolver(null);
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <ConfirmationModal
          options={options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmationContext.Provider>
  );
}

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within ConfirmationProvider');
  }
  return context;
};

// Modal component
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ConfirmationModalProps {
  options: ConfirmationOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationModal({ options, onConfirm, onCancel }: ConfirmationModalProps) {
  const { title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' } = options;

  const typeConfig = {
    danger: {
      icon: ExclamationTriangleIcon,
      iconClass: 'text-red-600 dark:text-red-400',
      confirmClass: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconClass: 'text-yellow-600 dark:text-yellow-400',
      confirmClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    info: {
      icon: InformationCircleIcon,
      iconClass: 'text-blue-600 dark:text-blue-400',
      confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative glass rounded-xl p-6 w-full max-w-md shadow-xl"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${config.iconClass}`} />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${config.confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}