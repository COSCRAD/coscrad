import { IsStringWithNonzeroLength } from '@coscrad/validation';
import { DTO } from '../../../types/DTO';
import BaseDomainModel from '../BaseDomainModel';

export class ContributorAndRole extends BaseDomainModel {
    @IsStringWithNonzeroLength()
    readonly contributorId: string;

    @IsStringWithNonzeroLength()
    readonly role: string;

    constructor({ contributorId, role }: DTO<ContributorAndRole>) {
        super();

        this.contributorId = contributorId;

        this.role = role;
    }
}
