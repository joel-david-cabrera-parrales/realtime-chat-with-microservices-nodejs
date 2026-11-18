export const queryKeys = {
  profiles: ['profiles'],
  profile: (profileCode: string) => ['profile', profileCode],
  contacts: (search = '') => ['contacts', search],
  conversations: ['conversations'],
  messages: (conversationCode: string) => ['messages', conversationCode],
};
