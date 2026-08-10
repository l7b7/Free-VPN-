import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Radio } from 'lucide-react';
import { SubscriptionCheckResult } from '../types';

interface SubscriptionBannerProps {
  userId: string;
  channelUsername: string;
  channelUrl: string;
  subResult: SubscriptionCheckResult | null;
  onVerify: () => void;
  onSimulateToggle?: () => void;
  isVerifying: boolean;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  userId,
  channelUsername,
  channelUrl,
  subResult,
  onVerify,
  onSimulateToggle,
  isVerifying,
}) => {
  const isSubbed = subResult?.isSubscribed ?? false;

  return (
    <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-4 sm:p-5 shadow-xl transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Status Info */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl shadow-lg ${
              isSubbed
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-amber-500/10'
            }`}
          >
            {isSubbed ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white">Forced Subscription Middleware</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isSubbed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {isSubbed ? 'Verified Subscriber ✅' : 'Subscription Required ⚠️'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1">
              {isSubbed ? (
                <span>You are verified in <strong className="text-cyan-400">{channelUsername}</strong>. Config generation is unlocked!</span>
              ) : (
                <span>
                  Must join official channel <strong className="text-cyan-400">{channelUsername}</strong> before executing commands or generating VPN files.
                </span>
              )}
            </p>

            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
              <span>User ID: <code className="text-slate-200 bg-[#0e1621] px-1.5 py-0.5 rounded">{userId}</code></span>
              {subResult?.status && (
                <span>Status: <code className="text-cyan-300 bg-[#0e1621] px-1.5 py-0.5 rounded">{subResult.status}</code></span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {!isSubbed && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/10 transition-all"
            >
              <span>Join {channelUsername}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={onVerify}
            disabled={isVerifying}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#242f3d] hover:bg-[#2b394a] text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#344458] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Check Sub</span>
          </button>

          {onSimulateToggle && (
            <button
              onClick={onSimulateToggle}
              title="Toggle simulated subscription state for testing"
              className="px-3 py-2 rounded-xl bg-[#0e1621] hover:bg-[#1f2c3a] text-slate-400 hover:text-cyan-400 text-xs font-mono flex items-center gap-1 border border-[#242f3d] transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Toggle Test Sub</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
