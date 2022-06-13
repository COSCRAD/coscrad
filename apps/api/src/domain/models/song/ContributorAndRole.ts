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

    constructor({ contributorId, role }: DTO<ContributorAndRole>) {
        super();

        this.contributorId = contributorId;

        this.role = role;
    }
}
