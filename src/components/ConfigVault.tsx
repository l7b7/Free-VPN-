import React, { useState } from 'react';
import { VpnConfig } from '../types';
import { Key, Copy, Download, Search, Filter, Clock, Check, Shield, Trash2, ExternalLink } from 'lucide-react';

interface ConfigVaultProps {
  configs: VpnConfig[];
  channelUsername: string;
}

export const ConfigVault: React.FC<ConfigVaultProps> = ({ configs, channelUsername }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = configs.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serverLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.userName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProtocol = protocolFilter === 'all' || c.protocol === protocolFilter;

    return matchesSearch && matchesProtocol;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Vault Header & Filters */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg text-white">VPN & SSH Config Vault</h2>
            <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded-full font-mono border border-cyan-500/30">
              {configs.length} Active Files
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            All configuration keys distributed through @FRE0BOT and channel {channelUsername}.
          </p>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, protocol, node..."
              className="w-full bg-[#0e1621] border border-[#242f3d] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="bg-[#0e1621] border border-[#242f3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Protocols</option>
            <option value="vmess">VMess</option>
            <option value="vless">VLESS</option>
            <option value="ssh">SSH</option>
            <option value="trojan">Trojan</option>
            <option value="shadowsocks">Shadowsocks</option>
          </select>
        </div>
      </div>

      {/* Config Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <Shield className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <h3 className="font-bold text-white text-sm">No Configurations Found</h3>
          <p className="text-xs max-w-sm mx-auto text-slate-400">
            Generate your first 1-Day, 3-Day, or 7-Day VPN key from the Generator tab!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cfg) => {
            const isCopied = copiedId === cfg.id;
            const isExpired = new Date(cfg.expiresAt).getTime() < Date.now();

            return (
              <div
                key={cfg.id}
                className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-4 space-y-3 hover:border-[#344458] transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-[#0e1621] px-2 py-0.5 rounded border border-[#242f3d]">
                      {cfg.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isExpired
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isExpired ? 'Expired' : `${cfg.durationDays} Days Pass`}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">{cfg.protocol} Node</h4>
                    <p className="text-xs text-slate-400">{cfg.serverLocation}</p>
                  </div>

                  <div className="bg-[#0e1621] p-2.5 rounded-xl text-[11px] font-mono text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Host:</span>
                      <span className="text-slate-200">{cfg.serverHost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expires:</span>
                      <span className="text-amber-300">
                        {new Date(cfg.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#242f3d] flex gap-2">
                  <button
                    onClick={() => handleCopy(cfg.id, cfg.configUrl)}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy URI'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
