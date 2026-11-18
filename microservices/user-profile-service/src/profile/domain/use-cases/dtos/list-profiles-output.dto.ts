export interface ProfileDirectoryEntry {
  id: string;
  fullName: string;
  avatarFileCode: string | null;
}

export interface ListProfilesOutput {
  profiles: ProfileDirectoryEntry[];
}
