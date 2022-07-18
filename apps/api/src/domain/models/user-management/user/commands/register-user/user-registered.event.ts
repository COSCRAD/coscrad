import { BaseEvent } from '../../../../shared/events/base-event.entity';

export class UserRegistered extends BaseEvent {
    type = 'USER_REGISTERED';
}
