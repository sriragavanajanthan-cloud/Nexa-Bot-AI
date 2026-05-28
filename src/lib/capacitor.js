// Only load Capacitor if it's actually available
let CapacitorApp = null;
let isCapacitorAvailable = false;

export const initCapacitor = async () => {
  // Check if we're in a real Capacitor environment
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform) {
    try {
      const { App } = await import('@capacitor/app');
      CapacitorApp = App;
      isCapacitorAvailable = true;
      console.log('Capacitor initialized on native platform');
    } catch (err) {
      console.log('Failed to load Capacitor:', err);
    }
  } else {
    console.log('Not a Capacitor native platform - skipping');
  }
  return { CapacitorApp, isCapacitorAvailable };
};

export const addDeepLinkListener = (callback) => {
  if (CapacitorApp) {
    CapacitorApp.addListener('appUrlOpen', callback);
  }
};
