import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { RegisterDigitalRepresentationOfBibliographicCitation } from './register-digital-representation-of-bibliographic-ciation.command';

export type DigitalRepresentationOfBibliographicCitationRegisteredPayload =
    RegisterDigitalRepresentationOfBibliographicCitation;

export class DigitalRepresentationOfBibliographicCitationRegistered extends BaseEvent<DigitalRepresentationOfBibliographicCitationRegisteredPayload> {
    type = `DIGITAL_REPRESENTATION_OF_BIBLIOGRAPHIC_CITATION_REGISTERED`;
}
