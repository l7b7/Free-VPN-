export type VpnProtocol = 'vmess' | 'vless' | 'ssh' | 'trojan' | 'shadowsocks';
export type DurationDays = 1 | 3 | 7;

export interface VpnConfig {
  id: string;
  userId: string;
  userName?: string;
  protocol: VpnProtocol;
  durationDays: DurationDays;
  serverLocation: string;
  serverHost: string;
  port: number;
  configUrl: string; // e.g. vmess://... or vless://... or ssh://...
  rawPayload?: string; // payload for HTTP Custom / SSH
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  downloadsCount: number;
}

export interface SubscriptionCheckResult {
  isSubscribed: boolean;
  status: 'creator' | 'administrator' | 'member' | 'left' | 'kicked' | 'simulated' | 'unknown';
  userId: string;
  channelUsername: string;
  message?: string;
  checkedAt: string;
}

export interface BotSettings {
  botToken: string;
  botUsername: string; // e.g. @FRE0BOT
  channelUsername: string; // e.g. @FR7l7
  channelUrl: string; // e.g. https://t.me/FR7l7
  webhookUrl: string;
  isWebhookActive: boolean;
  rateLimitPerMinute: number;
  autoCheckSubOnStart: boolean;
  customWelcomeMessage: string;
}

export interface BotStats {
  totalConfigsGenerated: number;
  activeConfigsCount: number;
  configsByDuration: {
    1: number;
    3: number;
    7: number;
  };
  configsByProtocol: Record<VpnProtocol, number>;
  totalUsersChecked: number;
  subscribedUsersCount: number;
  uptimeSeconds: number;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  is_bot?: boolean;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  first_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  inlineKeyboard?: Array<Array<{ text: string; callback_data?: string; url?: string }>>;
  configDetails?: VpnConfig;
}
