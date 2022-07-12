import { ValueType } from '../../lib/types/valueType';
import { CategorizableType } from './CategorizableType';

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
