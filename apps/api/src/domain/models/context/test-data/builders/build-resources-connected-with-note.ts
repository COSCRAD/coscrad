import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    ResourcesConnectedWithNote,
    ResourcesConnectedWithNotePayload,
} from '../../commands/connect-resources-with-note/resources-connected-with-note.event';
import { GeneralContext } from '../../general-context/general-context.entity';
import { TimeRange, TimeRangeContext } from '../../time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../types/EdgeConnectionContextType';

export const buildResourcesConnectedWithNote = (
    payloadOverrides: DeepPartial<ResourcesConnectedWithNotePayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: ResourcesConnectedWithNotePayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.note,
            id: buildDummyUuid(1),
        },
        text: 'this part of the video relates to the book',
        languageCode: LanguageCode.Haida,
        fromMemberCompositeIdentifier: {
            type: AggregateType.video,
            id: buildDummyUuid(3),
        },
        fromMemberContext: new TimeRangeContext({
            type: EdgeConnectionContextType.timeRange,
            timeRange: new TimeRange({
                inPointMilliseconds: 100,
                outPointMilliseconds: 204.5,
            }),
        }),
        toMemberCompositeIdentifier: {
            type: AggregateType.digitalText,
            id: buildDummyUuid(2),
        },
        toMemberContext: new GeneralContext().toDTO(),
    };

    const { fromMemberContext: fromContextOverrides, toMemberContext: toContextOverrides } =
        payloadOverrides;

    const entireObjectOverrides = {
        ...(fromContextOverrides ? { fromMemberContext: fromContextOverrides } : {}),
        ...(toContextOverrides ? { toMemberContext: toContextOverrides } : {}),
    };

    return new ResourcesConnectedWithNote(
        // @ts-expect-error Fix this
        {
            ...clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
            ...entireObjectOverrides,
        },
        buildMetadata()
    );
};
