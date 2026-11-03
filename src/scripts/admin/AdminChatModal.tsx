import { useState } from 'react';

export interface ChatMessage {
  id: string;
  sender: 'admin' | 'user';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface AdminChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientType: 'business' | 'customer';
  recipientSubtitle: string;
  recipientInitials?: string;
}

export function AdminChatModal({
  isOpen,
  onClose,
  recipientName,
  recipientType,
  recipientSubtitle,
  recipientInitials = 'VT',
}: AdminChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: '1',
      sender: 'user',
      text:
        recipientType === 'business'
          ? `Hello VEMTAP Support, we updated our store operating hours for the Lekki branch. Does it reflect on the customer discovery feed yet?`
          : `Hi, I made an NFC tap payment at Mega Seafood Hub earlier today but the discount points didn't reflect on my loyalty dashboard. Could you check?`,
      timestamp: 'Today, 10:24 AM',
      status: 'read',
    },
    {
      id: '2',
      sender: 'admin',
      text:
        recipientType === 'business'
          ? `Hello ${recipientName}! Yes, operating hours are synchronized with the cluster spatial cache within 15 minutes. Our telemetry shows the new schedule is live.`
          : `Hello ${recipientName}, thanks for reaching out. Let me look up that transaction on the terminal ledger for you.`,
      timestamp: 'Today, 10:28 AM',
      status: 'read',
    },
  ]);

  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'admin',
      text: inputVal.trim(),
      timestamp: 'Just now',
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');
  };

  const handleQuickTemplate = (text: string) => {
    setInputVal(text);
  };

  const quickTemplates =
    recipientType === 'business'
      ? [
          'Please upload your renewed CAC document for annual verification.',
          'Your POS terminal firmware update is ready to install.',
          'Your account compliance review has passed successfully.',
          'Please confirm your settlement account details on file.',
        ]
      : [
          'We have credited 500 bonus loyalty points to your wallet.',
          'Your reported transaction has been successfully verified.',
          'Please verify your phone number to unlock Tier 2 limits.',
          'Thank you for being a valued VEMTAP customer!',
        ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[640px] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-16 px-6 bg-[#2d3133] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#066cf4] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              {recipientInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[15px]">{recipientName}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/90">
                  {recipientType === 'business' ? 'Merchant Support' : 'Customer Support'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>Active now • {recipientSubtitle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Quick Response Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold uppercase text-[10px] shrink-0 mr-1">
            Quick Prompts:
          </span>
          {quickTemplates.map((t, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickTemplate(t)}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-[#0055c4] hover:text-[#0055c4] text-slate-600 transition-colors shrink-0 text-left truncate max-w-[220px]"
              title={t}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-slate-200/60 text-slate-600 text-[11px] font-medium">
              Verified Administrative Audit Channel • End-to-End Logged
            </span>
          </div>

          {messages.map((msg) => {
            const isAdmin = msg.sender === 'admin';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!isAdmin && (
                    <div className="w-7 h-7 rounded-lg bg-[#066cf4] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mb-1">
                      {recipientInitials}
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-xs ${
                      isAdmin
                        ? 'bg-[#0055c4] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                        isAdmin ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isAdmin && (
                        <span className="material-symbols-outlined text-[13px]">done_all</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input Footer */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`Type direct message to ${recipientName}...`}
            className="flex-1 h-10 px-4 rounded-xl bg-slate-100 text-slate-800 placeholder-slate-400 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0055c4]/30"
          />

          <button
            type="submit"
            className="h-10 px-4 bg-[#0055c4] hover:bg-[#066cf4] text-white rounded-xl font-medium text-[13px] flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
          >
            <span>Send</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

