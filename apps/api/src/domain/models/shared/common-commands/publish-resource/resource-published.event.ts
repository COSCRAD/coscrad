import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../events/base-event.entity';
import { PublishResource } from './publish-resource.command';

type ResourcePublishedPayload = PublishResource;

@CoscradEvent(`RESOURCE_PUBLISHED`)
export class ResourcePublished extends BaseEvent<ResourcePublishedPayload> {
    type = 'RESOURCE_PUBLISHED';
}
