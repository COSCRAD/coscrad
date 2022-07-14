import { AggregateId } from '../../../types/AggregateId';
import { Aggregate } from '../../aggregate.entity';

type AggregateCriterionChecker = (aggregate: Aggregate) => boolean;

export default (idToMatch: AggregateId): AggregateCriterionChecker =>
    ({ id }: Aggregate) =>
        idToMatch === id;
