import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../domain/common';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { RegisterDigitalRepresentationOfBibliographicCitation } from './register-digital-representation-of-bibliographic-citation.command';

export type DigitalRepresentationOfBibliographicCitationRegisteredPayload =
    RegisterDigitalRepresentationOfBibliographicCitation;

const eventType = `DIGITAL_REPRESENTATION_OF_BIBLIOGRAPHIC_CITATION_REGISTERED`;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<DigitalRepresentationOfBibliographicCitationRegistered>({
    example: {
        id: testEventId,
        type: 'DIGITAL_REPRESENTATION_OF_BIBLIOGRAPHIC_CITATION_REGISTERED',
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            userId: buildDummyUuid(123),
        },
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.bibliographicCitation,
                id: buildDummyUuid(23),
            },
            digitalRepresentationResourceCompositeIdentifier: {
                type: ResourceType.digitalText,
                id: buildDummyUuid(65),
            },
        },
    },
})
@CoscradEvent(eventType)
export class DigitalRepresentationOfBibliographicCitationRegistered extends BaseEvent<DigitalRepresentationOfBibliographicCitationRegisteredPayload> {
    readonly type = eventType;
}
