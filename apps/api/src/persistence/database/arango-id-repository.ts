import { AggregateId } from '../../domain/types/AggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { IIdRepository } from '../../lib/id-generation/interfaces/id-repository.interface';
import { UuidDocument } from '../../lib/id-generation/types/UuidDocument';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound } from '../../lib/types/not-found';
import { ArangoDatabase } from './arango-database';
import { ArangoCollectionId } from './collection-references/ArangoCollectionId';
import mapDatabaseDTOToEntityDTO from './utilities/mapDatabaseDTOToEntityDTO';
import mapEntityDTOToDatabaseDTO, { DatabaseDocument } from './utilities/mapEntityDTOToDatabaseDTO';

type IdDocument = DatabaseDocument<{ id: AggregateId; isAvailable: boolean }>;

export class ArangoIdRepository implements IIdRepository<AggregateId> {
    constructor(private readonly arangoDatabase: ArangoDatabase) {}

    async fetchById(id: AggregateId): Promise<Maybe<UuidDocument<string>>> {
        const result = await this.arangoDatabase.fetchById<
            DatabaseDocument<UuidDocument<AggregateId>>
        >(id, ArangoCollectionId.uuid);

        return isNotFound(result)
            ? result
            : mapDatabaseDTOToEntityDTO<UuidDocument<AggregateId>>(result);
    }

    async create(id: AggregateId): Promise<void> {
        await this.arangoDatabase.create(
            mapEntityDTOToDatabaseDTO({
                id,
                isAvailable: true,
            }),
            ArangoCollectionId.uuid
        );
    }

    async reserve(id: AggregateId): Promise<void> {
        const result = await this.fetchById(id);

        if (isNotFound(result)) {
            throw new InternalError(
                `Cannot reserve id: ${id}, as it has not been registered with our system`
            );
        }

        const { isAvailable } = result;

        if (!isAvailable) {
            throw new InternalError(`Cannot reserve id: ${id} as it is already in use`);
        }

        await this.arangoDatabase.update<Partial<IdDocument>>(
            id,
            {
                isAvailable: false,
            },
            ArangoCollectionId.uuid
        );
    }
}
