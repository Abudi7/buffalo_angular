import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abud.timetrac',
  appName: 'timetrac-frontend',
  webDir: 'www',
  server: {
    cleartext: true,
    allowNavigation: [
      'http://127.0.0.1:8087',
      'http://localhost:8087'
    ]
  }
};

export default config;
