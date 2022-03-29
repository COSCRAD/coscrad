import { QueryOperator } from './QueryOperator';

/**
 * TODO Remove this if we don't end up using it.
 */
export class Criterion<T> {
    constructor(
        public readonly field: string,
        public readonly operator: QueryOperator,
        public readonly comparator: T
    ) {}
}
