import { QueryOperator } from './QueryOperator';

export class Criterion<T> {
    constructor(
        public readonly field: string,
        public readonly operator: QueryOperator,
        public readonly value: T
    ) {}
}
