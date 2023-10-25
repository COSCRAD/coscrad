import { AggregateId } from '../../../../types/AggregateId';
import { ResourceCompositeIdentifier } from '../../../context/commands';
import { BaseEvent } from '../../events/base-event.entity';

export type ResourceReadAccessGrantedToUserPayload = {
    readonly aggregateCompositeIdentifier: ResourceCompositeIdentifier;

    readonly userId: AggregateId;
};

export class ResourceReadAccessGrantedToUser extends BaseEvent<ResourceReadAccessGrantedToUserPayload> {
    type = 'RESOURCE_READ_ACCESS_GRANTED_TO_USER';
}
