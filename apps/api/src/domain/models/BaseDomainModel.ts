import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { PartialDTO } from '../../types/partial-dto';

type ModelConstructor<T extends BaseDomainModel = BaseDomainModel> = new (dto: PartialDTO<T>) => T;

/**
 * TODO consider doing this with a mixin(s). There may be cases
 * where we want this behaviour on a non domain-model class without the
 * inheritance baggage.
 *  */
export default class BaseDomainModel {
    toDTO<TModel extends BaseDomainModel>(this: TModel): PartialDTO<TModel> {
        const result = cloneToPlainObject(this);

        return result;
    }

    clone<T extends BaseDomainModel>(this: T, overrides: PartialDTO<T> = {}): T {
        return new (this.constructor as ModelConstructor<T>)({
            ...this.toDTO(),
            ...overrides,
        });
    }
}
