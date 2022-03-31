import { Entity } from 'apps/api/src/domain/models/entity';
import { isEntityId } from 'apps/api/src/domain/types/EntityId';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { DatabaseDTO } from './mapEntityDTOToDatabaseDTO';

export default <TEntity extends Entity>(
    databaseDTO: DatabaseDTO<PartialDTO<TEntity>>
): PartialDTO<TEntity> =>
    Object.entries(databaseDTO).reduce(
        (accumulatedMappedObject: PartialDTO<TEntity>, [key, value]) => {
            if (key === '_key') {
                if (isEntityId(value)) accumulatedMappedObject['id'] = value;
            } else {
                accumulatedMappedObject[key] = value;
            }

            return accumulatedMappedObject as unknown as PartialDTO<TEntity>;
        },
        {} as PartialDTO<TEntity>
    );
