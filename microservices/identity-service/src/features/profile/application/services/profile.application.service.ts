import { EmailAlreadyExistsException } from "../../domain/exceptions/email-already-exists.exception";
import { ProfileOutput } from "../use-cases/dtos/profile-output.dto";
import { CreateProfileInput } from "../use-cases/dtos/create-profile.dto";
import { CreateProfileUseCase } from "../../domain/use-cases/create-profile.use-case";
import { GetProfileUseCase } from "../../domain/use-cases/get-profile.use-case";
import { ExistsProfileUseCase } from "../../domain/use-cases/exists-profile.use-case";
import { ExistsProfileByEmailUseCase } from "../../domain/use-cases/exists-profile-by-email.use-case";
import { UpdateProfileUseCase } from "../../domain/use-cases/update-profile.use-case";
import { DeleteProfileUseCase } from "../../domain/use-cases/delete-profile.use-case";
import { ListProfilesUseCase } from "../../domain/use-cases/list-profiles.use-case";
import { UnitOfWork } from "../../../../shared/domain/services/unit-of-work";
import { ProfileApplicationServiceContract } from "../contracts/profile.application.service.contract";
import { UpdateProfileProps } from "../../domain/interfaces/profile.interface";
import { UploadAvatarInput, UploadAvatarUseCase } from "../../domain/use-cases/upload-avatar.use-case";
import { FileClientService } from "../../../../shared/domain/services/file.client.service";
import { ProfileNotFoundException } from "../../domain/exceptions/profile-not-found.exception";
import { ListProfilesOutput } from "../../domain/use-cases/dtos/list-profiles-output.dto";
import { DomainEventPublisher } from "../../../../shared/domain/events/domain-event-publisher";
import { UserUpdatedEvent } from "../../../session/domain/events/user-updated.event";
import { CredentialRepository } from "../../../session/domain/repositories/credential.repository";
import { ProfileCode } from "../../../session/domain/value-objects/profile-code.value-object";
import { AuthenticationTypeCode } from "../../../session/domain/constants/authentication-type.constants";

export class ProfileApplicationService extends ProfileApplicationServiceContract {
  constructor(
    private readonly createProfileUseCase: CreateProfileUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly existsProfileUseCase: ExistsProfileUseCase,
    private readonly existsProfileByEmailUseCase: ExistsProfileByEmailUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly deleteProfileUseCase: DeleteProfileUseCase,
    private readonly listProfilesUseCase: ListProfilesUseCase,
    private readonly unitOfWork: UnitOfWork,
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
    private readonly fileClient: FileClientService,
    private readonly domainEventPublisher: DomainEventPublisher,
    private readonly credentialRepository: CredentialRepository,
  ) {
    super();
  }

  public async create(input: CreateProfileInput): Promise<ProfileOutput> {
    const profile = await this.unitOfWork.execute(async () => {
      const emailExists = await this.existsProfileByEmailUseCase.execute(input.email);

      if (emailExists) throw new EmailAlreadyExistsException(input.email);

      return this.createProfileUseCase.execute(input);
    });

    return {
      id: profile.id.value,
      fullName: profile.fullName.value,
      email: profile.email.value,
      phone: profile.phone?.value ?? null,
      birthDate: profile.birthDate?.value ?? null,
      gender: profile.gender?.value ?? null,
      bio: profile.bio?.value ?? null,
      avatarFileCode: profile.avatarFileCode?.value ?? null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  public getById(id: string): Promise<ProfileOutput | null> {
    return this.getProfileUseCase.execute(id).then((profile) => profile?.toPrimitives() ?? null);
  }

  public exists(id: string): Promise<boolean> {
    return this.existsProfileUseCase.execute(id);
  }

  public existsByEmail(email: string): Promise<boolean> {
    return this.existsProfileByEmailUseCase.execute(email);
  }

  public list(): Promise<ListProfilesOutput> {
    return this.listProfilesUseCase.execute();
  }

  public async update(id: string, changes: UpdateProfileProps): Promise<ProfileOutput> {
    const profile = await this.unitOfWork.execute(async () => {
      if (!(await this.existsProfileUseCase.execute(id))) {
        throw new ProfileNotFoundException(id);
      }
      return this.updateProfileUseCase.execute(id, changes);
    });

    const output = {
      id: profile.id.value,
      fullName: profile.fullName.value,
      email: profile.email.value,
      phone: profile.phone?.value ?? null,
      birthDate: profile.birthDate?.value ?? null,
      gender: profile.gender?.value ?? null,
      bio: profile.bio?.value ?? null,
      avatarFileCode: profile.avatarFileCode?.value ?? null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };

    await this.emitUserUpdatedEvent(profile.id.value, output);

    return output;
  }

  public async delete(id: string): Promise<void> {
    await this.unitOfWork.execute(async () => {
      if (!(await this.existsProfileUseCase.execute(id))) {
        throw new ProfileNotFoundException(id);
      }
      await this.deleteProfileUseCase.execute(id);
    });

    await this.fileClient.deleteProfilePhoto(id).catch(() => undefined);
  }

  public async uploadAvatar(input: UploadAvatarInput): Promise<ProfileOutput> {
    const profile = await this.uploadAvatarUseCase.execute(input);
    const output = profile.toPrimitives();
    await this.emitUserUpdatedEvent(profile.id.value, output);
    return output;
  }

  private async emitUserUpdatedEvent(profileCode: string, profileData: ProfileOutput): Promise<void> {
    const credential = await this.credentialRepository.findByProfileCode(ProfileCode.create(profileCode));
    if (!credential) return;

    const event = new UserUpdatedEvent({
      credentialCode: credential.code.value,
      credentialId: credential.id.value,
      username: credential.username.value,
      profileCode: credential.profileCode.value,
      authenticationType: credential.authenticationType,
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
      birthDate: profileData.birthDate,
      gender: profileData.gender,
      avatarFileCode: profileData.avatarFileCode,
      occurredAt: new Date(),
    });

    await this.domainEventPublisher.publish([event]);
  }
}
