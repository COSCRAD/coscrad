import { NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../../../types/DTO';
import BaseDomainModel from '../../../../BaseDomainModel';

export class FullName extends BaseDomainModel {
    @NonEmptyString()
    readonly firstName: string;

    @NonEmptyString()
    readonly lastName: string;

    constructor(dto: DTO<FullName>) {
        super();

        if (!dto) return;

        const { firstName, lastName } = dto;

        this.firstName = firstName;

        this.lastName = lastName;
    }
}
