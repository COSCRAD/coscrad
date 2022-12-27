import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, RawDataObject, URL, UUID } from '@coscrad/data-types';
import { Equals } from 'class-validator';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../types/AggregateType';
import { ICreateCommand } from '../../../shared/command-handlers/interfaces/create-command.interface';

class CourtCaseBibliographicReferenceCompositeId {
    /**
     * This is a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     */
    @Equals(AggregateType.bibliographicReference)
    type = AggregateType.bibliographicReference;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

const isOptional = true;

@Command({
    type: 'CREATE_COURT_CASE_BIBLIOGRAPHIC_REFERENCE',
    label: 'Create Court Case Bibliographic Reference',
    description: 'Creates a new court case bibliographic reference',
})
export class CreateCourtCaseBibliographicReference implements ICreateCommand {
    @NestedDataType(CourtCaseBibliographicReferenceCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<
        typeof AggregateType.bibliographicReference
    >;

    @RawDataObject({
        isOptional,
        label: 'raw data',
        description: 'raw data from third-party system (e.g. Zotero)',
    })
    // Perhaps this should be part of ICreateCommand?
    readonly rawData?: Record<string, unknown>;

    /**
     * The following props are essentially a `CourtCaseBibliographicReferenceData`
     * DTO. We define them independently, however, to avoid coupling the domain
     * model to the command payload. Amongst other concerns, this forces us to be
     * explicit about changes.
     *
     * This is why we ignore command.ts files in Sonar Cloud.
     */

    @NonEmptyString({
        label: 'case name',
        description: 'the name of the court case',
    })
    readonly caseName: string;

    /**
     * TODO [https://www.pivotaltracker.com/story/show/183109468]
     * Support non-empty array based on `isOptional`.
     */
    @NonEmptyString({
        isOptional: true,
        label: 'abstract',
        description: 'a brief summary of the court case',
    })
    readonly abstract?: string;

    @NonEmptyString({
        isOptional: true,
        label: 'date decided',
        description: 'the date that the court case was decided',
    })
    readonly dateDecided?: string;

    @NonEmptyString({
        isOptional: true,
        label: 'court',
        description: 'name of the court in which the case was decided',
    })
    readonly court?: string;

    @URL({
        isOptional: true,
        label: 'external link',
        description: 'web link to additional information about the court case',
    })
    readonly url?: string;

    @NonEmptyString({
        isOptional: true,
        label: 'pages',
        description: "a summary a larger document's pages relevant to this court case",
    })
    readonly pages?: string;
}
