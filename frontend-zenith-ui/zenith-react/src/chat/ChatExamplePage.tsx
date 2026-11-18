import { ChatApp } from '@/chat/components/ChatApp';
import { useChat } from '@/chat/hooks/useChat';
import { useAuth } from '@/shared/hooks/useAuth';
import { useProfile } from '@/shared/hooks/useProfile';
import type { User } from '@/chat/types';

export const ChatExamplePage = () => {
  const { user } = useAuth();

  // Consumir el endpoint de perfil del user-profile-service vía API Gateway
  const { profile } = useProfile(user?.profileCode ?? undefined);

  // Mapear el perfil del backend al User del chat
  const currentUser: User = profile
    ? {
        id: profile.id,
        name: profile.fullName,
        avatar: undefined,
        initials:
          profile.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U',
        status: 'online',
        color: 'blue',
      }
    : {
        id: 'user-me',
        name: 'Alex Rivera',
        initials: 'AR',
        status: 'online',
        color: 'blue',
      };

  const {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    typingUsers,
    inputValue,
    isSending,
    setInputValue,
    selectConversation,
    sendMessage,
    setTyping,
    messagesEndRef,
  } = useChat({ currentUser });

  return (
    <ChatApp
      currentUser={currentUser}
      conversations={conversations}
      activeConversation={activeConversation}
      activeConversationId={activeConversationId}
      messages={messages}
      typingUsers={typingUsers}
      inputValue={inputValue}
      isSending={isSending}
      setInputValue={setInputValue}
      selectConversation={selectConversation}
      sendMessage={sendMessage}
      setTyping={setTyping}
      messagesEndRef={messagesEndRef}
    />
  );
}
