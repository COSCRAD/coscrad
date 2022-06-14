import { NonEmptyString } from '@coscrad/data-types';
import { IsStringWithNonzeroLength } from '@coscrad/validation';
import { DTO } from '../../../types/DTO';
import BaseDomainModel from '../BaseDomainModel';

export class ContributorAndRole extends BaseDomainModel {
    /**
     * TODO []
     * Make this a `UUID` instead when creating a proper Contributors model.
     */
    @NonEmptyString()
    @IsStringWithNonzeroLength()
    readonly contributorId: string;

    @NonEmptyString()
    @IsStringWithNonzeroLength()
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
