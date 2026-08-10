import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, Shield, Sparkles, Clock, Check, Terminal, QrCode, AlertCircle, Cpu, Wifi } from 'lucide-react';
import { DurationDays, VpnConfig, VpnProtocol } from '../types';

interface ConfigGeneratorProps {
  userId: string;
  isSubscribed: boolean;
  channelUsername: string;
  channelUrl: string;
  onConfigCreated?: (config: VpnConfig) => void;
  onVerifySub: () => void;
}

const PROTOCOLS: { id: VpnProtocol; name: string; tag: string; desc: string; icon: string }[] = [
  { id: 'vmess', name: 'V2Ray VMess', tag: 'WS + TLS', desc: 'High anonymity WebSocket & TLS encryption for v2rayNG/Shadowrocket', icon: '🚀' },
  { id: 'vless', name: 'V2Ray VLESS', tag: 'Fast & Lightweight', desc: 'Next-gen protocol with minimal header overhead & superior speeds', icon: '⚡' },
  { id: 'ssh', name: 'SSH + WS Payload', tag: 'HTTP Custom / SSH', desc: 'Secure SSH tunnel with customizable WebSocket payload header', icon: '🔐' },
  { id: 'trojan', name: 'Trojan GFW-Bypass', tag: 'HTTPS Mimicry', desc: 'Disguises VPN traffic as standard HTTPS traffic to bypass deep packet inspection', icon: '🛡️' },
  { id: 'shadowsocks', name: 'Shadowsocks (AEAD)', tag: 'AES-256-GCM', desc: 'Classic encrypted proxy protocol optimized for stable streaming & gaming', icon: '👤' },
];

const DURATIONS: { days: DurationDays; label: string; badge: string; desc: string }[] = [
  { days: 1, label: '1 Day', badge: '24 Hours', desc: 'Quick trial key valid for 1 day' },
  { days: 3, label: '3 Days', badge: '72 Hours', desc: 'Standard key valid for 3 full days' },
  { days: 7, label: '7 Days', badge: '168 Hours', desc: 'Maximum free pass valid for 7 full days' },
];

