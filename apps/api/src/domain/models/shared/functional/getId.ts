import { AggregateId } from '../../../types/AggregateId';
import { Aggregate } from '../../aggregate.entity';

export default ({ id }: Aggregate): AggregateId => id;
