import { EdgeConnectionContextType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { ConnectResourcesWithNote } from './connect-resources-with-note.command';

export type ResourcesConnectedWithNotePayload = ConnectResourcesWithNote;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<ResourcesConnectedWithNote>({
    example: {
        type: 'RESOURCES_CONNECTED_WITH_NOTE',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: 'note',
                id: buildDummyUuid(2),
            },
            toMemberCompositeIdentifier: {
                type: ResourceType.term,
                id: buildDummyUuid(3),
            },
            toMemberContext: {
                type: EdgeConnectionContextType.general,
            },
            fromMemberCompositeIdentifier: {
                type: ResourceType.song,
                id: buildDummyUuid(4),
            },
            fromMemberContext: {
                type: EdgeConnectionContextType.general,
            },
            text: 'This is how term 3 is connected to song 4',
            languageCode: LanguageCode.Chilcotin,
        },
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            userId: buildDummyUuid(5),
        },
    },
})
@CoscradEvent('RESOURCES_CONNECTED_WITH_NOTE')
export class ResourcesConnectedWithNote extends BaseEvent<ResourcesConnectedWithNotePayload> {
    readonly type = 'RESOURCES_CONNECTED_WITH_NOTE';
}
