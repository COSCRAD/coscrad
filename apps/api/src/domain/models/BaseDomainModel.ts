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
    clone<T extends BaseDomainModel>(this: T, overrides?: DeepPartial<DTO<T>>): T {
        return new (this.constructor as ModelConstructor<T>)({
            ...this.toDTO(),
            ...(overrides || {}),
        });
    }
}
