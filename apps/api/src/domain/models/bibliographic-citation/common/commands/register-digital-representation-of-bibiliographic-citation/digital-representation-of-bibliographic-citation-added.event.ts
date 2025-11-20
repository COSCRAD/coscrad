import { CoscradEvent } from '../../../../../../domain/common';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { RegisterDigitalRepresentationOfBibliographicCitation } from './register-digital-representation-of-bibliographic-citation.command';

export type DigitalRepresentationOfBibliographicCitationRegisteredPayload =
    RegisterDigitalRepresentationOfBibliographicCitation;

const eventType = `DIGITAL_REPRESENTATION_OF_BIBLIOGRAPHIC_CITATION_REGISTERED`;

@CoscradEvent(eventType)
export class DigitalRepresentationOfBibliographicCitationRegistered extends BaseEvent<DigitalRepresentationOfBibliographicCitationRegisteredPayload> {
    readonly type = eventType;
}
