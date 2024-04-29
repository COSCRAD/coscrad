import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { NoteTranslatedAboutResource, NoteTranslatedAboutResourcePayload } from '../../commands';

export const buildNoteTranslatedAboutResource = (
    payloadOverrides: DeepPartial<NoteTranslatedAboutResourcePayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: NoteTranslatedAboutResourcePayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.note,
            id: buildDummyUuid(1),
        },
        text: 'text for the note you are translating',
        languageCode: LanguageCode.Chilcotin,
    };

    return new NoteTranslatedAboutResource(
        {
            ...clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        },
        buildMetadata()
    );
};
