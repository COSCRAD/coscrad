import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, RawDataObject, URL } from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../../types/AggregateType';
import { BibliographicCitationCompositeIdentifier } from '../../../shared/bibliographic-citation-composite-identifier';

const isOptional = true;

@Command({
    type: 'CREATE_COURT_CASE_BIBLIOGRAPHIC_CITATION',
    label: 'Create Court Case Bibliographic Citation',
    description: 'Creates a new court case bibliographic citation',
})
export class CreateCourtCaseBibliographicCitation implements ICommandBase {
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
        description: 'raw data from third-party system (e.g. Zotero)',
    })
    // Perhaps this should be part of ICreateCommand?
    readonly rawData?: Record<string, unknown>;

    /**
     * The following props are essentially a `CourtCaseBibliographicCitationData`
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
