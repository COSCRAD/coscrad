import { DTO } from '../../../../../types/DTO';
import BaseDomainModel from '../../../BaseDomainModel';

export class FullName extends BaseDomainModel {
    readonly firstName: string;

    readonly middleNames: string[] = [];

    readonly lastName: string;

    constructor(dto: DTO<FullName>) {
        super();

        if (!dto) return;

        const { firstName, middleNames, lastName } = dto;

        this.firstName = firstName;

        // Array of primitives- shallow clone suffices here
        this.middleNames = [...middleNames];

        this.lastName = lastName;
    }
}
