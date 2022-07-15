import { BaseEvent } from '../../../../shared/events/base-event.entity';

export class UserAddedToGroup extends BaseEvent {
    readonly type = 'USER_ADDED_TO_GROUP';
}
