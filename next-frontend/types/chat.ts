// next-frontend/types/chat.ts

export type SenderType = 'customer' | 'agent' | 'manager' | 'system';

export interface ChatMessage {
  id: number | null;
  tempId?: string | number;
  ticketId: number;
  senderId: number | string;
  senderType: SenderType;
  senderName?: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'file';
  audioDuration?: number;
  isRead: boolean;
  createdAt: string;
}

export interface Escalation {
  id: number;
  ticketId: number;
  reason: string;
  level: string;
  escalatedBy: number;
  escalatedTo: number;
  status: string;
  escalatedToAdmin?: { firstName: string; lastName: string };
  escalatedByAdmin?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface ChatTicket {
  id: number;
  customerId: number;
  customerName?: string;
  customer?: { id: number; name: string; email?: string; phoneNumber?: string };
  agentId?: number;
  agentName?: string;
  agent?: { firstName: string; lastName: string };
  subject: string;
  status: 'open' | 'pending' | 'closed' | 'escalated';
  priority?: 'Urgent' | 'High' | 'Medium' | 'Low' | string;
  deadlineAt?: string;
  caseId?: number;
  caseName?: string;
  lastMessage?: string;
  unreadCount?: number;
  updatedAt: string;
  createdAt: string;
  chats?: ChatMessage[];
  escalations?: Escalation[];
}

export interface ChatRating {
  id: number;
  ticketId: number;
  score: number;
  comment?: string;
  createdAt: string;
}
