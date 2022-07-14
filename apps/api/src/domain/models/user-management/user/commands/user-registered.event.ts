import { AggregateId } from '../../../../types/AggregateId';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { RegisterUser } from './register-user.command';

export class UserRegistered extends BaseEvent {
    type = 'USER_REGISTERED';

    constructor(command: RegisterUser, eventId: AggregateId) {
        super(command, eventId);
    }
}
