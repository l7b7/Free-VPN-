import fs from 'fs';
import path from 'path';
import {
  BotSettings,
  BotStats,
  SubscriptionCheckResult,
  TelegramUpdate,
  TelegramUser,
  VpnConfig,
  VpnProtocol,
  DurationDays,
} from '../../src/types';
import { createVpnConfig, formatConfigMessage } from './vpnGenerator';

const SETTINGS_FILE = path.join(process.cwd(), 'data_settings.json');
const CONFIGS_FILE = path.join(process.cwd(), 'data_configs.json');

// Ensure data folder/files exist
function loadSettings(): BotSettings {
  const defaultSettings: BotSettings = {
    botToken: process.env.BOT_TOKEN || '',
    botUsername: '@FRE0BOT',
    channelUsername: '@FR7l7',
    channelUrl: 'https://t.me/FR7l7',
    webhookUrl: process.env.APP_URL ? `${process.env.APP_URL}/api/telegram/webhook` : '',
    isWebhookActive: false,
    rateLimitPerMinute: 30,
    autoCheckSubOnStart: true,
    customWelcomeMessage: 'Welcome to @FRE0BOT! Get your free 1 to 7 day VPN, SSH, and V2Ray configs.',
  };

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return defaultSettings;
}

export function saveSettings(settings: Partial<BotSettings>): BotSettings {
  const current = loadSettings();
  const updated = { ...current, ...settings };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving settings file:', err);
  }
  return updated;
}

