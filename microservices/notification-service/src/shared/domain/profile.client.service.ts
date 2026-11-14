export interface ProfileContact {
  id: string;
  fullName: string;
  email: string;
}

export abstract class ProfileClientService {
  public abstract getByCode(profileCode: string): Promise<ProfileContact>;
}
