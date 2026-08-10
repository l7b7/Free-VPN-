import React from 'react';
import { Shield, Bot, Key, Settings, BookOpen, ExternalLink, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  botUsername: string;
  channelUsername: string;
  channelUrl: string;
  isTokenSet: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  botUsername,
  channelUsername,
  channelUrl,
  isTokenSet,
}) => {
  return (
    <header className="bg-[#17212b] border-b border-[#242f3d] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Bot Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-bold text-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight">{botUsername}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>Required Channel:</span>
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 font-semibold hover:underline inline-flex items-center gap-0.5"
                >
                  {channelUsername}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0e1621] p-1 rounded-xl border border-[#242f3d]">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'generator'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:bg-[#1f2c3a] hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              VPN Generator
            </button>

            <button
              onClick={() => setActiveTab('emulator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'emulator'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:bg-[#1f2c3a] hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Bot Emulator
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'vault'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:bg-[#1f2c3a] hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Config Vault
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:bg-[#1f2c3a] hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings & Token
              {!isTokenSet && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('guides')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'guides'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:bg-[#1f2c3a] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Setup Guides
            </button>
          </nav>

          {/* Channel direct link button */}
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
          >
            <span>Join {channelUsername}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden overflow-x-auto gap-2 py-2 border-t border-[#242f3d] scrollbar-none">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'generator' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 bg-[#0e1621]'
            }`}
          >
            VPN Generator
          </button>
          <button
            onClick={() => setActiveTab('emulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'emulator' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 bg-[#0e1621]'
            }`}
          >
            Bot Emulator
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'vault' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 bg-[#0e1621]'
            }`}
          >
            Vault
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 bg-[#0e1621]'
            }`}
          >
            Admin & Token
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'guides' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 bg-[#0e1621]'
            }`}
          >
            Guides
          </button>
        </div>
      </div>
    </header>
  );
};
