import { NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { PageIdentifier } from './types/PageIdentifier';

export default class BookPage extends BaseDomainModel {
    @NonEmptyString()
    readonly identifier: PageIdentifier;

    @NonEmptyString()
    readonly text: string;

    @NonEmptyString()
    readonly translation: string;

    constructor(dto: DTO<BookPage>) {
        super();

        if (!dto) return;

        const { identifier, text, translation } = dto;

        this.identifier = identifier;

        this.text = text;

        this.translation = translation;
    }

    changeIdentifier(newIdentifier: PageIdentifier): BookPage {
        return this.clone<BookPage>({
            identifier: newIdentifier,
        });
    }
}
