import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../domain/common';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { RegisterUser } from './register-user.command';

const testEventId = buildDummyUuid(1);

export type UserRegisteredPayload = RegisterUser;

@CoscradDataExample<UserRegistered>({
    example: {
        type: 'USER_REGISTERED',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(2),
                type: AggregateType.user,
            },
            userIdFromAuthProvider: `myauth|12345`,
            username: 'gamerdude12345',
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(10),
            dateCreated: dummyDateNow,
            contributorIds: [],
        },
    },
})
@CoscradEvent('USER_REGISTERED')
export class UserRegistered extends BaseEvent<UserRegisteredPayload> {
    readonly type = 'USER_REGISTERED';
}
