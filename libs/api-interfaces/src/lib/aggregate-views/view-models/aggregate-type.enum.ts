import { CategorizableType } from './categorizable-type.enum';

// TODO We really need a types lib
type ValueType<T extends Record<string, unknown>> = T[keyof T];

export const AggregateType = {
    ...CategorizableType,
    tag: 'tag',
    category: 'category',
    user: 'user',
    userGroup: 'userGroup',
} as const;

export type AggregateType = ValueType<typeof AggregateType>;

export const isAggregateType = (input: unknown): input is AggregateType =>
    Object.values(AggregateType).some((aggregateType) => aggregateType === input);
