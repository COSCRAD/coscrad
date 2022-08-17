import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { PageIdentifier } from './types/PageIdentifier';

export default class BookPage extends BaseDomainModel {
    readonly identifier: PageIdentifier;

    readonly text: string;

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
