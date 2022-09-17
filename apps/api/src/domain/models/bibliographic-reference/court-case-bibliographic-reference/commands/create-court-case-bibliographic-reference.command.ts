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
    @UUID()
    readonly id: AggregateId;

    @RawDataObject({ isOptional })
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

    @NonEmptyString()
    readonly caseName: string;

    /**
     * TODO [https://www.pivotaltracker.com/story/show/183109468]
     * Support non-empty array based on `isOptional`.
     */
    @NonEmptyString({ isOptional: true })
    readonly abstract?: string;

    @NonEmptyString({ isOptional: true })
    readonly dateDecided?: string;

    @NonEmptyString({ isOptional: true })
    readonly court?: string;

    @URL({ isOptional: true })
    readonly url?: string;

    @NonEmptyString({ isOptional: true })
    readonly pages?: string;
}
