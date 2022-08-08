import { Aggregate } from '../models/aggregate.entity';
import { AggregateType } from './AggregateType';

export type PartialSnapshot = Partial<Record<AggregateType, Aggregate[]>>;
