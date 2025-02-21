import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';

type ModelConstructor<T extends BaseDomainModel = BaseDomainModel> = new (dto: DTO<T>) => T;

/**
 * TODO consider doing this with a mixin(s). There may be cases
 * where we want this behaviour on a non domain-model class without the
 * inheritance baggage.
 *  */
export default class BaseDomainModel {
    toDTO<TModel extends BaseDomainModel>(this: TModel): DTO<TModel> {
        const result = cloneToPlainObject(this);

        return result;
    }

    // This allows us to use our instances as immutable data structures
    // One problem with this is that it assumes too much about the parameters the constructor takes
    /**
     * **Do not** use this for test data if you rely on having a consistent event history.
     * This method will not append or remove any events from an aggregate root instance's
     * `eventHistory`.
     *
     * Use `TestEventStream` or the event handler methods `handleXEvent` directly.
     * @param this
     * @param overrides properties to override
     * @returns a new instance (this is a deep clone)
     */
    clone<T extends BaseDomainModel>(this: T, overrides?: DeepPartial<DTO<T>>): T {
        return new (this.constructor as ModelConstructor<T>)({
            ...this.toDTO(),
            ...(overrides || {}),
        });
    }
}
