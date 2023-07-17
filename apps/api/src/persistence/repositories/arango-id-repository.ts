import { UniquelyIdentifiableType } from '../../domain/interfaces/id-manager.interface';
import { AggregateId } from '../../domain/types/AggregateId';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../lib/errors/InternalError';
import { IIdRepository } from '../../lib/id-generation/interfaces/id-repository.interface';
import { UuidDocument } from '../../lib/id-generation/types/UuidDocument';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import { ArangoDatabase } from '../database/arango-database';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../database/database.provider';

type DatabaseUuidDocument = Omit<UuidDocument, 'sequenceNumber' | 'id'> & {
    _key: string;
    uuid: string;
};

const mapDatabaseDocumentToUuidDocument = ({
    _key,
    timeGenerated,
    timeUsed,
    usedBy,
    uuid,
}: DatabaseUuidDocument): UuidDocument => ({
    id: uuid,
    sequenceNumber: _key,
    timeGenerated,
    timeUsed,
    usedBy,
});

const mapUuidDocumentToDatabaseDocument = ({
    id,
    timeGenerated,
    timeUsed,
    sequenceNumber,
}: UuidDocument): DatabaseUuidDocument =>
    ({
        uuid: id,
        timeGenerated,
        timeUsed,
        ...(isNullOrUndefined(sequenceNumber) ? {} : { _key: sequenceNumber }),
    } as DatabaseUuidDocument);

export class ArangoIdRepository implements IIdRepository {
    private readonly arangoDatabase: ArangoDatabase;

    constructor(databaseProvider: ArangoDatabaseProvider) {
        this.arangoDatabase = databaseProvider.getDBInstance();
    }

    async fetchById(id: AggregateId): Promise<Maybe<UuidDocument>> {
        const allIds = await this.arangoDatabase.fetchMany<DatabaseUuidDocument>(
            ArangoCollectionId.uuids
        );

        const result = allIds.find(({ uuid }) => uuid === id) || NotFound;

        if (isNotFound(result)) return NotFound;

        return mapDatabaseDocumentToUuidDocument(result);
    }

    async create(id: AggregateId): Promise<void> {
        const databaseDocument = mapUuidDocumentToDatabaseDocument({
            id,
            timeGenerated: new Date().toISOString(),
            // TODO fix types- there's no sequence number yet on creation
        } as UuidDocument);

        await this.arangoDatabase.create(databaseDocument, ArangoCollectionId.uuids);
    }

    async createMany(ids: AggregateId[]): Promise<void> {
        const databaseDocuments = ids
            .map(
                (id) =>
                    ({
                        id,
                        timeGenerated: new Date().toISOString,
                    } as unknown as UuidDocument)
            )
            .map(mapUuidDocumentToDatabaseDocument);

        await this.arangoDatabase.createMany(databaseDocuments, ArangoCollectionId.uuids);
    }

    async reserve({
        id,
        type,
    }: {
        id: AggregateId;
        type: UniquelyIdentifiableType;
    }): Promise<void> {
        const result = await this.fetchById(id);

        if (isNotFound(result)) {
            throw new InternalError(
                `Cannot reserve id: ${id}, as it has not been registered with our system`
            );
        }

        const { usedBy } = result;

        const isAvailable = isNullOrUndefined(usedBy);

        if (!isAvailable) {
            throw new InternalError(`Cannot reserve id: ${id} as it is already in use`);
        }

        await this.arangoDatabase.update<Partial<UuidDocument>>(
            // The sequence number is the Arango document _key
            result.sequenceNumber,
            {
                usedBy: type,
                timeUsed: new Date().toISOString(),
            },
            ArangoCollectionId.uuids
        );
    }
}
