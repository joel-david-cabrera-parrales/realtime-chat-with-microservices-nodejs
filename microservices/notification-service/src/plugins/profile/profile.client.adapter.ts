import { HttpClientService } from "../../shared/domain/http.client.service";
import { ProfileClientService, ProfileContact } from "../../shared/domain/profile.client.service";

interface ProfileOutput {
  id: string;
  fullName: string;
  email: string;
}

export class ProfileClientAdapter extends ProfileClientService {
  constructor(private readonly httpClient: HttpClientService) {
    super();
  }

  public async getByCode(profileCode: string): Promise<ProfileContact> {
    console.log("[notification-profile] consultando perfil", { profileCode });
    const profile = await this.httpClient.get<ProfileOutput>(`/${profileCode}`);
    console.log("[notification-profile] perfil recibido", profile);

    return {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
    };
  }
}
