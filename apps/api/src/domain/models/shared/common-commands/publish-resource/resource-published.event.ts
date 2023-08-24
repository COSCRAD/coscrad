import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../events/base-event.entity';

@CoscradEvent(`RESOURCE_PUBLISHED`)
export class ResourcePublished extends BaseEvent {
    type = 'RESOURCE_PUBLISHED';
}
