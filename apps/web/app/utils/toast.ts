type ToastType = 'success' | 'error' | 'warn' | 'info';

export const toast = {
  show: (message: string, type: ToastType) => {
    window.dispatchEvent(new CustomEvent('drazy-toast', { detail: { message, type } }));
  },
  success: (msg: string) => toast.show(msg, 'success'),
  error: (msg: string) => toast.show(msg, 'error'),
  warn: (msg: string) => toast.show(msg, 'warn'),
  info: (msg: string) => toast.show(msg, 'info'),
};