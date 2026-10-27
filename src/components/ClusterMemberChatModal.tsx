import { useState, useEffect, useRef } from 'react';
import { Icon } from './ui/Icon';
import {
  getClusterMessages,
  sendClusterMessage,
  type ClusterBusinessMember,
  type ClusterChatMessage,
} from '../scripts/clusterData';
import { hasApiConfig } from '../services/api/client';
import { useClusterChat } from '../scripts/clusterLive';

interface ClusterMemberChatModalProps {
  member: ClusterBusinessMember;
  onClose: () => void;
}

export function ClusterMemberChatModal({ member, onClose }: ClusterMemberChatModalProps) {
  const live = hasApiConfig();
  // Live: `member.businessId` is the other member's branch id.
  const chat = useClusterChat(live ? member.clusterId : undefined, member.businessId, member.businessName);
  const [localMessages, setMessages] = useState<ClusterChatMessage[]>(() =>
    live ? [] : getClusterMessages(member.businessId)
  );
  const messages = live ? chat.messages : localMessages;
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const content = (textToSend ?? text).trim();
    if (!content) return;

    if (live) {
      setText('');
      chat.send.mutate(content, { onError: () => setText(content) });
      return;
    }

    const newMsg = sendClusterMessage(member.businessId, member.businessName, content);
    setMessages((prev) => [...prev, newMsg]);
    setText('');

    // Simulate merchant reply after 1.2s
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg: ClusterChatMessage = {
        id: `reply-${Date.now()}`,
        senderBusinessId: member.businessId,
        senderBusinessName: member.businessName,
        recipientBusinessId: '104',
        recipientBusinessName: 'Urban Grill & Bistro',
        text: `Thanks for reaching out from ${member.unitOrSuite}! We're glad to partner with Urban Grill & Bistro inside the cluster. Let's make it happen!`,
        timestamp: 'Just now',
        isSelf: false,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1400);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-surface-canvas rounded-3xl w-full max-w-md h-[540px] border border-border-subtle shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-surface-subtle border-b border-border-subtle flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
              {member.businessName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs text-text-primary">{member.businessName}</h3>
                {member.isVerified && (
                  <Icon name="verified" className="text-[14px] text-primary" />
                )}
              </div>
              <p className="text-[10px] text-text-secondary">
                {member.unitOrSuite} &bull; Member Merchant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary"
          >
            <Icon name="close" className="text-[16px]" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-canvas text-xs">
          <div className="text-center py-2">
            <span className="px-2.5 py-1 rounded-full bg-surface-subtle text-[10px] text-text-tertiary">
              Direct Cluster Merchant Chat &bull; End-to-End In-App
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl ${
                  msg.isSelf
                    ? 'bg-primary-container text-white rounded-br-xs shadow-sm'
                    : 'bg-surface-subtle text-text-primary border border-border-subtle rounded-bl-xs'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
              </div>
              <span className="text-[9px] text-text-tertiary mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-surface-subtle w-fit text-text-tertiary text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-pulse delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-pulse delay-200" />
              <span className="ml-1 text-[10px]">{member.businessName} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Inquiry Chips */}
        <div className="px-3 py-2 bg-surface-subtle border-t border-border-subtle flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() =>
              handleQuickPrompt('Hi! Would you like to do a joint cluster deal together?')
            }
            className="px-2.5 py-1 rounded-full bg-surface-canvas border border-border-subtle text-[10px] text-text-secondary whitespace-nowrap hover:border-primary transition-colors"
          >
            🤝 Joint Deal Proposal
          </button>
          <button
            type="button"
            onClick={() =>
              handleQuickPrompt('Checking on Saturday footfall trend at your section.')
            }
            className="px-2.5 py-1 rounded-full bg-surface-canvas border border-border-subtle text-[10px] text-text-secondary whitespace-nowrap hover:border-primary transition-colors"
          >
            📈 Footfall Sync
          </button>
          <button
            type="button"
            onClick={() =>
              handleQuickPrompt('Are your cluster QR standees set up at the entrance?')
            }
            className="px-2.5 py-1 rounded-full bg-surface-canvas border border-border-subtle text-[10px] text-text-secondary whitespace-nowrap hover:border-primary transition-colors"
          >
            📲 QR Pass Placement
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-surface-canvas border-t border-border-subtle flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${member.businessName}...`}
            className="flex-1 px-3 py-2 bg-surface-subtle border border-border-subtle rounded-xl text-xs text-text-primary focus:border-primary outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-9 h-9 rounded-xl bg-primary-container text-white flex items-center justify-center disabled:opacity-40 shadow-sm"
          >
            <Icon name="send" className="text-[16px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
