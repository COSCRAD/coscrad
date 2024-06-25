import { NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../types/DTO';
import BaseDomainModel from '../base-domain-model.entity';

export class ContributorAndRole extends BaseDomainModel {
    /**
     * TODO []
     * Make this a `UUID` instead when creating a proper Contributors model.
     */
    @NonEmptyString({
        label: 'contributor ID',
        description: 'unique identifier of the contributor',
    })
    readonly contributorId: string;

    @NonEmptyString({
        label: 'role',
        description: "a text summary of the contributor's role",
    })
    readonly role: string;

    constructor(dto: DTO<ContributorAndRole>) {
        super();

        // this should only happen in the validation flow
        if (!dto) return;

        const { contributorId, role } = dto;

        this.contributorId = contributorId;

        this.role = role;
    }
}
