import { AggregateTypeAndDescription } from './AggregateTypeAndDescription';

export type AggregateInfo = AggregateTypeAndDescription & {
    // User-facing
    label: string;
};
