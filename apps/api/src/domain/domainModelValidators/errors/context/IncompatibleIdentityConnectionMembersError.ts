import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateType from '../../../../view-models/presentation/formatAggregateType';
import { ResourceType } from '../../../types/ResourceType';

type FromResourceOfTypeToResourceOfType = {
    fromType: ResourceType;
    toType: ResourceType;
};

export default class IncompatibleIdentityConnectionMembersError extends InternalError {
    constructor({ fromType, toType }: FromResourceOfTypeToResourceOfType) {
        const msg = [
            `You cannot create an identity connection`,
            `from resource of type: ${formatAggregateType(fromType)}`,
            `to resource of type: ${formatAggregateType(toType)}`,
        ].join(' ');

        super(msg);
    }
}
