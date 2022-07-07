import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../../types/DTO';
import BaseDomainModel from '../../../BaseDomainModel';

type Name = unknown;

type ContactInfo = unknown;

export class CoscradUserProfile extends BaseDomainModel {
    readonly email: string;

    readonly name: Name;

    readonly contact?: ContactInfo;

    readonly dateOfBirth?: string;

    readonly communityConnection: string;

    constructor(dto: DTO<CoscradUserProfile>) {
        super();

        if (!dto) return;

        const { email, name, contact, dateOfBirth, communityConnection } = dto;

        this.email = email;

        this.name = cloneToPlainObject(name);

        this.contact = cloneToPlainObject(contact);

        this.dateOfBirth = dateOfBirth;

        this.communityConnection = communityConnection;
    }
}
