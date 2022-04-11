import { Resource } from 'apps/api/src/domain/models/resource.entity';
import { isResourceId } from 'apps/api/src/domain/types/ResourceId';
import { PartialDTO } from 'apps/api/src/types/partial-dto';

export type DatabaseDTO<TEntityDTO extends PartialDTO<Resource> = PartialDTO<Resource>> = Omit<
    TEntityDTO,
    'id'
> & {
    _key: string;
};

export default <TEntity extends Resource>(
    entityDTO: PartialDTO<TEntity>
): DatabaseDTO<PartialDTO<TEntity>> =>
    Object.entries(entityDTO).reduce(
        (accumulatedMappedObject: DatabaseDTO<PartialDTO<TEntity>>, [key, value]) => {
            if (key === 'id') {
                // Note invalid ids will be omitted from the output
                if (isResourceId(value)) accumulatedMappedObject['_key'] = value as string;
            } else {
                accumulatedMappedObject[key] = value;
            }

            return accumulatedMappedObject as unknown as DatabaseDTO<PartialDTO<TEntity>>;
        },
        {} as DatabaseDTO<PartialDTO<TEntity>>
    );
