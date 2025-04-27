
import { useState, useEffect } from 'react';
import { Settings } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { toast } from 'sonner';

const DEFAULT_SETTINGS: Settings = {
  kwRate: 0.6,
  companyName: 'عياش جروب',
  systemName: 'نظام إدارة فواتير الكهرباء',
  logo: undefined
};

export const useSettings = () => {
  const { saveToStorage, loadFromStorage } = useLocalStorage();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        if (window.api) {
          // In Electron environment
          const electronSettings = await window.api.getSettings();
          setSettings(electronSettings || DEFAULT_SETTINGS);
        } else {
          // In browser environment (fallback)
          const storedSettings = loadFromStorage<Settings>('settings', DEFAULT_SETTINGS);
          setSettings(storedSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('حدث خطأ أثناء تحميل الإعدادات');
        // Fallback to localStorage
        const storedSettings = loadFromStorage<Settings>('settings', DEFAULT_SETTINGS);
        setSettings(storedSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoading && !window.api) {
      // Save to localStorage only in browser environment
      saveToStorage('settings', settings);
    }
  }, [settings, isLoading]);

  const updateSettings = async (newSettings: Settings) => {
    try {
      if (window.api) {
        await window.api.updateSettings(newSettings);
      }
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('حدث خطأ أثناء تحديث الإعدادات');
    }
  };

  return {
    settings,
    updateSettings,
    isLoading
  };
};
