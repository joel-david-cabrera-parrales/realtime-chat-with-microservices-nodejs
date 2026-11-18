import { apiClient } from './api-client';
import type { ApiResponse, ProfileDirectoryEntry, UserContact } from '@/auth/types';
import type {
  ConversationDTO,
  ConversationListDTO,
  MessageDTO,
  MessageListDTO,
} from '@/chat/dto';

export interface ListConversationsParams {
  cursor?: string;
  limit?: number;
}

export interface CreateConversationBody {
  type: 'direct' | 'group';
  title?: string;
  participantCredentialCodes: string[];
}

export interface SendMessageBody {
  content: string;
}

export interface ChatApi {
  listProfiles: () => Promise<ProfileDirectoryEntry[]>;
  listContacts: (search?: string) => Promise<UserContact[]>;
  listConversations: (params?: ListConversationsParams) => Promise<ConversationListDTO>;
  getConversation: (code: string) => Promise<ConversationDTO>;
  createConversation: (body: CreateConversationBody) => Promise<ConversationDTO>;
  listMessages: (conversationCode: string, params?: ListConversationsParams) => Promise<MessageListDTO>;
  sendMessage: (conversationCode: string, body: SendMessageBody) => Promise<MessageDTO>;
  markMessageDelivered: (messageCode: string) => Promise<void>;
  markMessageRead: (messageCode: string) => Promise<void>;
}

export const chatApi: ChatApi = {
  listProfiles: async () => {
    const response = await apiClient.get<ApiResponse<{ profiles: ProfileDirectoryEntry[] }>>(
      '/api/profile',
    );
    return response.data.profiles;
  },

  listContacts: async (search) => {
    const query = search?.trim()
      ? `?${new URLSearchParams({ search: search.trim(), limit: '100' })}`
      : '?limit=100';
    const response = await apiClient.get<ApiResponse<{ contacts: UserContact[] }>>(
      `/api/auth/contacts${query}`,
    );
    return response.data.contacts;
  },

  listConversations: async (params) => {
    const search = new URLSearchParams();
    if (params?.cursor) search.set('cursor', params.cursor);
    if (params?.limit) search.set('limit', String(params.limit));
    const query = search.toString() ? `?${search}` : '';
    const response = await apiClient.get<ApiResponse<ConversationListDTO>>(
      `/api/chat/conversations${query}`,
    );
    return response.data;
  },

  getConversation: async (code) => {
    const response = await apiClient.get<ApiResponse<ConversationDTO>>(
      `/api/chat/conversations/${code}`,
    );
    return response.data;
  },

  createConversation: async (body) => {
    const response = await apiClient.post<ApiResponse<ConversationDTO>>(
      '/api/chat/conversations',
      body,
    );
    return response.data;
  },

  listMessages: async (conversationCode, params) => {
    const search = new URLSearchParams();
    if (params?.cursor) search.set('cursor', params.cursor);
    if (params?.limit) search.set('limit', String(params.limit));
    const query = search.toString() ? `?${search}` : '';
    const response = await apiClient.get<ApiResponse<MessageListDTO>>(
      `/api/chat/conversations/${conversationCode}/messages${query}`,
    );
    return response.data;
  },

  sendMessage: async (conversationCode, body) => {
    const response = await apiClient.post<ApiResponse<MessageDTO>>(
      `/api/chat/conversations/${conversationCode}/messages`,
      body,
    );
    return response.data;
  },

  markMessageDelivered: async (messageCode) => {
    await apiClient.post<ApiResponse<void>>(
      `/api/chat/messages/${messageCode}/delivered`,
    );
  },

  markMessageRead: async (messageCode) => {
    await apiClient.post<ApiResponse<void>>(
      `/api/chat/messages/${messageCode}/read`,
    );
  },
};
