import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.creditoya.space',
  appName: 'CreditoYa',
  webDir: 'mobile-dist',
  server: {
    url: 'https://creditoya-superapp-beta-894489564991.us-central1.run.app/auth',
    cleartext: true
  }
};

export default config;
