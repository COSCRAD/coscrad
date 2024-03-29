import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    ISBN,
    NestedDataType,
    NonEmptyString,
    PositiveInteger,
    RawDataObject,
    URL,
    Year,
} from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../../types/AggregateType';
import BibliographicCitationCreator from '../../../common/bibliographic-citation-creator.entity';
import { BibliographicCitationCompositeIdentifier } from '../../../shared/bibliographic-citation-composite-identifier';

// convenient shorthand
const isOptional = true;

@Command({
    type: 'CREATE_BOOK_BIBLIOGRAPHIC_CITATION',
    label: 'Create Book Bibliographic Citation',
    description: 'Creates a new book bibliographic citation',
})
export class CreateBookBibliographicCitation implements ICommandBase {
    @NestedDataType(BibliographicCitationCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<
        typeof AggregateType.bibliographicCitation
    >;

    @RawDataObject({
        isOptional,
        label: 'raw data',
        description: 'raw data from a third-party system (e.g. Zotero)',
    })
    readonly rawData?: Record<string, unknown>;

    /**
     * The following props are essentially a `BookBibliographicCitationData` DTO.
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

    @NestedDataType(BibliographicCitationCreator, {
        isArray: true,
        // i.e. must not be empty
        isOptional: false,
        label: 'creators',
        description: 'the authors of the referenced book',
    })
    readonly creators: BibliographicCitationCreator[];

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
