import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { NoteTranslated, NoteTranslatedPayload } from '../../commands';

export const buildNoteTranslated = (
    payloadOverrides: DeepPartial<NoteTranslatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: NoteTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.note,
            id: buildDummyUuid(1),
        },
        text: 'text for the note you are translating',
        languageCode: LanguageCode.Chilcotin,
    };

    return new NoteTranslated(
        {
            ...clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        },
        buildMetadata()
    );
};
