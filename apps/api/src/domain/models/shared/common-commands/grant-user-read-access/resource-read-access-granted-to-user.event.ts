import { BaseEvent } from '../../events/base-event.entity';

export class ResourceReadAccessGrantedToUser extends BaseEvent {
    type = 'RESOURCE_READ_ACCESS_GRANTED_TO_USER';
}
