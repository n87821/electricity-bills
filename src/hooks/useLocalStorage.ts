
export function useLocalStorage() {
  const saveToStorage = <T>(key: string, data: T): void => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    const storedData = localStorage.getItem(key);
    if (!storedData) return defaultValue;
    
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error(`Error parsing stored ${key}:`, e);
      return defaultValue;
    }
  };

  return {
    saveToStorage,
    loadFromStorage
  };
}
