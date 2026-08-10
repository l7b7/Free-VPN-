import React, { useState } from 'react';
import { Settings, Key, Globe, Radio, Save, RefreshCw, Check, AlertCircle, ShieldCheck, Activity, Users } from 'lucide-react';
import { BotSettings, BotStats } from '../types';

interface AdminPanelProps {
  settings: BotSettings;
  stats: BotStats | null;
  onUpdateSettings: (newSettings: Partial<BotSettings>) => Promise<void>;
  onSetWebhook: (url: string) => Promise<{ success: boolean; message: string }>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  stats,
  onUpdateSettings,
  onSetWebhook,
}) => {
  const [botToken, setBotToken] = useState(settings.botToken || '');
  const [channelUsername, setChannelUsername] = useState(settings.channelUsername || '@FR7l7');
  const [channelUrl, setChannelUrl] = useState(settings.channelUrl || 'https://t.me/FR7l7');
  const [botUsername, setBotUsername] = useState(settings.botUsername || '@FRE0BOT');
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl || `${window.location.origin}/api/telegram/webhook`);

  const [isSaving, setIsSaving] = useState(false);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    try {
      await onUpdateSettings({
        botToken,
        channelUsername,
        channelUrl,
        botUsername,
      });
      setStatusMsg({ type: 'success', text: 'Bot configuration updated successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerWebhook = async () => {
    setIsSettingWebhook(true);
    setStatusMsg(null);

    try {
      const res = await onSetWebhook(webhookUrl);
      if (res.success) {
        setStatusMsg({ type: 'success', text: `Telegram Webhook connected: ${res.message}` });
      } else {
        setStatusMsg({ type: 'error', text: `Webhook setup failed: ${res.message}` });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Network error connecting webhook to Telegram.' });
    } finally {
      setIsSettingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Bot Administration & Webhook Manager</h2>
            <p className="text-xs text-slate-400">
              Configure Telegram Bot credentials, official channel link ({channelUsername}), and rate-limiting params.
            </p>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-4 space-y-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Configs Generated</p>
            <p className="text-2xl font-bold text-white font-mono">{stats.totalConfigsGenerated}</p>
          </div>

          <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-4 space-y-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Active Valid Files</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{stats.activeConfigsCount}</p>
          </div>

          <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-4 space-y-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Passes (1D / 3D / 7D)</p>
            <p className="text-sm font-bold text-cyan-300 font-mono mt-1">
              {stats.configsByDuration[1]} | {stats.configsByDuration[3]} | {stats.configsByDuration[7]}
            </p>
          </div>

          <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-4 space-y-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Uptime</p>
            <p className="text-sm font-bold text-slate-200 font-mono mt-1">
              {Math.floor(stats.uptimeSeconds / 60)} min {stats.uptimeSeconds % 60}s
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Credentials Form */}
        <form onSubmit={handleSaveSettings} className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 space-y-5 shadow-xl">
          <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-[#242f3d] pb-3">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Telegram Bot Credentials</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telegram Bot Token (from @BotFather)
              </label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWxYz"
                className="w-full bg-[#0e1621] border border-[#242f3d] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                If left blank, system runs in high-fidelity demo/simulator mode.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bot Username
              </label>
              <input
                type="text"
                value={botUsername}
                onChange={(e) => setBotUsername(e.target.value)}
                placeholder="@FRE0BOT"
                className="w-full bg-[#0e1621] border border-[#242f3d] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Required Channel Username
                </label>
                <input
                  type="text"
                  value={channelUsername}
                  onChange={(e) => setChannelUsername(e.target.value)}
                  placeholder="@FR7l7"
                  className="w-full bg-[#0e1621] border border-[#242f3d] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Channel Direct URL
                </label>
                <input
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://t.me/FR7l7"
                  className="w-full bg-[#0e1621] border border-[#242f3d] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Bot Settings</span>
          </button>
        </form>

        {/* Right: Webhook Setup */}
        <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-[#242f3d] pb-3">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Telegram Webhook Setup</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Register your Express REST endpoint with Telegram servers to receive live updates whenever users message <strong className="text-cyan-400">{botUsername}</strong> or click inline buttons.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Webhook Callback URL
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-[#0e1621] border border-[#242f3d] rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-3.5 bg-[#0e1621] border border-[#242f3d] rounded-xl text-xs space-y-2 text-slate-400">
              <p className="font-semibold text-slate-200">Webhook Features Active:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Auto-checks forced subscription to <strong>{channelUsername}</strong> via <code className="text-cyan-300">getChatMember</code></li>
                <li>Express Rate Limiter: Protects against spamming</li>
                <li>Supports VMess, VLESS, SSH, Trojan & Shadowsocks generation</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleTriggerWebhook}
            disabled={isSettingWebhook}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSettingWebhook ? 'animate-spin' : ''}`} />
            <span>Connect Webhook to Telegram API</span>
          </button>
        </div>
      </div>
    </div>
  );
};
