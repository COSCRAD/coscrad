import { CoscradEvent } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { EdgeConnectionCompositeIdentifier } from '../create-note-about-resource';

export type NoteReadAccessGrantedToUserPayload = {
    readonly aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;

    readonly userId: AggregateId;
};

const testEventId = buildDummyUuid(1);

@CoscradDataExample<NoteReadAccessGrantedToUser>({
    example: {
        type: 'NOTE_READ_ACCESS_GRANTED_TO_USER',

        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: 'note',
                id: buildDummyUuid(2),
            },
            userId: buildDummyUuid(3),
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(201),
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent(`NOTE_READ_ACCESS_GRANTED_TO_USER`)
export class NoteReadAccessGrantedToUser extends BaseEvent<NoteReadAccessGrantedToUserPayload> {
    readonly type = 'NOTE_READ_ACCESS_GRANTED_TO_USER';
}
