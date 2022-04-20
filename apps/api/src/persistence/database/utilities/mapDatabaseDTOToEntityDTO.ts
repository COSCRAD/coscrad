import { HasEntityID } from 'apps/api/src/domain/models/types/HasEntityId';
import { isResourceId } from 'apps/api/src/domain/types/ResourceId';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { DatabaseDTO } from './mapEntityDTOToDatabaseDTO';

export default <TEntity extends HasEntityID>(
    databaseDTO: DatabaseDTO<TEntity>
): PartialDTO<TEntity> =>
    Object.entries(databaseDTO).reduce(
        (accumulatedMappedObject: PartialDTO<TEntity>, [key, value]) => {
            if (key === '_key') {
                if (isResourceId(value)) accumulatedMappedObject['id'] = value;
            } else {
                accumulatedMappedObject[key] = value;
            }

            return accumulatedMappedObject as unknown as PartialDTO<TEntity>;
        },
        {} as PartialDTO<TEntity>
    );