export function loadConfigs(): VpnConfig[] {
  try {
    if (fs.existsSync(CONFIGS_FILE)) {
      const data = fs.readFileSync(CONFIGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading configs file:', err);
  }
  return [];
}

export function saveConfig(config: VpnConfig): VpnConfig {
  const current = loadConfigs();
  const updated = [config, ...current];
  try {
    fs.writeFileSync(CONFIGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving config file:', err);
  }
  return config;
}

export class TelegramBotService {
  private startTime = Date.now();
  private userSubCache: Map<string, { isSubscribed: boolean; timestamp: number }> = new Map();

  getSettings(): BotSettings {
    return loadSettings();
  }

  updateSettings(newSettings: Partial<BotSettings>): BotSettings {
    return saveSettings(newSettings);
  }

  getStats(): BotStats {
    const configs = loadConfigs();
    const now = new Date().getTime();

    const activeConfigs = configs.filter((c) => new Date(c.expiresAt).getTime() > now);

    const configsByDuration = {
      1: configs.filter((c) => c.durationDays === 1).length,
      3: configs.filter((c) => c.durationDays === 3).length,
      7: configs.filter((c) => c.durationDays === 7).length,
    };

    const configsByProtocol: Record<VpnProtocol, number> = {
      vmess: configs.filter((c) => c.protocol === 'vmess').length,
      vless: configs.filter((c) => c.protocol === 'vless').length,
      ssh: configs.filter((c) => c.protocol === 'ssh').length,
      trojan: configs.filter((c) => c.protocol === 'trojan').length,
      shadowsocks: configs.filter((c) => c.protocol === 'shadowsocks').length,
    };

    const uniqueUsers = new Set(configs.map((c) => c.userId)).size;

    return {
      totalConfigsGenerated: configs.length,
      activeConfigsCount: activeConfigs.length,
      configsByDuration,
      configsByProtocol,
      totalUsersChecked: Math.max(uniqueUsers, this.userSubCache.size),
      subscribedUsersCount: Math.max(uniqueUsers, this.userSubCache.size),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * Forced Channel Subscription Check Middleware Logic
   * Checks if a user is a member/administrator/creator of channel @FR7l7
   */
  async checkChannelSubscription(userId: string | number): Promise<SubscriptionCheckResult> {
    const settings = this.getSettings();
    const strUserId = String(userId);
    const channel = settings.channelUsername || '@FR7l7';

    // Check cache (valid for 60 seconds)
    const cached = this.userSubCache.get(strUserId);
    if (cached && Date.now() - cached.timestamp < 60000) {
      return {
        isSubscribed: cached.isSubscribed,
        status: cached.isSubscribed ? 'member' : 'left',
        userId: strUserId,
        channelUsername: channel,
        message: cached.isSubscribed
          ? 'User is verified channel subscriber.'
          : 'User has not joined the required channel yet.',
        checkedAt: new Date().toISOString(),
      };
    }

    // If no BOT_TOKEN or token is placeholder/demo mode
    if (!settings.botToken || settings.botToken === 'DEMO_MODE_TOKEN') {
      // Return realistic test state. By default, let's allow simulated check or standard sub
      // If user id is 999 or ends in 0, return not subscribed for easy testing!
      const isSub = !strUserId.endsWith('0');
      this.userSubCache.set(strUserId, { isSubscribed: isSub, timestamp: Date.now() });
      return {
        isSubscribed: isSub,
        status: isSub ? 'member' : 'left',
        userId: strUserId,
        channelUsername: channel,
        message: isSub
          ? '[Simulated] User is subscribed to @FR7l7'
          : '[Simulated] User is NOT subscribed to @FR7l7. Direct link required.',
        checkedAt: new Date().toISOString(),
      };
    }

    try {
      const url = `https://api.telegram.org/bot${settings.botToken}/getChatMember?chat_id=${encodeURIComponent(
        channel
      )}&user_id=${encodeURIComponent(strUserId)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && data.result) {
        const status = data.result.status;
        const isSubscribed = ['creator', 'administrator', 'member'].includes(status);

        this.userSubCache.set(strUserId, { isSubscribed, timestamp: Date.now() });

        return {
          isSubscribed,
          status,
          userId: strUserId,
          channelUsername: channel,
          message: isSubscribed
            ? `Verified! User is a ${status} of ${channel}`
            : `Subscription required! User status in ${channel} is '${status}'`,
          checkedAt: new Date().toISOString(),
        };
      } else {
        // If chat member fetch failed (e.g., bot is not admin in channel, or chat not found)
        console.warn('Telegram API getChatMember response:', data);
        // Fallback gracefully
        return {
          isSubscribed: false,
          status: 'left',
          userId: strUserId,
          channelUsername: channel,
          message: data.description || 'Failed to check subscription via Telegram API.',
          checkedAt: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.error('Error executing getChatMember request:', err);
      return {
        isSubscribed: false,
        status: 'unknown',
        userId: strUserId,
        channelUsername: channel,
        message: 'Network error checking subscription.',
        checkedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Handles incoming Telegram updates (via webhook or simulator)
   */
  async handleTelegramUpdate(update: TelegramUpdate): Promise<{
    status: string;
    replies?: Array<{ text: string; inlineKeyboard?: any }>;
  }> {
    const settings = this.getSettings();
    const replies: Array<{ text: string; inlineKeyboard?: any }> = [];

    if (update.message) {
      const msg = update.message;
      const userId = msg.from?.id || msg.chat.id;
      const text = (msg.text || '').trim();

      // 1. Check Forced Channel Subscription
      const subCheck = await this.checkChannelSubscription(userId);

      if (!subCheck.isSubscribed) {
        // Intercept and send forced subscription keyboard
        const forcedKeyboard = [
          [
            {
              text: '📢 Join Channel / انضم للقناة',
              url: settings.channelUrl || 'https://t.me/FR7l7',
            },
          ],
          [
            {
              text: '✅ Check Subscription / تحقق من الاشتراك',
              callback_data: 'action:check_sub',
            },
          ],
        ];

        const notSubscribedMessage = `⚠️ *Subscription Required / يلزم الاشتراك بالقناة*

عذراً! يجب عليك الاشتراك في قناة البوت الرسمية أولاً لتتمكن من استخدام البوت والحصول على سيرفرات VPN و SSH و V2Ray المجانية.

 Please join our official channel to get free 1-7 day VPN, SSH & V2Ray configuration files!

👉 Channel: ${settings.channelUsername || '@FR7l7'}

بعد الانضمام، اضغط على زر "*تحقق من الاشتراك*" بالأسفل لتفعيل البوت.`;

        replies.push({ text: notSubscribedMessage, inlineKeyboard: forcedKeyboard });

        // If real bot token exists, call sendMessage API
        if (settings.botToken && settings.botToken !== 'DEMO_MODE_TOKEN') {
          await this.sendTelegramMessage(msg.chat.id, notSubscribedMessage, forcedKeyboard);
        }

        return { status: 'subscription_required', replies };
      }

      // 2. User is Subscribed! Route commands
      if (text.startsWith('/start') || text === 'Menu' || text === 'قائمة') {
        const startMessage = `👋 *Welcome to FRE0 VPN & SSH Bot!*
🤖 *Bot:* ${settings.botUsername || '@FRE0BOT'}
📢 *Channel:* ${settings.channelUsername || '@FR7l7'} (Verified Member ✅)

مرحباً بك! يمكنك الآن إنشاء واستخراج تكوينات وحسابات VPN و V2Ray و SSH مجانية بسرعات عالية تتراوح صلاحيتها من *يوم واحد إلى 7 أيام*.

Select a VPN protocol or action below:`;

        const mainMenuKeyboard = [
          [
            { text: '🚀 V2Ray (VMess)', callback_data: 'proto:vmess' },
            { text: '⚡ V2Ray (VLESS)', callback_data: 'proto:vless' },
          ],
          [
            { text: '🔐 SSH + WS Payload', callback_data: 'proto:ssh' },
            { text: '🛡️ Trojan VPN', callback_data: 'proto:trojan' },
          ],
          [
            { text: '👤 Shadowsocks', callback_data: 'proto:shadowsocks' },
            { text: '📊 My Configs', callback_data: 'action:my_configs' },
          ],
          [
            {
              text: '🌐 Open Web App',
              url: settings.webhookUrl
                ? settings.webhookUrl.replace('/api/telegram/webhook', '')
                : 'https://t.me/FRE0BOT',
            },
          ],
        ];

        replies.push({ text: startMessage, inlineKeyboard: mainMenuKeyboard });

        if (settings.botToken && settings.botToken !== 'DEMO_MODE_TOKEN') {
          await this.sendTelegramMessage(msg.chat.id, startMessage, mainMenuKeyboard);
        }

        return { status: 'command_handled', replies };
      }
    }

    if (update.callback_query) {
      const cb = update.callback_query;
      const userId = cb.from.id;
      const chatId = cb.message?.chat.id || userId;
      const data = cb.data || '';

      // Handle Check Subscription Callback
      if (data === 'action:check_sub') {
        // Clear sub cache for this user to force re-check
        this.userSubCache.delete(String(userId));
        const subCheck = await this.checkChannelSubscription(userId);

        if (subCheck.isSubscribed) {
          const successMsg = `✅ *Verification Successful / تم التحقق بنجاح!*

شكراً لانضمامك إلى القناة الرسمية ${settings.channelUsername}! يمكنك الآن استخدام البوت بشكل كامل.

Select a protocol to generate your free VPN / SSH config:`;

          const mainMenuKeyboard = [
            [
              { text: '🚀 V2Ray (VMess)', callback_data: 'proto:vmess' },
              { text: '⚡ V2Ray (VLESS)', callback_data: 'proto:vless' },
            ],
            [
              { text: '🔐 SSH + WS Payload', callback_data: 'proto:ssh' },
              { text: '🛡️ Trojan VPN', callback_data: 'proto:trojan' },
            ],
            [
              { text: '👤 Shadowsocks', callback_data: 'proto:shadowsocks' },
            ],
          ];

          replies.push({ text: successMsg, inlineKeyboard: mainMenuKeyboard });

          if (settings.botToken && settings.botToken !== 'DEMO_MODE_TOKEN') {
            await this.sendTelegramMessage(chatId, successMsg, mainMenuKeyboard);
          }
        } else {
          const notYetMsg = `❌ *Not Subscribed Yet / لم يتم الانضمام بعد!*

يرجى الضغط على رابط القناة ${settings.channelUsername || '@FR7l7'} ثم الضغط على "الانضمام (Join)" والمحاولة مرة أخرى.`;

          const forcedKeyboard = [
            [
              {
                text: '📢 Join Channel / انضم للقناة',
                url: settings.channelUrl || 'https://t.me/FR7l7',
              },
            ],
            [
              {
                text: '🔄 Check Again / تحقق مجدداً',
                callback_data: 'action:check_sub',
              },
            ],
          ];

          replies.push({ text: notYetMsg, inlineKeyboard: forcedKeyboard });

          if (settings.botToken && settings.botToken !== 'DEMO_MODE_TOKEN') {
            await this.sendTelegramMessage(chatId, notYetMsg, forcedKeyboard);
          }
        }

        return { status: 'callback_handled', replies };
      }

      // Handle Protocol Selection Callback
      if (data.startsWith('proto:')) {
        const proto = data.replace('proto:', '') as VpnProtocol;
        const durMsg = `⏱️ *Select Duration for ${proto.toUpperCase()} Config:*
اختر مدة صلاحية السيرفر المطلوب:`;

        const durKeyboard = [
          [
            { text: '1 Day (24h) / يوم واحد', callback_data: `gen:${proto}:1` },
            { text: '3 Days (72h) / 3 أيام', callback_data: `gen:${proto}:3` },
          ],
          [
            { text: '7 Days (168h) / 7 أيام', callback_data: `gen:${proto}:7` },
          ],
          [
            { text: '🔙 Back to Menu', callback_data: 'action:menu' },
          ],
        ];

        replies.push({ text: durMsg, inlineKeyboard: durKeyboard });

        if (settings.botToken && settings.botToken !== 'DEMO_MODE_TOKEN') {
          await this.sendTelegramMessage(chatId, durMsg, durKeyboard);
        }

        return { status: 'callback_handled', replies };
      }

      // Handle Generation Callback
      if (data.startsWith('gen:')) {
        const parts = data.split(':');
        const proto = parts[1] as VpnProtocol;
        const days = parseInt(parts[2], 10) as DurationDays;

        // Verify sub again before generating
        const subCheck = await this.checkChannelSubscription(userId);
        if (!subCheck.isSubscribed) {
          const reCheckMsg = `⚠️ *Subscription Required!*
Please join ${settings.channelUsername} first.`;
          replies.push({ text: reCheckMsg });
          return { status: 'subscription_required', replies };
        }

        // Generate Config!
        const config = createVpnConfig(String(userId), proto, days, cb.from.first_name);
        saveConfig(config);

        const configFormatted = formatConfigMessage(config);

        const configKeyboard = [
          [
            { text: '🔄 Generate Another', callback_data: 'action:menu' },
            { text: '📢 Official Channel', url: settings.channelUrl },
          ],
        ];

        replies.push({ text: configFormatted, inlineKeyboard: configKeyboard });

        if (settings.botToken && settings.botToken !== 'DEMO_MODE_TOKEN') {
          await this.sendTelegramMessage(chatId, configFormatted, configKeyboard);
        }

        return { status: 'config_generated', replies };
      }

      // Handle Back to Menu
      if (data === 'action:menu') {
        const startMsg = `📱 *FRE0 VPN Main Menu*
Choose a VPN / SSH protocol:`;

        const menuKb = [
          [
            { text: '🚀 VMess', callback_data: 'proto:vmess' },
            { text: '⚡ VLESS', callback_data: 'proto:vless' },
          ],
          [
            { text: '🔐 SSH Payload', callback_data: 'proto:ssh' },
            { text: '🛡️ Trojan', callback_data: 'proto:trojan' },
          ],
          [
            { text: '👤 Shadowsocks', callback_data: 'proto:shadowsocks' },
          ],
        ];

        replies.push({ text: startMsg, inlineKeyboard: menuKb });

        if (settings.botToken && settings.botToken !== 'DEMO_MODE_TOKEN') {
          await this.sendTelegramMessage(chatId, startMsg, menuKb);
        }

        return { status: 'menu_rendered', replies };
      }
    }

    return { status: 'no_action', replies };
  }

  /**
   * Helper to send message via official Telegram Bot API
   */
  async sendTelegramMessage(chatId: number | string, text: string, inlineKeyboard?: any[]) {
    const settings = this.getSettings();
    if (!settings.botToken || settings.botToken === 'DEMO_MODE_TOKEN') return;

    try {
      const url = `https://api.telegram.org/bot${settings.botToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          reply_markup: inlineKeyboard ? { inline_keyboard: inlineKeyboard } : undefined,
        }),
      });
    } catch (err) {
      console.error('Error in sendTelegramMessage:', err);
    }
  }

  /**
   * Sets Webhook on Telegram API
   */
  async setWebhookUrl(url: string): Promise<{ success: boolean; description: string }> {
    const settings = this.getSettings();
    if (!settings.botToken) {
      return { success: false, description: 'No BOT_TOKEN configured yet.' };
    }

    try {
      const tgUrl = `https://api.telegram.org/bot${settings.botToken}/setWebhook?url=${encodeURIComponent(
        url
      )}`;
      const res = await fetch(tgUrl);
      const data = await res.json();

      if (data.ok) {
        this.updateSettings({ webhookUrl: url, isWebhookActive: true });
        return { success: true, description: data.description || 'Webhook set successfully!' };
      } else {
        return { success: false, description: data.description || 'Telegram setWebhook failed.' };
      }
    } catch (err: any) {
      return { success: false, description: err.message || 'Network error setting webhook.' };
    }
  }
}

export const botService = new TelegramBotService();
