import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../events/base-event.entity';
import { DeleteResource } from './delete-resource.command';

export type ResourceDeletedPayload = DeleteResource;

@CoscradEvent('RESOURCE_DELETED')
export class ResourceDeleted extends BaseEvent<ResourceDeletedPayload> {
    readonly type = 'RESOURCE_DELETED';
}
