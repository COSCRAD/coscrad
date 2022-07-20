import { AggregateId } from '../../../types/AggregateId';
import { HasAggregateId } from '../../../types/HasAggregateId';

export default ({ id }: HasAggregateId): AggregateId => id;
