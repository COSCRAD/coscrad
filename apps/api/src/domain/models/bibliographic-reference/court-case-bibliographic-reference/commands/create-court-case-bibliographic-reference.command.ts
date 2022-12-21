import { Command } from '@coscrad/commands';
import { NonEmptyString, RawDataObject, URL, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../types/AggregateId';
import { ICreateCommand } from '../../../shared/command-handlers/interfaces/create-command.interface';

const isOptional = true;

@Command({
    type: 'CREATE_COURT_CASE_BIBLIOGRAPHIC_REFERENCE',
    label: 'Create Court Case Bibliographic Reference',
    description: 'Creates a new court case bibliographic reference',
})
export class CreateCourtCaseBibliographicReference implements ICreateCommand {
    @UUID({
        label: 'ID (generated)',
        description: 'a unique identifier for the new court case bibliographic reference',
    })
    readonly id: AggregateId;

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
