import { toast, ToastOptions } from 'react-hot-toast';

// Custom toast options
const defaultOptions: ToastOptions = {
  duration: 4000,
  style: {
    borderRadius: '12px',
    background: '#fff',
    color: '#374151',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    padding: '16px',
    fontSize: '14px',
  },
  position: 'top-right',
};

// Success notification
export const notifySuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...defaultOptions,
    icon: '✅',
    style: {
      ...defaultOptions.style,
      border: '1px solid #10b981',
      background: '#f0fdf4',
    },
    ...options,
  });
};

// Error notification
export const notifyError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    ...defaultOptions,
    icon: '❌',
    duration: 6000, // Longer duration for errors
    style: {
      ...defaultOptions.style,
      border: '1px solid #ef4444',
      background: '#fef2f2',
    },
    ...options,
  });
};

// Warning notification
export const notifyWarning = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...defaultOptions,
    icon: '⚠️',
    style: {
      ...defaultOptions.style,
      border: '1px solid #f59e0b',
      background: '#fffbeb',
    },
    ...options,
  });
};

// Info notification
export const notifyInfo = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...defaultOptions,
    icon: '💡',
    style: {
      ...defaultOptions.style,
      border: '1px solid #3b82f6',
      background: '#eff6ff',
    },
    ...options,
  });
};

// Loading notification
export const notifyLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    ...defaultOptions,
    duration: Infinity, // Don't auto-dismiss loading toasts
    style: {
      ...defaultOptions.style,
      border: '1px solid #6b7280',
      background: '#f9fafb',
    },
    ...options,
  });
};

// Custom notification with action buttons
export const notifyWithAction = (
  message: string, 
  actionText: string, 
  onAction: () => void,
  options?: ToastOptions
) => {
  // Simplified version - just show the message
  return toast(message + ` (${actionText})`, {
    ...defaultOptions,
    icon: 'ℹ️',
    duration: 6000,
    style: {
      ...defaultOptions.style,
      border: '1px solid #3b82f6',
      background: '#eff6ff',
    },
    ...options,
  });
};

// Confirm notification (simplified)
export const notifyConfirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  options?: ToastOptions
) => {
  // Use browser confirm dialog for simplicity
  const result = window.confirm(message);
  if (result) {
    onConfirm();
    notifySuccess('Confirmed');
  } else {
    onCancel && onCancel();
  }
};

// Promise-based notification (shows loading, then success/error)
export const notifyPromise = async <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  },
  options?: ToastOptions
): Promise<T> => {
  return toast.promise(promise, messages, {
    ...defaultOptions,
    style: {
      ...defaultOptions.style,
    },
    success: {
      style: {
        ...defaultOptions.style,
        border: '1px solid #10b981',
        background: '#f0fdf4',
      },
      icon: '✅',
    },
    error: {
      style: {
        ...defaultOptions.style,
        border: '1px solid #ef4444',
        background: '#fef2f2',
      },
      icon: '❌',
    },
    loading: {
      style: {
        ...defaultOptions.style,
        border: '1px solid #6b7280',
        background: '#f9fafb',
      },
    },
    ...options,
  });
};

// Bulk operations notification
export const notifyBulkOperation = (
  total: number,
  success: number,
  failed: number,
  operation: string
) => {
  if (failed === 0) {
    notifySuccess(`Successfully ${operation} ${success} item${success !== 1 ? 's' : ''}`);
  } else if (success === 0) {
    notifyError(`Failed to ${operation} any items`);
  } else {
    notifyWarning(
      `${operation} completed: ${success} successful, ${failed} failed`,
      { duration: 6000 }
    );
  }
};

// Network error notification
export const notifyNetworkError = (error?: any) => {
  const message = error?.response?.status === 0 
    ? 'Network connection lost. Please check your internet connection.'
    : error?.response?.data?.message || 'Something went wrong. Please try again.';
  
  notifyError(message, { duration: 6000 });
};

// Feature not implemented notification
export const notifyFeatureNotImplemented = (featureName?: string) => {
  notifyInfo(
    featureName 
      ? `${featureName} is coming soon!` 
      : 'This feature is coming soon!',
    { duration: 3000 }
  );
};

// Update available notification
export const notifyUpdateAvailable = (onUpdate: () => void) => {
  notifyWithAction(
    'A new version is available!',
    'Update Now',
    onUpdate,
    { duration: 10000 }
  );
};

// Auto-save notification
export const notifyAutoSave = (status: 'saving' | 'saved' | 'error') => {
  switch (status) {
    case 'saving':
      return notifyLoading('Auto-saving...', { duration: 2000 });
    case 'saved':
      return toast.success('Changes saved', {
        duration: 2000,
        style: {
          ...defaultOptions.style,
          fontSize: '12px',
          padding: '8px 12px',
        },
        position: 'bottom-right',
      });
    case 'error':
      return notifyError('Failed to save changes', { 
        duration: 4000,
        position: 'bottom-right',
      });
  }
};

// Keyboard shortcut notification
export const notifyKeyboardShortcut = (shortcut: string, action: string) => {
  toast(`Keyboard shortcut: ${shortcut} - ${action}`, {
    duration: 2000,
    position: 'bottom-center',
    style: {
      ...defaultOptions.style,
      background: '#374151',
      color: '#fff',
      fontSize: '12px',
    },
  });
};

// Export all notification functions for easy import
export default {
  success: notifySuccess,
  error: notifyError,
  warning: notifyWarning,
  info: notifyInfo,
  loading: notifyLoading,
  withAction: notifyWithAction,
  confirm: notifyConfirm,
  promise: notifyPromise,
  bulkOperation: notifyBulkOperation,
  networkError: notifyNetworkError,
  featureNotImplemented: notifyFeatureNotImplemented,
  updateAvailable: notifyUpdateAvailable,
  autoSave: notifyAutoSave,
  keyboardShortcut: notifyKeyboardShortcut,
};
