import { ICommand } from '@coscrad/commands';
import { AggregateId } from '../../../../types/AggregateId';
import { BaseEvent } from '../../events/base-event.entity';

export class ResourceReadAccessGrantedToUser extends BaseEvent {
    type = 'RESOURCE_READ_ACCESS_GRANTED_TO_USER';

    constructor(command: ICommand, eventId: AggregateId, userId: AggregateId) {
        super(command, eventId, userId);
    }
}
