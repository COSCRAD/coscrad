import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TagResourceOrNote } from './tag-resource-or-note.command';

export type ResourceOrNoteTaggedPayload = TagResourceOrNote;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<ResourceOrNoteTagged>({
    example: {
        type: 'RESOURCE_OR_NOTE_TAGGED',
        id: testEventId,
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            userId: buildDummyUuid(2),
            contributorIds: [],
        },
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.note,
                id: buildDummyUuid(3),
            },
            taggedMemberCompositeIdentifier: {
                type: AggregateType.term,
                id: buildDummyUuid(4),
            },
        },
    },
})
@CoscradEvent('RESOURCE_OR_NOTE_TAGGED')
export class ResourceOrNoteTagged extends BaseEvent<ResourceOrNoteTaggedPayload> {
    readonly type = 'RESOURCE_OR_NOTE_TAGGED';
}
