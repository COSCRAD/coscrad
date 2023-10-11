import { Maybe } from '../../lib/types/maybe';
import { NotFound } from '../../lib/types/not-found';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';

const AGGREGATE_TYPE_METADATA = '__AGGREGATE_ROOT_METADATA__';

export type AggregateTypeMetadata = {
    aggregateType: string;
};

export const getAggregateTypeForTarget = (target: Object): Maybe<AggregateTypeMetadata> => {
    const meta = Reflect.getMetadata(AGGREGATE_TYPE_METADATA, target);

    if (isNullOrUndefined(meta)) return NotFound;

    return meta as AggregateTypeMetadata;
};

export function AggregateRoot(aggregateType: string): ClassDecorator {
    const metadata: AggregateTypeMetadata = {
        aggregateType,
    };

    return (target: Object) => {
        Reflect.defineMetadata(AGGREGATE_TYPE_METADATA, metadata, target);
    };
}
