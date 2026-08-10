import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { botService, saveConfig, loadConfigs } from '../services/telegramBot';
import { createVpnConfig } from '../services/vpnGenerator';
import { DurationDays, VpnProtocol } from '../../src/types';

export const apiRouter = Router();

// Anti-spam rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' },
});

const configGeneratorLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 configs generated per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded: You can only generate 15 configs per minute.' },
});

apiRouter.use(generalLimiter);

// 1. Get Bot Status & Health
apiRouter.get('/bot/status', async (req: Request, res: Response) => {
  try {
    const settings = botService.getSettings();
    const stats = botService.getStats();

    res.json({
      success: true,
      botUsername: settings.botUsername || '@FRE0BOT',
      channelUsername: settings.channelUsername || '@FR7l7',
      channelUrl: settings.channelUrl || 'https://t.me/FR7l7',
      isTokenSet: Boolean(settings.botToken && settings.botToken !== 'DEMO_MODE_TOKEN'),
      isWebhookActive: settings.isWebhookActive,
      stats,
      settings,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get & Update Bot Settings
apiRouter.get('/bot/settings', (req: Request, res: Response) => {
  res.json({ success: true, settings: botService.getSettings() });
});

apiRouter.post('/bot/settings', (req: Request, res: Response) => {
  try {
    const { botToken, channelUsername, channelUrl, botUsername } = req.body;
    const updated = botService.updateSettings({
      botToken: botToken !== undefined ? botToken : undefined,
      channelUsername: channelUsername || '@FR7l7',
      channelUrl: channelUrl || 'https://t.me/FR7l7',
      botUsername: botUsername || '@FRE0BOT',
    });
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Telegram Webhook Endpoint
apiRouter.post('/telegram/webhook', async (req: Request, res: Response) => {
  try {
    const update = req.body;
    if (!update || (!update.message && !update.callback_query)) {
      res.status(200).send('OK (Empty Update)');
      return;
    }

    const result = await botService.handleTelegramUpdate(update);
    res.status(200).json({ ok: true, result });
  } catch (err: any) {
    console.error('Error handling webhook update:', err);
    res.status(200).send('OK (Error logged)');
  }
});

// 4. Interactive Telegram Bot Emulator Endpoint
apiRouter.post('/telegram/simulate', async (req: Request, res: Response) => {
  try {
    const { update } = req.body;
    if (!update) {
      res.status(400).json({ success: false, error: 'Update object required.' });
      return;
    }

    const result = await botService.handleTelegramUpdate(update);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Check Forced Channel Subscription Endpoint
apiRouter.post('/user/check-subscription', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required.' });
      return;
    }

    const result = await botService.checkChannelSubscription(userId);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Generate VPN / SSH Config Endpoint (Rate Limited)
apiRouter.post('/configs/generate', configGeneratorLimiter, async (req: Request, res: Response) => {
  try {
    const { userId, protocol, durationDays, userName } = req.body;

    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required.' });
      return;
    }

    const validProtocols: VpnProtocol[] = ['vmess', 'vless', 'ssh', 'trojan', 'shadowsocks'];
    const selectedProto: VpnProtocol = validProtocols.includes(protocol) ? protocol : 'vmess';

    const validDurations: DurationDays[] = [1, 3, 7];
    const selectedDuration: DurationDays = validDurations.includes(Number(durationDays) as any)
      ? (Number(durationDays) as DurationDays)
      : 3;

    // Check subscription before generating
    const subCheck = await botService.checkChannelSubscription(userId);
    if (!subCheck.isSubscribed) {
      res.status(403).json({
        success: false,
        error: 'Subscription required',
        subscriptionCheck: subCheck,
        message: 'You must join channel @FR7l7 before generating VPN files.',
      });
      return;
    }

    const config = createVpnConfig(String(userId), selectedProto, selectedDuration, userName);
    saveConfig(config);

    res.json({
      success: true,
      config,
      subscriptionCheck: subCheck,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. List Active & History Configs
apiRouter.get('/configs/list', (req: Request, res: Response) => {
  try {
    const configs = loadConfigs();
    res.json({ success: true, count: configs.length, configs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Stats Metrics Endpoint
apiRouter.get('/configs/stats', (req: Request, res: Response) => {
  try {
    res.json({ success: true, stats: botService.getStats() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Set Webhook Endpoint
apiRouter.post('/bot/set-webhook', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ success: false, error: 'Webhook URL required.' });
      return;
    }

    const result = await botService.setWebhookUrl(url);
    res.json({ success: result.success, message: result.description });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
