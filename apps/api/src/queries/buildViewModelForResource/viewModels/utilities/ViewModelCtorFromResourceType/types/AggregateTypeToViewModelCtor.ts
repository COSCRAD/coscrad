import { aggregateTypeToViewModelCtor } from '../aggregateTypeToViewModelCtor';

export type AggregateTypeToViewModelCtor = {
    [K in keyof typeof aggregateTypeToViewModelCtor]: InstanceType<
        typeof aggregateTypeToViewModelCtor[K]
    >;
};
