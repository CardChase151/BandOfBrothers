import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ac.teamInspire',
  appName: 'Team Inspire',
  webDir: 'build',
  server: {
    url: 'http://192.168.1.154:3000',
    cleartext: true
  },
  ios: {
    contentInset: 'never',
    allowsLinkPreview: false,
    scrollEnabled: false
  },
  plugins: {
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;