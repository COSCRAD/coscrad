import { HasEntityID } from '../../../domain/models/types/HasEntityId';
import { isResourceId } from '../../../domain/types/ResourceId';
import { DTO } from '../../../types/DTO';

export type DatabaseDTO<TEntityDTO extends HasEntityID = HasEntityID> = Omit<TEntityDTO, 'id'> & {
    _key: string;
};

export default <T extends HasEntityID>(entityDTO: DTO<T>): DatabaseDTO<T> =>
    Object.entries(entityDTO).reduce((accumulatedMappedObject: DatabaseDTO<T>, [key, value]) => {
        if (key === 'id') {
            // Note invalid ids will be omitted from the output
            if (isResourceId(value)) accumulatedMappedObject['_key'] = value as string;
        } else {
            accumulatedMappedObject[key] = value;
        }

        return accumulatedMappedObject as unknown as DatabaseDTO<T>;
    }, {} as DatabaseDTO<T>);
