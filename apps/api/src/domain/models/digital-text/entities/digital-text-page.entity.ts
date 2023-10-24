import { NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { PageIdentifier } from './types/page-identifier';

export default class DigitalTextPage extends BaseDomainModel {
    @NonEmptyString({
        label: 'identifier',
        description: 'text identifier for the page',
    })
    readonly identifier: PageIdentifier;

    constructor(dto: DTO<DigitalTextPage>) {
        super();

        if (!dto) return;

        const { identifier } = dto;

        // Note that this is just a string (stored by value not reference), so there is no need to clone or build an instance
        this.identifier = identifier;
    }
}
