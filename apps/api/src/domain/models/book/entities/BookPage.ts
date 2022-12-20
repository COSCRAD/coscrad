import { NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { PageIdentifier } from './types/PageIdentifier';

export default class BookPage extends BaseDomainModel {
    @NonEmptyString({
        label: 'identifier',
        description: 'text identifier for the page(',
    })
    readonly identifier: PageIdentifier;

    @NonEmptyString({
        label: 'text',
        description: "the page's text in the language",
    })
    readonly text: string;

    @NonEmptyString({
        label: 'translation',
        description: "translation of the page's text into the colonial language",
    })
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
