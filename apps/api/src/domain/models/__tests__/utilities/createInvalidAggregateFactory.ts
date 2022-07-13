import { DTO } from '../../../../types/DTO';
import { Aggregate } from '../../aggregate.entity';

// TODO [design] Consider making this a class.
export default <T extends DTO<Aggregate>>(validAggregate: T) =>
    // TODO Support 'keys to exclude'
    (overrides: { [K in keyof DTO<T>]?: unknown }): DTO<T> =>
        ({
            ...validAggregate,
            ...overrides,
        } as DTO<T>);
