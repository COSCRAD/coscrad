import { AggregateCompositeIdentifier } from '../../domain/types/AggregateCompositeIdentifier';

export default ({ id, type }: AggregateCompositeIdentifier): string => `${type}/${id}`;
