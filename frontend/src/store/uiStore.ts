import { create } from 'zustand';

interface UIState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  
  // Modals
  modalVisible: boolean;
  modalContent: React.ReactNode | null;
  showModal: (content: React.ReactNode) => void;
  hideModal: () => void;
  
  // Toast/Notification
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Theme
  theme: 'light',
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  setTheme: (theme) => set({ theme }),
  
  // Loading
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  
  // Modals
  modalVisible: false,
  modalContent: null,
  showModal: (content) => set({ modalVisible: true, modalContent: content }),
  hideModal: () => set({ modalVisible: false, modalContent: null }),
  
  // Toast
  toast: null,
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
}));