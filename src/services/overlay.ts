import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  type EmitterSubscription,
} from 'react-native';

type OverlayNativeModule = {
  addListener: (eventName: string) => void;
  hasPermission: () => Promise<boolean>;
  getBotState: () => Promise<boolean>;
  hideOverlay: () => void;
  openPermissionSettings: () => Promise<void>;
  removeListeners: (count: number) => void;
  setBotState: (isRunning: boolean) => void;
  showOverlay: () => Promise<boolean>;
};

const overlayModule = NativeModules.OverlayModule as OverlayNativeModule | undefined;

const getOverlayModule = () => {
  if (!overlayModule) {
    throw new Error('The Android floating overlay module is not available in this build.');
  }
  return overlayModule;
};

export const hasOverlayPermission = async () => {
  if (Platform.OS !== 'android') return true;
  return getOverlayModule().hasPermission();
};

export const openOverlayPermissionSettings = async () => {
  if (Platform.OS !== 'android') return;
  await getOverlayModule().openPermissionSettings();
};

export const startOverlay = async () => {
  if (Platform.OS !== 'android') return;
  const started = await getOverlayModule().showOverlay();
  if (!started) {
    throw new Error('Derivo could not display its floating control. Check overlay permission and try again.');
  }
};

export const stopOverlay = () => {
  if (Platform.OS === 'android') getOverlayModule().hideOverlay();
};

export const setOverlayBotState = (isRunning: boolean) => {
  if (Platform.OS === 'android') getOverlayModule().setBotState(isRunning);
};

export const getOverlayBotState = async () => {
  if (Platform.OS !== 'android') return false;
  return getOverlayModule().getBotState();
};

export const subscribeToOverlayToggle = (listener: () => void): EmitterSubscription | null => {
  if (Platform.OS !== 'android' || !overlayModule) return null;
  return new NativeEventEmitter(overlayModule).addListener('overlayToggle', listener);
};
