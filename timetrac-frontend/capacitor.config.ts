import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
const config: CapacitorConfig = {
  appId: 'com.abud.timetrac',
  appName: 'timetrac-frontend',
  webDir: 'www',
  server: {
    cleartext: true,
    allowNavigation: [
      'http://127.0.0.1:8087',
      'http://192.168.1.180:8087',
      'http://localhost:8087'
    ]
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.None,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: false,
    },
  },
};

export default config;
