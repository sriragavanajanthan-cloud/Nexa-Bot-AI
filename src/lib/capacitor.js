// This file only loads Capacitor on mobile devices
let CapacitorApp = null;
let isCapacitorAvailable = false;

export const initCapacitor = async () => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isMobile) {
    try {
      const { App } = await import('@capacitor/app');
      CapacitorApp = App;
      isCapacitorAvailable = true;
      console.log('Capacitor initialized on mobile');
    } catch (err) {
      console.log('Capacitor not available:', err);
    }
  }
  return { CapacitorApp, isCapacitorAvailable };
};

export const addDeepLinkListener = (callback) => {
  if (CapacitorApp) {
    CapacitorApp.addListener('appUrlOpen', callback);
  }
};
