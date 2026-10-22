import { api } from './api/client';

export type TicketStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Cancelled';
export type TicketPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface KbPage {
  id: string;
  title: string;
  summary?: string | null;
  path?: string | null;
}

export interface KnowledgeTree {
  categories?: { id: string; title: string; sections?: { id: string; title: string; pages?: KbPage[] | null }[] | null }[] | null;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TicketMessage {
  id: string;
  message: string;
  senderRole: 'CUSTOMER' | 'AGENT' | 'BOT' | 'SYSTEM';
  createdAt?: string | null;
}

export interface TicketDetail extends SupportTicket {
  messages?: TicketMessage[] | null;
}

export const supportService = {
  faqs: (search?: string) => api.get<KnowledgeTree>('/support/faqs', { params: { search: search || undefined } }),
  tickets: () => api.get<{ data?: SupportTicket[] | null }>('/support/tickets', { params: { limit: 50 } }).then((res) => res.data ?? []),
  ticket: (id: string) => api.get<TicketDetail>(`/support/tickets/${id}`),
  createTicket: (input: { subject: string; category: string; message: string; priority?: TicketPriority }) =>
    api.post<SupportTicket>('/support/tickets', input),
  reply: (id: string, message: string) => api.post<TicketMessage>(`/support/tickets/${id}/message`, { message }),

  queryBot: async (payload: Record<string, unknown>) => {
    try {
      return await api.post<unknown>('/support/bot/query', payload);
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && typeof (error as { status?: number }).status === 'number') {
        return { fallback: true, message: 'Support bot is temporarily unavailable.' };
      }
      throw error;
    }
  },

  escalate: async (payload: Record<string, unknown>) => {
    try {
      return await api.post<unknown>('/support/escalate', payload);
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && typeof (error as { status?: number }).status === 'number') {
        return { escalated: false, message: 'Unable to escalate support right now.' };
      }
      throw error;
    }
  },
};
