import { AggregateId } from '../../../domain/types/AggregateId';

export default (collectionName: string, id: AggregateId): string => `${collectionName}/${id}`;
