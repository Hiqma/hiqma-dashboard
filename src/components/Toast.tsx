'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useToast, Toast as ToastType } from '@/contexts/ToastContext';
import { ComponentType } from 'react';

const toastConfig: Record<string, {
  icon: ComponentType<{ className?: string }>;
  bgClass: string;
  iconClass: string;
  titleClass: string;
  messageClass: string;
}> = {
  success: {
    icon: CheckCircleIcon,
    bgClass: 'bg-green-100 border-green-300 shadow-lg',
    iconClass: 'text-green-700',
    titleClass: 'text-green-900',
    messageClass: 'text-green-800'
  },
  error: {
    icon: XCircleIcon,
    bgClass: 'bg-red-100 border-red-300 shadow-lg',
    iconClass: 'text-red-700',
    titleClass: 'text-red-900',
    messageClass: 'text-red-800'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgClass: 'bg-yellow-100 border-yellow-300 shadow-lg',
    iconClass: 'text-yellow-700',
    titleClass: 'text-yellow-900',
    messageClass: 'text-yellow-800'
  }
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast();
  const config = toastConfig[toast.type] || toastConfig.error;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative p-4 rounded-xl backdrop-blur-md border shadow-lg
        ${config.bgClass}
        max-w-sm w-full
      `}
    >
      <div className="flex items-start">
        <Icon className={`h-5 w-5 mt-0.5 mr-3 ${config.iconClass}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.titleClass}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className={`text-sm mt-1 ${config.messageClass}`}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className={`ml-3 p-1 rounded-md hover:bg-black/10 ${config.iconClass}`}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}