import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../../../types/DTO';
import BaseDomainModel from '../../../../base-domain-model.entity';
import { FullName } from './full-name.entity';

export class CoscradUserProfile extends BaseDomainModel {
    /**
     * TODO [https://www.pivotaltracker.com/story/show/182703183]
     * Add an `Email` `Coscrad Data Type`, and tighten the validation rules.
     */
    @NonEmptyString({
        label: 'email',
        description: "the user's email address",
    })
    readonly email: string;

    @NestedDataType(FullName, {
        label: 'full name',
        description: "the user's full name",
    })
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
