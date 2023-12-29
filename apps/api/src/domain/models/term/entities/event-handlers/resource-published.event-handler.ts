import { IUpdateEventHandler } from '../../../../../domain/common';
import { CoscradEventHandler } from '../../../../../domain/common/events/coscrad-event-handler.decorator';
import { Resource } from '../../../resource.entity';
import { ResourcePublished } from '../../../shared/common-commands/publish-resource/resource-published.event';

@CoscradEventHandler({
    eventType: `RESOURCE_PUBLISHED`,
    scope: 'UPDATE',
})
// TODO Move this to a higher level
export class ResourcePublishedEventHandler implements IUpdateEventHandler<Resource> {
    handle(updateEvent: ResourcePublished, resource: Resource): Resource | Error {
        return resource.addEventToHistory(updateEvent).publish();
    }
}
