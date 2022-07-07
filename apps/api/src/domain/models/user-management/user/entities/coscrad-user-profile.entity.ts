import { DTO } from '../../../../../types/DTO';
import BaseDomainModel from '../../../BaseDomainModel';
import { FullName } from './full-name.entity';

export class CoscradUserProfile extends BaseDomainModel {
    readonly email: string;

    readonly name: FullName;

    // readonly contact?: ContactInfo;

    // readonly dateOfBirth?: string;

    // readonly communityConnection: string;

    constructor(dto: DTO<CoscradUserProfile>) {
        super();

        if (!dto) return;

        const { email, name: nameDto } = dto;

        this.email = email;

        this.name = new FullName(nameDto);
    }
}
