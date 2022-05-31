import { AggregateId } from '../types/AggregateId';

export interface HasAggregateIdAndLabel {
    id: AggregateId;
    label: string;
}
