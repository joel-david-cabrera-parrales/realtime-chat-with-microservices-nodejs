import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/hooks/useAuth';
import { chatApi } from '@/shared/api/chat-api';
import { queryKeys } from '@/shared/api/queryKeys';
import type { ConversationDTO } from '../dto';
import type { ProfileDirectoryEntry, UserContact } from '@/auth/types';

const cx = (...parts: Array<string | false | undefined>): string =>
  parts.filter(Boolean).join(' ');

interface UserSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: ConversationDTO) => void | Promise<void>;
}

interface ContactOption {
  profile: ProfileDirectoryEntry;
  contact: UserContact;
}

export function UserSelectorModal({
  open,
  onClose,
  onConversationCreated,
}: UserSelectorModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: profiles = [], isLoading: profilesLoading, error: profilesError } = useQuery({
    queryKey: queryKeys.profiles,
    queryFn: chatApi.listProfiles,
    enabled: open,
  });
  const { data: contacts = [], isLoading: contactsLoading, error: contactsError } = useQuery({
    queryKey: queryKeys.contacts(),
    queryFn: () => chatApi.listContacts(),
    enabled: open && !!user?.credentialCode,
  });

  const contactsByProfileCode = useMemo(
    () => new Map(contacts.map((contact) => [contact.profileCode, contact])),
    [contacts],
  );
  const contactOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return profiles.flatMap((profile) => {
      const contact = contactsByProfileCode.get(profile.id);
      if (!contact || profile.id === user?.profileCode) return [];
      const matches = !normalizedSearch ||
        profile.fullName.toLocaleLowerCase().includes(normalizedSearch);
      return matches ? [{ profile, contact }] : [];
    });
  }, [profiles, contactsByProfileCode, search, user?.profileCode]);

  const createConversationMutation = useMutation({
    mutationFn: (contact: UserContact) => {
      if (!user?.credentialCode) throw new Error('No se encontró la credencial de la sesión. Vuelve a iniciar sesión.');
      return chatApi.createConversation({
        type: 'direct',
        participantCredentialCodes: [user.credentialCode, contact.credentialCode],
      });
    },
    onSuccess: async (conversation) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      await onConversationCreated(conversation);
      onClose();
    },
  });

  if (!open) return null;

  const loading = profilesLoading || contactsLoading;
  const error = profilesError ?? contactsError ?? createConversationMutation.error;

  const handleCreateConversation = (contact: UserContact) => {
    createConversationMutation.mutate(contact);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="new-chat-title">
      <button
        type="button"
        aria-label="Cerrar selector de usuarios"
        className="fixed inset-0 cursor-default bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 flex w-full max-w-md flex-col rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 id="new-chat-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            Nueva conversación
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-4">
          <label className="sr-only" htmlFor="contact-search">Buscar usuarios</label>
          <input
            id="contact-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre"
            className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
          />

          {error && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error instanceof Error ? error.message : 'No se pudieron cargar los contactos.'}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
              Cargando usuarios…
            </div>
          ) : contactOptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined mb-2 text-3xl text-slate-400">people_outline</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {search ? 'No hay contactos que coincidan con la búsqueda' : 'No hay usuarios disponibles para iniciar una conversación'}
              </p>
            </div>
          ) : (
            <div className="max-h-[400px] space-y-1 overflow-y-auto">
              {contactOptions.map(({ profile, contact }: ContactOption) => {
                const isCreating = createConversationMutation.isPending &&
                  createConversationMutation.variables?.credentialCode === contact.credentialCode;
                return (
                  <button
                    key={contact.credentialCode}
                    type="button"
                    disabled={createConversationMutation.isPending}
                    onClick={() => handleCreateConversation(contact)}
                    className={cx(
                      'flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left transition-colors disabled:cursor-wait',
                      isCreating ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40',
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-white">
                      {initialsFromName(profile.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white" title={profile.fullName}>
                        {profile.fullName}
                      </p>
                    </div>
                    {isCreating && <span className="material-symbols-outlined animate-pulse text-blue-500">hourglass_bottom</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
          <button type="button" onClick={onClose} className="w-full rounded-lg py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function initialsFromName(name: string): string {
  return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) || 'U';
}
