import React from 'react';
import { BookOpen, Smartphone, Laptop, ExternalLink, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';

interface GuidesProps {
  channelUsername: string;
  channelUrl: string;
}

export const Guides: React.FC<GuidesProps> = ({ channelUsername, channelUrl }) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">How to Import VPN & SSH Configs</h2>
            <p className="text-xs text-slate-400">
              Step-by-step tutorial for Android, iOS, Windows, and Mac using files generated from @FRE0BOT.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Android Guide */}
        <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-[#242f3d] pb-2">
            <Smartphone className="w-4 h-4" />
            <span>Android Setup (v2rayNG / HTTP Custom / NekoBox)</span>
          </div>

          <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-300">
            <li>
              Download <strong className="text-white">v2rayNG</strong> or <strong className="text-white">NekoBox</strong> from Google Play Store or Telegram channel <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">{channelUsername}</a>.
            </li>
            <li>
              Generate your 1-Day, 3-Day, or 7-Day config URI from @FRE0BOT or this Web App.
            </li>
            <li>
              Copy the <code className="text-cyan-300">vmess://</code> or <code className="text-cyan-300">vless://</code> link to your clipboard.
            </li>
            <li>
              Open v2rayNG, tap the <strong className="text-white">+</strong> button at top-right, and choose <strong className="text-white">Import config from Clipboard</strong>.
            </li>
            <li>
              Tap the Connect button at bottom-right to enjoy free uncensored internet!
            </li>
          </ol>
        </div>

        {/* iOS Guide */}
        <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-[#242f3d] pb-2">
            <Smartphone className="w-4 h-4" />
            <span>iOS iPhone / iPad (Shadowrocket / Stash / Streisand)</span>
          </div>

          <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-300">
            <li>
              Install <strong className="text-white">Shadowrocket</strong> or <strong className="text-white">Streisand</strong> from Apple App Store.
            </li>
            <li>
              Generate your VPN config and click <strong className="text-white">Show QR Code</strong> or Copy URI.
            </li>
            <li>
              In Shadowrocket, tap the Scan icon at top-left to scan the QR code directly from your laptop or second screen.
            </li>
            <li>
              Toggle the main connection switch to ON.
            </li>
          </ol>
        </div>

        {/* Windows / Mac Guide */}
        <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-5 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-[#242f3d] pb-2">
            <Laptop className="w-4 h-4" />
            <span>Desktop Windows & Mac (v2rayN / Nekoray / Clash)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="bg-[#0e1621] p-3.5 rounded-xl border border-[#242f3d] space-y-1">
              <span className="font-bold text-white block">1. Install Client</span>
              <p className="text-slate-400">Download v2rayN for Windows or NekoRay for Mac.</p>
            </div>
            <div className="bg-[#0e1621] p-3.5 rounded-xl border border-[#242f3d] space-y-1">
              <span className="font-bold text-white block">2. Import Clipboard</span>
              <p className="text-slate-400">Copy link from @FRE0BOT and press Ctrl+V in v2rayN.</p>
            </div>
            <div className="bg-[#0e1621] p-3.5 rounded-xl border border-[#242f3d] space-y-1">
              <span className="font-bold text-white block">3. Set System Proxy</span>
              <p className="text-slate-400">Right-click tray icon & choose Set System Proxy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
