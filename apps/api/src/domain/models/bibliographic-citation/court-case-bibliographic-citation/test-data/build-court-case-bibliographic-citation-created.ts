import { AggregateType } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    CourtCaseBibliographicCitationCreated,
    CourtCaseBibliographicCitationCreatedPayload,
} from '../commands/create-court-case-bibliographic-citation';

export const buildCourtCaseBibliographicCitationCreated = (
    payloadOverrides: DeepPartial<CourtCaseBibliographicCitationCreatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: CourtCaseBibliographicCitationCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.bibliographicCitation,
            id: buildDummyUuid(1),
        },
        caseName: 'British Columbia vs. John Smith',
        // We omit optional properties so cloning will be easier
    };

    return new CourtCaseBibliographicCitationCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
