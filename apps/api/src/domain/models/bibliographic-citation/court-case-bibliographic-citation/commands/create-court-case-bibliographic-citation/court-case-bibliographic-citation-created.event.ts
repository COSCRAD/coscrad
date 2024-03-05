import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { CreateCourtCaseBibliographicCitation } from './create-court-case-bibliographic-citation.command';

export type CourtCaseBibliographicCitationCreatedPayload = CreateCourtCaseBibliographicCitation;

export class CourtCaseBibliographicCitationCreated extends BaseEvent<CourtCaseBibliographicCitationCreatedPayload> {
    readonly type = 'COURT_CASE_BIBLIOGRAPHIC_CITATION_CREATED';
}
