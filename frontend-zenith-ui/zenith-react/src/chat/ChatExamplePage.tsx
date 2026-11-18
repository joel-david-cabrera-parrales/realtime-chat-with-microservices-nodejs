import { useState } from 'react';
import { ChatApp } from '@/chat/components/ChatApp';
import { useChat } from '@/chat/hooks/useChat';
import { UserSelectorModal } from '@/chat/components/UserSelectorModal';
import type { ConversationDTO } from '@/chat/dto';
export const ChatExamplePage = () => {
  const {
    currentUser,
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
    refetchConversations,
  } = useChat();

  const [showUserSelector, setShowUserSelector] = useState(false);

  const handleNewConversation = async (conversation: ConversationDTO) => {
    // Refrescar la lista de conversaciones y seleccionar la nueva
    await refetchConversations();
    selectConversation(conversation.code);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950">
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
        onNewConversation={() => setShowUserSelector(true)}
      />

      <UserSelectorModal
        open={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        onConversationCreated={async (conversation) => {
          setShowUserSelector(false);
          await handleNewConversation(conversation);
        }}
      />
    </div>
  );
}
