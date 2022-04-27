import { HasEntityID } from 'apps/api/src/domain/models/types/HasEntityId';
import { isResourceId } from 'apps/api/src/domain/types/ResourceId';
import { DTO } from 'apps/api/src/types/DTO';
import { DatabaseDTO } from './mapEntityDTOToDatabaseDTO';

export default <TEntity extends HasEntityID>(databaseDTO: DatabaseDTO<TEntity>): DTO<TEntity> =>
    Object.entries(databaseDTO).reduce((accumulatedMappedObject: DTO<TEntity>, [key, value]) => {
        if (key === '_key') {
            if (isResourceId(value)) accumulatedMappedObject['id'] = value;
        } else {
            accumulatedMappedObject[key] = value;
        }

        return accumulatedMappedObject as unknown as DTO<TEntity>;
    }, {} as DTO<TEntity>);
