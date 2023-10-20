import { NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../types/DTO';
import BaseDomainModel from '../BaseDomainModel';
import { PageIdentifier } from './page-identifier';

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

        this.identifier = identifier;
    }

    changeIdentifier(newIdentifier: PageIdentifier): DigitalTextPage {
        return this.clone<DigitalTextPage>({
            identifier: newIdentifier,
        });
    }
}
