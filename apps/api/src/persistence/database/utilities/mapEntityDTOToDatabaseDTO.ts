import { EdgeConnection } from '../../../domain/models/context/edge-connection.entity';
import { HasEntityID } from '../../../domain/models/types/HasEntityId';
import { isResourceId } from '../../../domain/types/ResourceId';
import { DTO } from '../../../types/DTO';
import { HasArangoDocumentDirectionAttributes } from '../types/HasArangoDocumentDirectionAttributes';

// TODO Rename this, the common base type for edge and non-edge documents in arango
export type DatabaseDTO<TEntityDTO extends HasEntityID = HasEntityID> = Omit<TEntityDTO, 'id'> & {
    _key: string;
};

export type DatabaseDocument<TEntity extends HasEntityID> = TEntity extends EdgeConnection
    ? HasArangoDocumentDirectionAttributes<DatabaseDTO<TEntity>>
    : DatabaseDTO<TEntity>;

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
