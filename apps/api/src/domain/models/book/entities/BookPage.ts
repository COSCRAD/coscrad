import { PartialDTO } from 'apps/api/src/types/partial-dto';
import BaseDomainModel from '../../BaseDomainModel';
import { PageIdentifier } from './types/PageIdentifier';

export default class BookPage extends BaseDomainModel {
    readonly identifier: PageIdentifier;

    readonly text: string;

    readonly translation: string;

    constructor({ identifier, text, translation }: PartialDTO<BookPage>) {
        super();

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
