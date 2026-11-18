import { useState, useCallback, useEffect, useRef, useMemo, type RefObject } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/hooks/useAuth';
import { useProfile } from '@/shared/hooks/useProfile';
import { useChatSocket } from './useChatSocket';
import { chatApi } from '@/shared/api/chat-api';
import { queryKeys } from '@/shared/api/queryKeys';
import type { Conversation, Message, User } from '../types';
import type { ConversationDTO, ConversationListDTO, MessageDTO, MessageListDTO } from '../dto';
import type { ProfileDirectoryEntry, UserContact } from '@/auth/types';

interface UseChatOptions {
  currentUser?: User;
}

const DEFAULT_CURRENT_USER: User = {
  id: 'user-me',
  name: 'Alex Rivera',
  initials: 'AR',
  status: 'online',
  color: 'blue',
};

const USER_COLORS: string[] = [
  'blue', 'emerald', 'amber', 'violet', 'rose', 'cyan',
];

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
}

function colorFor(credentialCode: string): string {
  let hash = 0;
  for (let i = 0; i < credentialCode.length; i++) {
    hash = credentialCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function mapParticipantToUser(
  p: { credentialCode: string },
  name: string,
  onlineCredentialCodes: Set<string>,
): User {
  return {
    id: p.credentialCode,
    name,
    avatar: undefined,
    initials: initialsFromName(name),
    status: onlineCredentialCodes.has(p.credentialCode) ? 'online' : 'offline',
    color: colorFor(p.credentialCode),
  };
}

function mapConversationDTOtoConversation(
  dto: ConversationDTO,
  currentUserId: string,
  contactByCredential: Map<string, UserContact>,
  profileByCode: Map<string, ProfileDirectoryEntry>,
  onlineCredentialCodes: Set<string>,
): Conversation {
  const participants = dto.participants.map((participant) => {
    const contact = contactByCredential.get(participant.credentialCode);
    const profile = contact ? profileByCode.get(contact.profileCode) : undefined;
    return mapParticipantToUser(
      participant,
      profile?.fullName ?? participant.credentialCode,
      onlineCredentialCodes,
    );
  });
  const otherParticipants = participants.filter((p) => p.id !== currentUserId);
  const primaryUser = otherParticipants[0] ?? participants[0];
  const lastMessage = dto.lastMessage
    ? mapMessageDTOtoMessage({
        code: dto.lastMessage.code,
        conversationCode: dto.code,
        senderCredentialCode: dto.lastMessage.senderCredentialCode,
        content: dto.lastMessage.content,
        createdAt: dto.lastMessage.createdAt,
        status: 'sent',
        deliveredAt: null,
        readAt: null,
        editedAt: null,
        deletedAt: null,
        deletedBy: null,
        updatedAt: dto.lastMessage.createdAt,
      }, contactByCredential, profileByCode)
    : undefined;

  return {
    id: dto.code,
    type: dto.type === 'group' ? 'group' : 'direct',
    name: dto.title ?? primaryUser.name ?? 'Sin nombre',
    avatar: undefined,
    initials: dto.title
      ? dto.title
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : primaryUser.initials,
    participants,
    lastMessage,
    unreadCount: dto.unreadCount ?? 0,
    muted: false,
    updatedAt: new Date(dto.updatedAt),
  };
}

function mapMessageDTOtoMessage(
  dto: MessageDTO | { messageCode: string; conversationCode: string; senderCredentialCode: string; content: string; createdAt: string },
  contactByCredential: Map<string, UserContact>,
  profileByCode: Map<string, ProfileDirectoryEntry>,
): Message {
  const contact = contactByCredential.get(dto.senderCredentialCode);
  const profile = contact ? profileByCode.get(contact.profileCode) : undefined;
  const senderName = profile?.fullName ?? dto.senderCredentialCode;
  return {
    id: 'code' in dto ? dto.code : dto.messageCode,
    conversationId: dto.conversationCode,
    senderId: dto.senderCredentialCode,
    senderName,
    senderAvatar: undefined,
    senderInitials: initialsFromName(senderName),
    text: dto.content,
    createdAt: new Date(dto.createdAt),
    status: (dto.status as Message['status']) ?? 'sent',
    attachments: [],
  };
}

export function useChat(options: UseChatOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { profile } = useProfile(user?.profileCode ?? undefined);

  const currentUser: User = {
    id: user?.credentialCode ?? options.currentUser?.id ?? DEFAULT_CURRENT_USER.id,
    name: profile?.fullName ?? options.currentUser?.name ?? DEFAULT_CURRENT_USER.name,
    avatar: undefined,
    initials: initialsFromName(profile?.fullName ?? options.currentUser?.name ?? DEFAULT_CURRENT_USER.name),
    status: 'online',
    color: 'blue',
  };

  const { data: contacts = [] } = useQuery({
    queryKey: queryKeys.contacts(),
    queryFn: () => chatApi.listContacts(),
    enabled: !!user?.credentialCode,
  });
  const { data: profileDirectory = [] } = useQuery({
    queryKey: queryKeys.profiles,
    queryFn: chatApi.listProfiles,
    enabled: !!user?.credentialCode,
  });
  const contactByCredential = useMemo(
    () => new Map(contacts.map((contact) => [contact.credentialCode, contact])),
    [contacts],
  );
  const profileByCode = useMemo(
    () => new Map(profileDirectory.map((entry) => [entry.id, entry])),
    [profileDirectory],
  );

  // Consultar conversaciones vía TanStack Query
  const {
    data: dtoConversations,
    isLoading: convLoading,
    refetch: refetchConversations,
  } = useQuery<ConversationListDTO>({
    queryKey: queryKeys.conversations,
    queryFn: () => chatApi.listConversations({ limit: 50 }),
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Consultar mensajes de la conversación activa
  const {
    data: apiMessages,
    isLoading: msgLoading,
  } = useQuery<MessageListDTO>({
    queryKey: queryKeys.messages(activeConversationId ?? ''),
    queryFn: () => chatApi.listMessages(activeConversationId ?? '', { limit: 50 }),
    enabled: !!activeConversationId,
  });

  // Mutación para enviar mensajes
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationCode, content }: { conversationCode: string; content: string }) =>
      chatApi.sendMessage(conversationCode, { content }),
    onSuccess: (_message, variables) => {
      // Invalidar conversaciones y mensajes para refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages(variables.conversationCode),
      });
    },
  });

  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineCredentialCodes, setOnlineCredentialCodes] = useState<Set<string>>(() => new Set());
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(sendMessageMutation.isPending);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const receiptRequestsRef = useRef(new Set<string>());

  const updateReceipt = useCallback((conversationCode: string, messageCode: string) => {
    const timestamp = new Date().toISOString();
    queryClient.setQueryData<MessageListDTO>(queryKeys.messages(conversationCode), (current) => {
      if (!current) return current;
      return {
        ...current,
        messages: current.messages.map((message) => message.code === messageCode
          ? {
              ...message,
              status: 'read',
              deliveredAt: message.deliveredAt ?? timestamp,
              readAt: timestamp,
            }
          : message),
      };
    });
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: ({ messageCode }: { conversationCode: string; messageCode: string }) => chatApi.markMessageRead(messageCode),
    onSuccess: async (_result, variables) => {
      updateReceipt(variables.conversationCode, variables.messageCode);
      await queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
    onError: (_error, variables) => receiptRequestsRef.current.delete(`${variables.messageCode}:read`),
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const conversations = (dtoConversations?.conversations ?? []).map((dto) =>
    mapConversationDTOtoConversation(dto, currentUser.id, contactByCredential, profileByCode, onlineCredentialCodes),
  );

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Socket.io para tiempo real
  const { emitTyping } = useChatSocket({
    onTyping: (payload) => {
      if (payload.isTyping) {
        setTypingUsers((prev) => prev.includes(payload.credentialCode) ? prev : [...prev, payload.credentialCode]);
      } else {
        setTypingUsers((prev) => prev.filter((id) => id !== payload.credentialCode));
      }
    },
    onPresenceOnline: (payload) => {
      setOnlineCredentialCodes((prev) => new Set(prev).add(payload.credentialCode));
    },
    onPresenceOffline: (payload) => {
      setOnlineCredentialCodes((prev) => {
        const next = new Set(prev);
        next.delete(payload.credentialCode);
        return next;
      });
    },
    onMessageReceived: (message) => {
      const event = message as MessageDTO | { messageCode: string; conversationCode: string; senderCredentialCode: string; content: string; createdAt: string };
      if (event.conversationCode === activeConversationId) {
        const mapped = mapMessageDTOtoMessage(event, contactByCredential, profileByCode);
        setLocalMessages((prev) => prev.some((item) => item.id === mapped.id)
          ? prev.map((item) => item.id === mapped.id ? { ...item, ...mapped } : item)
          : [...prev, mapped]);
      }
    },
    onRealtimeEvent: (eventName, payload) => {
      if (!eventName.startsWith('chat.message.') && !eventName.startsWith('chat.conversation.')) return;
      const event = payload as { conversationCode?: string } | null;
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      if (activeConversationId && (!event?.conversationCode || event.conversationCode === activeConversationId)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages(activeConversationId) });
      }
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages]);

  // Sincronizar mensajes de la API con el estado local
  useEffect(() => {
    setLocalMessages((apiMessages?.messages ?? []).map((m) => mapMessageDTOtoMessage(m, contactByCredential, profileByCode)));
  }, [apiMessages, contacts, profileDirectory]);

  useEffect(() => {
    for (const message of apiMessages?.messages ?? []) {
      if (message.senderCredentialCode === currentUser.id) continue;
      if (!receiptRequestsRef.current.has(`${message.code}:read`)) {
        receiptRequestsRef.current.add(`${message.code}:read`);
        markReadMutation.mutate({ conversationCode: message.conversationCode, messageCode: message.code });
      }
    }
  }, [apiMessages, currentUser.id]);

  const selectConversation = useCallback(
    (id: string) => {
      setActiveConversationId(id);
    },
    [],
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !activeConversationId) return;

      const tempMessage: Message = {
        id: `msg-temp-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderInitials: currentUser.initials,
        text,
        createdAt: new Date(),
        status: 'sending',
        attachments: [],
      };

      setLocalMessages((prev) => [...prev, tempMessage]);
      setInputValue('');
      setIsSending(true);

      sendMessageMutation
        .mutateAsync({ conversationCode: activeConversationId, content: text })
        .then((saved) => {
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === tempMessage.id && saved
                ? mapMessageDTOtoMessage(saved, contactByCredential, profileByCode)
                : m,
            ),
          );
          setIsSending(false);
        })
        .catch(() => {
          setLocalMessages((prev) => prev.filter((message) => message.id !== tempMessage.id));
          setIsSending(false);
        });
    },
    [activeConversationId, currentUser, sendMessageMutation, contactByCredential, profileByCode],
  );

  const setTyping = useCallback((userId: string, isTyping: boolean) => {
    if (activeConversationId) {
      emitTyping(activeConversationId, isTyping);
    }
    setTypingUsers((prev) => {
      if (isTyping) {
        return prev.includes(userId) ? prev : [...prev, userId];
      }
      return prev.filter((id) => id !== userId);
    });
  }, [activeConversationId, emitTyping]);

  return {
    currentUser,
    conversations,
    activeConversation,
    activeConversationId,
    messages: localMessages,
    typingUsers,
    inputValue,
    isSending: isSending || convLoading || msgLoading,
    setInputValue,
    selectConversation,
    sendMessage,
    setTyping,
    messagesEndRef: messagesEndRef as RefObject<HTMLDivElement | null>,
    refetchConversations,
  };
}
