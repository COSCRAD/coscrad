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
    @UUID()
    readonly id: AggregateId;

    @RawDataObject({ isOptional })
    readonly rawData?: Record<string, unknown>;

    /**
     * The following props are essentially a `BookBibliographicReferenceData` DTO.
     * We define them independently, however, to avoid coupling the domain model
     * to the command payload. Amongst other concerns, this forces us to be
     * explicit about changes.
     *
     * This is why we ignore command.ts files in Sonar Cloud.
     */
    @NonEmptyString()
    readonly title: string;

    @IsNonEmptyArray()
    @NestedDataType(BibliographicReferenceCreator, { isArray: true })
    readonly creators: BibliographicReferenceCreator[];

    @NonEmptyString({ isOptional })
    // `abstractNote` is what Zotero calls this property
    readonly abstract?: string;

    @Year({ isOptional })
    readonly year?: number;

    @NonEmptyString({ isOptional })
    readonly publisher?: string;

    @NonEmptyString({ isOptional })
    readonly place?: string;

    @URL({ isOptional })
    readonly url?: string;

    @PositiveInteger({ isOptional })
    readonly numberOfPages?: number;

    @ISBN({ isOptional })
    readonly isbn?: string;
}
