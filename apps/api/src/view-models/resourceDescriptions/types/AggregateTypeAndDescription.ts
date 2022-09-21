import { AggregateType } from '../../../domain/types/AggregateType';

export type AggregateTypeAndDescription = {
    type: AggregateType;

    description: string;
};
