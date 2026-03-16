import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Route SDK traffic to Base44 backend URL in deployed environments.
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: appBaseUrl || '',
  requiresAuth: false,
  appBaseUrl
});
