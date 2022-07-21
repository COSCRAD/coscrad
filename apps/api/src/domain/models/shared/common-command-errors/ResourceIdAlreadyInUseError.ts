import { InternalError } from '../../../../lib/errors/InternalError';
import formatResourceType from '../../../../view-models/presentation/formatResourceType';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';

export default class ResourceIdAlreadyInUseError extends InternalError {
    constructor({ id, resourceType }: { id: AggregateId; resourceType: ResourceType }) {
        super(`There is already a ${formatResourceType(resourceType)} with the id: ${id}`);
    }
}
