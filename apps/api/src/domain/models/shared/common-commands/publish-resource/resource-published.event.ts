import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../events/base-event.entity';
import { PublishResource } from './publish-resource.command';

export type ResourcePublishedPayload = PublishResource;

@CoscradEvent(`RESOURCE_PUBLISHED`)
export class ResourcePublished extends BaseEvent<ResourcePublishedPayload> {
    readonly type = 'RESOURCE_PUBLISHED';
}
