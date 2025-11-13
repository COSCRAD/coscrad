import { isAggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { DTO } from '../../../types/DTO';
import { ArangoDocumentForAggregateRoot } from './mapEntityDTOToDatabaseDocument';

export default <TEntity extends HasAggregateId>(
    databaseDTO: ArangoDocumentForAggregateRoot<TEntity>
): DTO<TEntity> =>
    Object.entries(databaseDTO).reduce((accumulatedMappedObject: DTO<TEntity>, [key, value]) => {
        /**
         * We don't currently expose the _rev in the repository layer,
         * while the _id is redundant with the collection name -> type.
         */
        if (key === '_rev' || key === '_id') {
            return accumulatedMappedObject as unknown as DTO<TEntity>;
        }

        if (key === '_key') {
            if (isAggregateId(value)) accumulatedMappedObject['id'] = value;
        } else {
            accumulatedMappedObject[key] = value;
        }

        return accumulatedMappedObject as unknown as DTO<TEntity>;
    }, {} as DTO<TEntity>);
