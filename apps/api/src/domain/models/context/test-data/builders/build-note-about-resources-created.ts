import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    NoteAboutResourceCreated,
    NoteAboutResourceCreatedPayload,
} from '../../commands/create-note-about-resource/note-about-resource-created.event';
import { GeneralContext } from '../../general-context/general-context.entity';

export const buildNoteAboutResourceCreated = (
    payloadOverrides: DeepPartial<NoteAboutResourceCreatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: NoteAboutResourceCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.note,
            id: buildDummyUuid(1),
        },
        resourceCompositeIdentifier: {
            type: ResourceType.digitalText,
            id: buildDummyUuid(2),
        },
        resourceContext: new GeneralContext().toDTO(),
        text: 'This is an interesting book',
        languageCode: LanguageCode.English,
    };

    const { resourceContext: resourceContextOverrides } = payloadOverrides;

    const entireObjectOverrides = resourceContextOverrides
        ? { fromMemberContext: resourceContextOverrides }
        : {};

    return new NoteAboutResourceCreated(
        {
            ...clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
            ...entireObjectOverrides,
        },
        buildMetadata()
    );
};
