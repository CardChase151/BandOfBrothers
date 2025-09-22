import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ac.teamInspire',
  appName: 'Team Inspire',
  webDir: 'build',
  server: {
    url: 'https://teaminspire.org',
    allowNavigation: [
      'teaminspire.org',
      '*.teaminspire.org'
    ]
  },
  ios: {
    contentInset: 'never',
    allowsLinkPreview: false,
    scrollEnabled: false,
    scheme: 'teaminspire'
  },
  android: {
    scheme: 'teaminspire'
  },
  plugins: {
    StatusBar: {
      style: 'dark'
    },
    App: {
      appUrlOpen: {
        iosCustomScheme: 'teaminspire'
      }
    }
  }
};

export default config;