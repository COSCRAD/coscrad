import { isAggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { DTO } from '../../../types/DTO';
import { DatabaseDTO } from './mapEntityDTOToDatabaseDTO';

export default <TEntity extends HasAggregateId>(databaseDTO: DatabaseDTO<TEntity>): DTO<TEntity> =>
    Object.entries(databaseDTO).reduce((accumulatedMappedObject: DTO<TEntity>, [key, value]) => {
        if (key === '_key') {
            if (isAggregateId(value)) accumulatedMappedObject['id'] = value;
        } else {
            accumulatedMappedObject[key] = value;
        }

        return accumulatedMappedObject as unknown as DTO<TEntity>;
    }, {} as DTO<TEntity>);
