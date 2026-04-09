// next-frontend/lib/api/chat.ts
import client from './client';
import { ChatMessage, ChatTicket, ChatRating } from '@/types/chat';

export const chatApi = {
  // Common
  async getCases() {
    const response = await client.get('/cases');
    return response.data;
  },

  async getTicket(ticketId: number, role: 'admin' | 'customer' = 'customer'): Promise<ChatTicket> {
    const response = await client.get(`/${role}/tickets/${ticketId}`);
    return response.data;
  },

  async markMessagesAsRead(ticketId: number, role: 'admin' | 'customer') {
    const response = await client.put(`/${role}/tickets/${ticketId}/read`, {});
    return response.data;
  },

  // Admin specific
  async getAgentTickets(limit = 10, offset = 0): Promise<ChatTicket[]> {
    const response = await client.get(`/admin/tickets?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  async sendAgentMessage(messageData: Partial<ChatMessage>) {
    const response = await client.post(`/admin/tickets/messages`, messageData);
    return response.data;
  },

  async closeTicket(ticketId: number, summary = "") {
    const response = await client.put(`/admin/tickets/${ticketId}/close`, { summary });
    return response.data;
  },

  // Customer specific
  async getCustomerTickets(limit = 10, offset = 0): Promise<ChatTicket[]> {
    const response = await client.get(`/customer/tickets?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  async createTicket(ticketData: any): Promise<ChatTicket> {
    const response = await client.post('/customer/tickets', ticketData);
    return response.data;
  },

  async sendCustomerMessage(messageData: Partial<ChatMessage>) {
    const response = await client.post('/customer/tickets/messages', messageData);
    return response.data;
  },

  async getTicketRating(ticketId: number): Promise<ChatRating | null> {
    try {
      const response = await client.get(`/customer/tickets/${ticketId}/rating`);
      return response.data;
    } catch {
      return null;
    }
  },

  async rateTicket(ticketId: number, ratingData: { score: number, comment?: string }) {
    const response = await client.post(`/customer/tickets/${ticketId}/rating`, ratingData);
    return response.data;
  },

  // Stats & Reports
  async getAgentPerformance() {
    const response = await client.get('/admin/performance');
    return response.data;
  },

  async getTicketReports(period = 'weekly') {
    const response = await client.get(`/admin/tickets/reports?period=${period}`);
    return response.data;
  },

  // Transfer & Escalate
  async getTransferTargets() {
    const response = await client.get('/admin/users/transfer-targets');
    return response.data;
  },

  async reassignTicket(ticketId: number, newAgentId: number, reason: string) {
    const response = await client.put(`/admin/tickets/${ticketId}/reassign`, {
      newAgentId,
      reason
    });
    return response.data;
  },

  async escalateTicket(ticketId: number, managerId: number, reason: string) {
    const response = await client.put(`/admin/tickets/${ticketId}/escalate`, {
      managerId,
      reason
    });
    return response.data;
  }
};
