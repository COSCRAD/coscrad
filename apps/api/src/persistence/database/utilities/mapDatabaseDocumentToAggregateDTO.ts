import { isAggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { DTO } from '../../../types/DTO';
import { ArangoDocumentForAggregateRoot } from './mapEntityDTOToDatabaseDocument';

export default <TEntity extends HasAggregateId>(
    databaseDTO: ArangoDocumentForAggregateRoot<TEntity>
): DTO<TEntity> =>
    Object.entries(databaseDTO).reduce((accumulatedMappedObject: DTO<TEntity>, [key, value]) => {
        /**
         * We don't currently expose this in the repository layer
         */
        if (key === '_rev') {
            return accumulatedMappedObject as unknown as DTO<TEntity>;
        }

        if (key === '_key') {
            if (isAggregateId(value)) accumulatedMappedObject['id'] = value;
        } else {
            accumulatedMappedObject[key] = value;
        }

        return accumulatedMappedObject as unknown as DTO<TEntity>;
    }, {} as DTO<TEntity>);
