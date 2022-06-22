import { AggregateId } from '../../domain/types/AggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { IIdRepository } from '../../lib/id-generation/interfaces/id-repository.interface';
import { UuidDocument } from '../../lib/id-generation/types/UuidDocument';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import { ArangoDatabase } from '../database/arango-database';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { DatabaseProvider } from '../database/database.provider';
import mapDatabaseDTOToEntityDTO from '../database/utilities/mapDatabaseDTOToEntityDTO';
import mapEntityDTOToDatabaseDTO, {
    DatabaseDocument,
} from '../database/utilities/mapEntityDTOToDatabaseDTO';

type IdDocument = DatabaseDocument<{ id: AggregateId; isAvailable: boolean }>;

export class ArangoIdRepository implements IIdRepository<AggregateId> {
    private readonly arangoDatabase: ArangoDatabase;

    constructor(private readonly databaseProvider: DatabaseProvider) {
        this.arangoDatabase = databaseProvider.getDBInstance();
    }

    async fetchById(id: AggregateId): Promise<Maybe<UuidDocument<string>>> {
        const result = await this.arangoDatabase.fetchById<
            DatabaseDocument<UuidDocument<AggregateId>>
        >(id, ArangoCollectionId.uuids);

        if (isNotFound(result)) return NotFound;

        const { id: docId, isAvailable } =
            mapDatabaseDTOToEntityDTO<UuidDocument<AggregateId>>(result);

        return { id: docId, isAvailable };
    }

    async create(id: AggregateId): Promise<void> {
        await this.arangoDatabase.create(
            mapEntityDTOToDatabaseDTO({
                id,
                isAvailable: true,
            }),
            ArangoCollectionId.uuids
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
            ArangoCollectionId.uuids
        );
    }
}
