import { AggregateId } from '../../../../types/AggregateId';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreateGroup } from './create-group.command';

export class GroupCreated extends BaseEvent {
    type = 'USER_GROUP_CREATED';

    constructor(command: CreateGroup, eventId: AggregateId) {
        super(command, eventId);
    }
}
