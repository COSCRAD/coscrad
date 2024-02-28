import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../../test-data/events';
import { DeepPartial } from '../../../../../../../types/DeepPartial';
import { LineItemTranslated, LineItemTranslatedPayload } from '../../../commands';

export const buildLineItemTranslated = (
    payloadOverrides: DeepPartial<LineItemTranslatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: LineItemTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: buildDummyUuid(1),
        },
        inPointMilliseconds: 100,
        outPointMilliseconds: 1200,
        translation: 'This is what was said at this point',
        languageCode: LanguageCode.English,
    };

    return new LineItemTranslated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
