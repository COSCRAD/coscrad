import { Resource } from 'apps/api/src/domain/models/resource.entity';
import { isResourceId } from 'apps/api/src/domain/types/ResourceId';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { DatabaseDTO } from './mapEntityDTOToDatabaseDTO';

export default <TEntity extends Resource>(
    databaseDTO: DatabaseDTO<PartialDTO<TEntity>>
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
