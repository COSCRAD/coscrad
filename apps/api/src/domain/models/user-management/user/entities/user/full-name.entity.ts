import { NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../../../types/DTO';
import BaseDomainModel from '../../../../BaseDomainModel';

export class FullName extends BaseDomainModel {
    @NonEmptyString({
        label: 'first name',
        description: "the user's first name",
    })
    readonly firstName: string;

    @NonEmptyString({
        label: 'last name',
        description: "the user's last name",
    })
    readonly lastName: string;

    constructor(dto: DTO<FullName>) {
        super();

        if (!dto) return;

        const { firstName, lastName } = dto;

        this.firstName = firstName;

        this.lastName = lastName;
    }

    toString(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
