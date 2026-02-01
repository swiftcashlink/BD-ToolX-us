export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  BANNED = 'BANNED'
}

export enum ContentStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  POSTED = 'POSTED'
}

export interface Account {
  id: string;
  setup: string;
  platform: string;
  profileName: string;
  userId: string;
  email: string;
  password?: string;
  apiKey?: string;
  proxy?: string;
  status: AccountStatus;
  createdAt: string;
  lastPostAt: string;
  score: number;
  notes?: string;
}

export interface ContentItem {
  id: string;
  text: string;
  platform: string;
  scheduledTime: string;
  status: ContentStatus;
}

export interface AffiliateLink {
  id: string;
  network: string;
  product: string;
  link: string;
  shortLink?: string;
  clicks: number;
  revenue: number;
}

export interface Proxy {
  id: string;
  ipPort: string;
  status: 'ONLINE' | 'OFFLINE';
}

export interface WebhookConfig {
  makeWebhookUrl: string;
  webhookSecret: string;
  autoSendEvents: boolean;
  eventsToSend: string[]; // ['link_created', 'task_completed', 'payout_received']
}

export interface WebhookEvent {
  id: string;
  eventType: string;
  payload: any;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
}

export interface UserSettings {
  id: string;
  webhook: WebhookConfig;
  notifications: {
    email: string;
    telegramBotToken?: string;
  };
  preferences: {
    autoShorten: boolean;
    defaultShortener: string; // 'ouo' | 'shrinkme' | 'clicksfly'
    enableAnalytics: boolean;
  };
}

export interface Settings {
  telegramToken: string;
  telegramChatId: string;
  adminEmail: string;
  backupTime: string;
  gaAccountId?: string;
  gaMeasurementId?: string;
  gaPropertyId?: string;
  gaStreamId?: string;
  gaApiSecret?: string;
  gscSiteUrl?: string;
  gscApiKey?: string;
  linkedEmail?: string;
  bitlyAccessToken?: string;
  bitlyGroupGuid?: string;
  serviceAccountJson?: string;
  // API Keys
  ouoApiKey?: string;
  shrinkMeApiKey?: string;
  clicksFlyApiKey?: string;
  fclcApiKey?: string;
  gplinksApiKey?: string;
  oiiApiKey?: string;
  cutyApiKey?: string;
  upfilesApiKey?: string;
  uploadyApiKey?: string;
  // Make.com Webhook
  makeWebhookUrl: string;
  webhookSecret: string;
  autoSendEvents: boolean;
  eventsToSend: string[];
}