import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { AggregateId } from '../../../types/AggregateId';
import { IMemoryMatchRepository } from '../memory-match.repository.interface';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

export class ArangoMemoryMatchRepository implements IMemoryMatchRepository {
    private readonly database: ArangoDatabaseForCollection<MemoryMatchRound>;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'memory_match_rounds'
        );
    }

    async create(round: MemoryMatchRound): Promise<void> {
        // TODO should we call toDTO here?
        await this.database.create(mapEntityDTOToDatabaseDocument(round));
    }

    async createMany(_rounds: MemoryMatchRound[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async delete(_roundId: AggregateId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async fetchById(roundId: AggregateId): Promise<Maybe<MemoryMatchRound>> {
        const documentSearchResult = await this.database.fetchById(roundId);

        if (isNotFound(documentSearchResult)) {
            return documentSearchResult;
        }

        const dto = mapDatabaseDocumentToAggregateDTO(documentSearchResult);

        return MemoryMatchRound.fromDto(dto);
    }

    async fetchMany(): Promise<MemoryMatchRound[]> {
        throw new Error('Method not implemented.');
    }

    async count(): Promise<number> {
        throw new Error('Method not implemented.');
    }
}
