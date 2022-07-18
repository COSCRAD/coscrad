import { BaseEvent } from '../../../../shared/events/base-event.entity';

export class UserRoleGranted extends BaseEvent {
    type = 'USER_ROLE_GRANTED';
}
