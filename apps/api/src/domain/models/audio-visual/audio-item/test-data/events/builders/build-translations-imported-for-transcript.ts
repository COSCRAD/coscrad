import { AggregateType } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../../test-data/events';
import { DeepPartial } from '../../../../../../../types/DeepPartial';
import {
    TranslationsImportedForTranscript,
    TranslationsImportedForTranscriptPayload,
} from '../../../commands';

export const buildTranslationsImportedForTranscript = (
    payloadOverrides: DeepPartial<TranslationsImportedForTranscriptPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: TranslationsImportedForTranscriptPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: buildDummyUuid(1),
        },
        // we leave this blank to make it easy to override
        translationItems: [],
    };

    return new TranslationsImportedForTranscript(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
