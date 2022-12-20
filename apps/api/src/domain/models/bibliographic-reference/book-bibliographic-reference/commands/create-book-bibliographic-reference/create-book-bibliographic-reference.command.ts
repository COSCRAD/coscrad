import { Command } from '@coscrad/commands';
import {
    ISBN,
    NestedDataType,
    NonEmptyString,
    PositiveInteger,
    RawDataObject,
    URL,
    UUID,
    Year,
} from '@coscrad/data-types';
import { IsNonEmptyArray } from '@coscrad/validation';
import { AggregateId } from '../../../../../types/AggregateId';
import { ICreateCommand } from '../../../../shared/command-handlers/interfaces/create-command.interface';
import BibliographicReferenceCreator from '../../../common/bibliographic-reference-creator.entity';

// convenient shorthand
const isOptional = true;

@Command({
    type: 'CREATE_BOOK_BIBLIOGRAPHIC_REFERENCE',
    label: 'Create Book Bibliographic Reference',
    description: 'Creates a new book bibliographic reference',
})
export class CreateBookBibliographicReference implements ICreateCommand {
    @UUID({
        label: 'ID (generated)',
        description: 'unique identifier for the new book bibliographic reference',
    })
    readonly id: AggregateId;

    @RawDataObject({
        isOptional,
        label: 'raw data',
        description: 'raw data from a third-party system (e.g. Zotero)',
    })
    readonly rawData?: Record<string, unknown>;

    /**
     * The following props are essentially a `BookBibliographicReferenceData` DTO.
     * We define them independently, however, to avoid coupling the domain model
     * to the command payload. Amongst other concerns, this forces us to be
     * explicit about changes.
     *
     * This is why we ignore command.ts files in Sonar Cloud.
     */
    @NonEmptyString({
        label: 'title',
        description: 'title of the book in any language',
    })
    readonly title: string;

    // We might consider sharing some of the property annotation with the domain model.
    @IsNonEmptyArray()
    @NestedDataType(BibliographicReferenceCreator, {
        isArray: true,
        label: 'creators',
        description: 'the authors of the referenced book',
    })
    readonly creators: BibliographicReferenceCreator[];

    @NonEmptyString({
        isOptional,
        label: 'abstract',
        description: 'a brief summary of the referenced book',
    })
    // `abstractNote` is what Zotero calls this property
    readonly abstract?: string;

    @Year({
        isOptional,
        label: 'year',
        description: 'a number representing the year the referenced book was published',
    })
    readonly year?: number;

    @NonEmptyString({
        isOptional,
        label: 'publisher',
        description: 'the publisher who published the referenced book',
    })
    readonly publisher?: string;

    @NonEmptyString({
        isOptional,
        label: 'place of publication',
        description: 'the place where the referenced book was published',
    })
    readonly place?: string;

    @URL({
        isOptional,
        label: 'external link',
        description: 'a link to an external digital representation of the book',
    })
    readonly url?: string;

    @PositiveInteger({
        isOptional,
        label: 'number of pages',
        description: 'the number of pages in the referenced book',
    })
    readonly numberOfPages?: number;

    @ISBN({ isOptional, label: 'ISBN', description: 'the ISBN  of the referenced book' })
    readonly isbn?: string;
}
