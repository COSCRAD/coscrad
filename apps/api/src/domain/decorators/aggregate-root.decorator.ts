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

/**
 * **Usage**
 * ```ts
 * @AggregateType(AggregateType.widget)
 * class Widget extends Aggregate{
 *   // ..
 * }
 * ```
 *
 * An `Aggregate Root` (coloquially `aggregate`) in Domain Driven Design is an aggregate in the OOP
 * sense of being an object that (may be) itself composed of additional objects.
 * Further, it is an `Entity` in the sense that an aggregate root has an identity
 * that distinguishes it from other objects, even if they coincidentally share
 * equivalent properties given the current state. This is in distinction to
 * a `Value Object`.
 *
 * Further, an aggregate root maintains identity for all nested entities that
 * it leverages. For example, all updates to a Video's `Transcript` must come
 * through an instance of the `Video` class.
 *
 * At a higher-level, all updates to the system are carried out via susccessful
 * commands (which lead to the creation of domain events) that target one and only
 * one `AggregateCompositeIdentifier`, i.e. type and uuid comibination:
 * ```ts
 * type AggregateCompositeIdentifier<TAggregateType extends string> = {
 *  type: T,
 *  id: UUID // or just string
 * }
 * ```
 *
 * We are currently moving towards full event-sourcing of our domain. All new
 * aggregate root classes must implement a static factory method called
 * `fromEventHistory` that returns an instnace or an error.
 *
 *
 * The purpose of this decorator is to dynamically register aggregate root
 * classes as such in our system via annotation. This allows us to dynamically
 * create a factory that hydrates a(n) instance(s) of an aggregate class given
 * only a way to fetch an event stream.
 *
 * Previously, we maintained lookup tables for this purpose, along with a set
 * of mapped types. These proved tedious to update and led to annoying merge
 * conflicts that made it tougher to work on adding new aggregate roots in parallel.
 * In some cases, we even hit circular build dependencies because of all the
 * shared references to aggregate class constructors throughout the system.
 */
export function AggregateRoot(aggregateType: string): ClassDecorator {
    // TODO Support "Aggregate Description" meta data declaration via this decorator.
    const metadata: AggregateTypeMetadata = {
        aggregateType,
    };

    return (target: Object) => {
        Reflect.defineMetadata(AGGREGATE_TYPE_METADATA, metadata, target);
    };
}
