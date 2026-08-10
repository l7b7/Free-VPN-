import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SubscriptionBanner } from './components/SubscriptionBanner';
import { ConfigGenerator } from './components/ConfigGenerator';
import { BotEmulator } from './components/BotEmulator';
import { ConfigVault } from './components/ConfigVault';
import { AdminPanel } from './components/AdminPanel';
import { Guides } from './components/Guides';
import { BotSettings, BotStats, SubscriptionCheckResult, VpnConfig } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('generator');
  const [userId] = useState<string>('745020000'); // Default test Telegram User ID
  const [botSettings, setBotSettings] = useState<BotSettings>({
    botToken: '',
    botUsername: '@FRE0BOT',
    channelUsername: '@FR7l7',
    channelUrl: 'https://t.me/FR7l7',
    webhookUrl: '',
    isWebhookActive: false,
    rateLimitPerMinute: 30,
    autoCheckSubOnStart: true,
    customWelcomeMessage: '',
  });

  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [subResult, setSubResult] = useState<SubscriptionCheckResult | null>(null);
  const [configs, setConfigs] = useState<VpnConfig[]>([]);
  const [isVerifyingSub, setIsVerifyingSub] = useState<boolean>(false);
  const [isTokenSet, setIsTokenSet] = useState<boolean>(false);

  // Fetch Bot Status and Settings on Load
  const fetchBotStatus = async () => {
    try {
      const res = await fetch('/api/bot/status');
      const data = await res.json();
      if (data.success) {
        setBotSettings(data.settings);
        setBotStats(data.stats);
        setIsTokenSet(data.isTokenSet);
      }
    } catch (err) {
      console.error('Error fetching bot status:', err);
    }
  };

  // Fetch Configs Vault List
  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/configs/list');
      const data = await res.json();
      if (data.success && data.configs) {
        setConfigs(data.configs);
      }
    } catch (err) {
      console.error('Error fetching configs:', err);
    }
  };

  // Check Channel Subscription via REST API
  const verifySubscription = async () => {
    setIsVerifyingSub(true);
    try {
      const res = await fetch('/api/user/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setSubResult(data.result);
      }
    } catch (err) {
      console.error('Error verifying subscription:', err);
    } finally {
      setIsVerifyingSub(false);
    }
  };

  useEffect(() => {
    fetchBotStatus();
    fetchConfigs();
    verifySubscription();
  }, []);

  // Handler to update settings from Admin panel
  const handleUpdateSettings = async (newSettings: Partial<BotSettings>) => {
    try {
      const res = await fetch('/api/bot/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setBotSettings(data.settings);
        fetchBotStatus();
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  // Handler to set webhook
  const handleSetWebhook = async (url: string) => {
    try {
      const res = await fetch('/api/bot/set-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Error setting webhook.' };
    }
  };

  // Toggle simulated subscription state for testing
  const handleToggleSubSimulated = () => {
    if (subResult) {
      setSubResult({
        ...subResult,
        isSubscribed: !subResult.isSubscribed,
        status: !subResult.isSubscribed ? 'member' : 'left',
      });
    } else {
      setSubResult({
        isSubscribed: false,
        status: 'left',
        userId,
        channelUsername: botSettings.channelUsername || '@FR7l7',
        checkedAt: new Date().toISOString(),
      });
    }
  };

  const handleConfigCreated = (newConfig: VpnConfig) => {
    setConfigs((prev) => [newConfig, ...prev]);
    fetchBotStatus();
  };

  return (
    <div className="min-h-screen bg-[#0e1621] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        botUsername={botSettings.botUsername || '@FRE0BOT'}
        channelUsername={botSettings.channelUsername || '@FR7l7'}
        channelUrl={botSettings.channelUrl || 'https://t.me/FR7l7'}
        isTokenSet={isTokenSet}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Forced Subscription Banner */}
        <SubscriptionBanner
          userId={userId}
          channelUsername={botSettings.channelUsername || '@FR7l7'}
          channelUrl={botSettings.channelUrl || 'https://t.me/FR7l7'}
          subResult={subResult}
          onVerify={verifySubscription}
          onSimulateToggle={handleToggleSubSimulated}
          isVerifying={isVerifyingSub}
        />

        {/* Tab Views */}
        {activeTab === 'generator' && (
          <ConfigGenerator
            userId={userId}
            isSubscribed={subResult?.isSubscribed ?? false}
            channelUsername={botSettings.channelUsername || '@FR7l7'}
            channelUrl={botSettings.channelUrl || 'https://t.me/FR7l7'}
            onConfigCreated={handleConfigCreated}
            onVerifySub={verifySubscription}
          />
        )}

        {activeTab === 'emulator' && (
          <BotEmulator
            botUsername={botSettings.botUsername || '@FRE0BOT'}
            channelUsername={botSettings.channelUsername || '@FR7l7'}
            channelUrl={botSettings.channelUrl || 'https://t.me/FR7l7'}
            userId={userId}
            isSubscribed={subResult?.isSubscribed ?? false}
            onToggleSub={handleToggleSubSimulated}
          />
        )}

        {activeTab === 'vault' && (
          <ConfigVault
            configs={configs}
            channelUsername={botSettings.channelUsername || '@FR7l7'}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            settings={botSettings}
            stats={botStats}
            onUpdateSettings={handleUpdateSettings}
            onSetWebhook={handleSetWebhook}
          />
        )}

        {activeTab === 'guides' && (
          <Guides
            channelUsername={botSettings.channelUsername || '@FR7l7'}
            channelUrl={botSettings.channelUrl || 'https://t.me/FR7l7'}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#242f3d] bg-[#17212b] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">
            {botSettings.botUsername} • Forced Channel Subscription Engine ({botSettings.channelUsername})
          </p>
          <p>Secure distribution of free VPN, SSH, VMess, VLESS & Trojan files (1 to 7 days pass).</p>
        </div>
      </footer>
    </div>
  );
}
