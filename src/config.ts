export const isElectron = () => {
  return window && window.process && window.process.type;
};

export const getBaseUrl = () => {
  if (isElectron()) {
    return './';
  }
  return '/';
};

export const getApiUrl = () => {
  if (isElectron()) {
    return 'http://localhost:5173';
  }
  return window.location.origin;
}; 