export const ConfigGenerator: React.FC<ConfigGeneratorProps> = ({
  userId,
  isSubscribed,
  channelUsername,
  channelUrl,
  onConfigCreated,
  onVerifySub,
}) => {
  const [selectedProto, setSelectedProto] = useState<VpnProtocol>('vmess');
  const [selectedDuration, setSelectedDuration] = useState<DurationDays>(3);
  const [userName, setUserName] = useState<string>('Telegram_User');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedConfig, setGeneratedConfig] = useState<VpnConfig | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showQr, setShowQr] = useState<boolean>(false);

  const handleGenerate = async () => {
    setErrorMsg(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/configs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          protocol: selectedProto,
          durationDays: selectedDuration,
        }),
      });

      const data = await res.json();

      if (data.success && data.config) {
        setGeneratedConfig(data.config);
        if (onConfigCreated) onConfigCreated(data.config);
      } else {
        if (data.error === 'Subscription required') {
          setErrorMsg(`⚠️ Subscription Required! Please join channel ${channelUsername} first to unlock config generation.`);
        } else {
          setErrorMsg(data.message || data.error || 'Failed to generate VPN config.');
        }
      }
    } catch (err: any) {
      setErrorMsg('Network error requesting config generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = (config: VpnConfig) => {
    const textContent = `================================================
  FRE0BOT Free VPN & SSH Configuration File
  Official Bot: @FRE0BOT
  Official Channel: ${channelUsername} (${channelUrl})
================================================
Config ID: ${config.id}
Protocol: ${config.protocol.toUpperCase()}
Duration: ${config.durationDays} Day(s)
Created At: ${config.createdAt}
Expires At: ${config.expiresAt}
Server Host: ${config.serverHost}:${config.port}
Location: ${config.serverLocation}
------------------------------------------------
CONFIG URI (COPY TO V2RAY / SHADOWROCKET / HTTP CUSTOM):
${config.configUrl}

${config.rawPayload ? `HTTP CUSTOM WEBSOCKET PAYLOAD:\n${config.rawPayload}\n` : ''}
================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.protocol}_${config.durationDays}D_${config.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Instant VPN & V2Ray & SSH Distribution
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Generate Free 1-Day, 3-Day & 7-Day Configs
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Select your preferred VPN protocol and duration. All files are automatically generated, encrypted, and verified against forced channel membership for <strong className="text-cyan-400">{channelUsername}</strong>.
          </p>
        </div>
      </div>

      {/* Subscription Error Alert if blocked */}
      {errorMsg && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-amber-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="font-semibold">{errorMsg}</p>
            <div className="flex gap-2">
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold border border-amber-500/40"
              >
                Join {channelUsername} Now
              </a>
              <button
                onClick={onVerifySub}
                className="px-3 py-1 rounded-lg bg-[#242f3d] hover:bg-[#2b394a] text-slate-200 font-semibold"
              >
                Re-Verify Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Protocol Selector */}
          <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-5 space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>1. Choose Protocol</span>
              <span className="text-[11px] text-cyan-400 font-normal">V2Ray / SSH / Trojan</span>
            </label>

            <div className="space-y-2.5">
              {PROTOCOLS.map((p) => {
                const isSelected = selectedProto === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProto(p.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-md shadow-cyan-500/5'
                        : 'bg-[#0e1621] border-[#242f3d] text-slate-300 hover:border-[#344458] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{p.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f2c3a] text-cyan-300 border border-[#2b394a] font-mono">
                            {p.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-[#344458]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Duration Selector */}
          <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-5 space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>2. Choose Validity Duration</span>
              <span className="text-[11px] text-slate-400 font-normal">1, 3, or 7 Days Pass</span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {DURATIONS.map((d) => {
                const isSelected = selectedDuration === d.days;
                return (
                  <button
                    key={d.days}
                    type="button"
                    onClick={() => setSelectedDuration(d.days)}
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-md'
                        : 'bg-[#0e1621] border-[#242f3d] text-slate-300 hover:border-[#344458]'
                    }`}
                  >
                    <Clock className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm text-white">{d.label}</span>
                    <span className="text-[10px] text-slate-400">{d.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Name Input & Submit Button */}
          <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Telegram User Identifier</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Telegram Name or ID"
                className="w-full bg-[#0e1621] border border-[#242f3d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>Generating Encrypted Key...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Free {selectedDuration}-Day {selectedProto.toUpperCase()} File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output Card */}
        <div className="lg:col-span-5">
          {generatedConfig ? (
            <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-5 space-y-5 shadow-2xl relative overflow-hidden sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-[#242f3d]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-sm text-white">Config Ready & Active</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold uppercase">
                  {generatedConfig.protocol}
                </span>
              </div>

              {/* Server Info */}
              <div className="bg-[#0e1621] border border-[#242f3d] rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Server Node:</span>
                  <span className="font-semibold text-white">{generatedConfig.serverLocation}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Host & Port:</span>
                  <code className="text-cyan-300 bg-[#17212b] px-2 py-0.5 rounded border border-[#242f3d]">
                    {generatedConfig.serverHost}:{generatedConfig.port}
                  </code>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Validity Pass:</span>
                  <span className="text-emerald-400 font-bold">{generatedConfig.durationDays} Day(s)</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Expires At:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {new Date(generatedConfig.expiresAt).toLocaleDateString()} {new Date(generatedConfig.expiresAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* QR Code toggle / view */}
              {showQr ? (
                <div className="bg-[#0e1621] p-4 rounded-xl border border-[#242f3d] flex flex-col items-center justify-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-lg">
                    <QRCodeSVG value={generatedConfig.configUrl} size={160} />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Scan with <strong>v2rayNG</strong> or <strong>Shadowrocket</strong> camera
                  </p>
                  <button
                    onClick={() => setShowQr(false)}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Hide QR Code
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowQr(true)}
                  className="w-full py-2 bg-[#0e1621] hover:bg-[#1a2634] text-slate-300 text-xs font-semibold rounded-xl border border-[#242f3d] flex items-center justify-center gap-2 transition-all"
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Show QR Code for Mobile Camera Import</span>
                </button>
              )}

              {/* Copy URI Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Import Link (Tap to Copy)</span>
                  <span className="text-cyan-400">v2ray / ssh URL</span>
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    rows={3}
                    value={generatedConfig.configUrl}
                    className="w-full bg-[#0e1621] border border-[#242f3d] rounded-xl p-3 text-[11px] font-mono text-cyan-300 resize-none focus:outline-none scrollbar-none"
                  />
                  <button
                    onClick={() => handleCopy(generatedConfig.configUrl)}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg shadow-md flex items-center gap-1 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SSH Payload box if applicable */}
              {generatedConfig.rawPayload && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>WebSocket Payload</span>
                  </label>
                  <div className="bg-[#0e1621] border border-[#242f3d] rounded-xl p-3 text-[11px] font-mono text-slate-300">
                    <pre className="whitespace-pre-wrap break-all">{generatedConfig.rawPayload}</pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadTxt(generatedConfig)}
                  className="flex-1 py-2.5 bg-[#242f3d] hover:bg-[#2b394a] text-slate-200 font-bold text-xs rounded-xl border border-[#344458] flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Save Config File (.txt)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-16 h-16 rounded-2xl bg-[#0e1621] border border-[#242f3d] flex items-center justify-center text-slate-500">
                <Wifi className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">No Config Generated Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Select a protocol and duration on the left, then click <strong>Generate</strong> to create your free VPN key.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
