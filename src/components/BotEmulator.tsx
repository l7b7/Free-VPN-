import React, { useState } from 'react';
import { Send, Bot, User, CheckCircle2, AlertTriangle, RefreshCw, Shield, Sparkles, ExternalLink } from 'lucide-react';
import { ChatMessageItem, TelegramUpdate } from '../types';

interface BotEmulatorProps {
  botUsername: string;
  channelUsername: string;
  channelUrl: string;
  userId: string;
  isSubscribed: boolean;
  onToggleSub: () => void;
}

export const BotEmulator: React.FC<BotEmulatorProps> = ({
  botUsername,
  channelUsername,
  channelUrl,
  userId,
  isSubscribed,
  onToggleSub,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: '1',
      sender: 'bot',
      text: `👋 Welcome to Telegram Bot Emulator for ${botUsername}!

Type /start or click the button below to test the Telegram bot workflow and Forced Channel Subscription checks for ${channelUsername}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inlineKeyboard: [
        [{ text: '🚀 Test /start Command', callback_data: '/start' }],
        [{ text: '📢 Channel Link: ' + channelUsername, url: channelUrl }],
      ],
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const sendUpdateToBot = async (updateObj: TelegramUpdate) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ update: updateObj }),
      });

      const data = await res.json();

      if (data.success && data.result?.replies) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        data.result.replies.forEach((reply: any, idx: number) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}_${idx}`,
              sender: 'bot',
              text: reply.text,
              timestamp: now,
              inlineKeyboard: reply.inlineKeyboard,
            },
          ]);
        });
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserSendMessage = (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg: ChatMessageItem = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Prepare Telegram Update payload
    const updateObj: TelegramUpdate = {
      update_id: Math.floor(Math.random() * 1000000),
      message: {
        message_id: Math.floor(Math.random() * 100000),
        from: {
          id: parseInt(userId, 10) || 123456789,
          first_name: 'Tester',
          username: 'tester_user',
          is_bot: false,
        },
        chat: {
          id: parseInt(userId, 10) || 123456789,
          type: 'private',
          first_name: 'Tester',
        },
        date: Math.floor(Date.now() / 1000),
        text,
      },
    };

    sendUpdateToBot(updateObj);
  };

  const handleInlineCallbackClick = (callbackData: string) => {
    if (callbackData === '/start') {
      handleUserSendMessage('/start');
      return;
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append small user action indicator
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'user',
        text: `[Pressed: ${callbackData}]`,
        timestamp: now,
      },
    ]);

    const updateObj: TelegramUpdate = {
      update_id: Math.floor(Math.random() * 1000000),
      callback_query: {
        id: Date.now().toString(),
        from: {
          id: parseInt(userId, 10) || 123456789,
          first_name: 'Tester',
          username: 'tester_user',
        },
        message: {
          message_id: Math.floor(Math.random() * 100000),
          chat: {
            id: parseInt(userId, 10) || 123456789,
            type: 'private',
          },
          date: Math.floor(Date.now() / 1000),
        },
        data: callbackData,
      },
    };

    sendUpdateToBot(updateObj);
  };

  return (
    <div className="space-y-4">
      {/* Simulation Controls Bar */}
      <div className="bg-[#17212b] border border-[#242f3d] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Telegram Chat Simulator ({botUsername})</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Interactive UI
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Test forced channel subscription checks for <strong className="text-cyan-400">{channelUsername}</strong> and button callbacks in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onToggleSub}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
              isSubscribed
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
            }`}
          >
            {isSubscribed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span>Simulate: {isSubscribed ? 'Subscribed ✅' : 'NOT Subscribed ❌'}</span>
          </button>

          <button
            onClick={() => handleUserSendMessage('/start')}
            className="px-3.5 py-2 bg-[#242f3d] hover:bg-[#2b394a] text-slate-200 text-xs font-bold rounded-xl border border-[#344458] flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Send /start</span>
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-[#0e1621] border border-[#242f3d] rounded-2xl h-[520px] flex flex-col shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="bg-[#17212b] px-4 py-3 border-b border-[#242f3d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
              🤖
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{botUsername}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400">bot • forced sub mode: {channelUsername}</p>
            </div>
          </div>

          <button
            onClick={() => setMessages([])}
            className="text-[11px] text-slate-400 hover:text-slate-200"
          >
            Clear History
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm space-y-2 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-[#2b5278] text-white rounded-br-none'
                    : 'bg-[#182533] text-slate-100 rounded-bl-none border border-[#242f3d]'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</div>

                {/* Inline Keyboard Rows if present */}
                {msg.inlineKeyboard && msg.inlineKeyboard.length > 0 && (
                  <div className="pt-2 border-t border-[#242f3d]/60 space-y-1.5 mt-2">
                    {msg.inlineKeyboard.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-1.5 flex-wrap">
                        {row.map((btn, bIdx) => {
                          if (btn.url) {
                            return (
                              <a
                                key={bIdx}
                                href={btn.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 px-3 rounded-xl bg-[#243447] hover:bg-[#2e4259] text-cyan-300 font-bold text-xs flex items-center justify-center gap-1 border border-[#34485e] transition-all text-center"
                              >
                                <span>{btn.text}</span>
                                <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
                              </a>
                            );
                          }

                          return (
                            <button
                              key={bIdx}
                              onClick={() => btn.callback_data && handleInlineCallbackClick(btn.callback_data)}
                              className="flex-1 py-2 px-3 rounded-xl bg-[#202b36] hover:bg-[#2b3947] text-slate-200 font-medium text-xs flex items-center justify-center border border-[#2b3947] hover:border-cyan-500/50 transition-all text-center"
                            >
                              <span>{btn.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-right mt-1">{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <span>{botUsername} is typing / checking subscription...</span>
            </div>
          )}
        </div>

        {/* Chat Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserSendMessage();
          }}
          className="bg-[#17212b] p-3 border-t border-[#242f3d] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type /start or message to @FRE0BOT..."
            className="flex-1 bg-[#0e1621] border border-[#242f3d] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold flex items-center justify-center transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
