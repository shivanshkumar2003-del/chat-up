import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const bgColors = {
    success: 'bg-white border-green-500',
    error: 'bg-white border-red-500',
    info: 'bg-white border-blue-500',
  };

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />,
  };

  return (
    <div className={`pointer-events-auto min-w-[300px] max-w-sm w-full shadow-lg rounded-xl border-l-4 p-4 flex items-start gap-3 transform transition-all animate-in slide-in-from-right-full duration-300 ${bgColors[toast.type]}`}>
      <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{toast.message}</p>
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  );
};