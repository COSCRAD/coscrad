import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../events/base-event.entity';
import { UnpublishResource } from './unpublish-resource.command';

export type ResourceUnpublishedPaylaod = UnpublishResource;

@CoscradEvent(`UNPUBLISHED_RESOURCE`)
export class ResourceUnpublished extends BaseEvent<ResourceUnpublishedPaylaod> {
    readonly type = 'RESOURCE_UNPUBLISHED';
}
