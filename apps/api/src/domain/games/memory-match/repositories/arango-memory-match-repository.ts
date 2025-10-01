import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseError } from '../../../../persistence/database/errors/ArangoDatabaseError';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { DTO } from '../../../../types/DTO';
import { AggregateId } from '../../../types/AggregateId';
import { IMemoryMatchRepository } from '../memory-match.repository.interface';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

export class ArangoMemoryMatchRepository implements IMemoryMatchRepository {
    private readonly database: ArangoDatabaseForCollection<DTO<MemoryMatchRound>>;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'memory_match_rounds'
        );
    }

    async create(round: MemoryMatchRound): Promise<InternalError | AggregateId> {
        try {
            await this.database.create(mapEntityDTOToDatabaseDocument(round.toDTO()));

            return round.id;
        } catch (error) {
            /**
             * This is a bit of a hack.
             */
            if (error.message.includes(`persistent over 'name`)) {
                return new InternalError(
                    `There is already a memory match round with the name: ${
                        round.name.getOriginalTextItem().text
                    }`
                );
            }

            if (
                error.message.includes(
                    `unique constraint violated - in index primary of type primary over '_key'`
                )
            ) {
                return new InternalError(
                    `There is already a memory match round with the ID: ${round.id}`
                );
            }

            return new ArangoDatabaseError('failed to create memory match round', error);
        }
    }

    async createMany(rounds: MemoryMatchRound[]): Promise<void> {
        const documents = rounds.map(mapEntityDTOToDatabaseDocument);

        await this.database.createMany(documents);
    }

    async publish(roundId: AggregateId): Promise<InternalError | AggregateId> {
        /**
         * TODO Wrap the 2 queries in a transaction.
         */
        const searchResult = await this.fetchById(roundId);

        if (isNotFound(searchResult)) {
            return new InternalError(
                `You cannot update memory match round: ${roundId} as there is no memory match round with that ID.`
            );
        }

        if (searchResult.isPublished) {
            return new InternalError(
                `You cannot publish memory match round: ${roundId} as it is already published.`
            );
        }

        await this.database.update(roundId, {
            isPublished: true,
        });

        return roundId;
    }

    async delete(roundId: AggregateId): Promise<void> {
        /**
         * Memory match rounds are not event-sourced. Therefore, unlike
         * resource views, it is crucial to use soft deletes to avoid information
         * loss. If a memory match round needs to be truly deleted (perhaps sensitive
         * info was contained in a draft), an admin must delete the corresponding
         * document in the database manually.
         *
         * If we need to recover data from a soft delete, it is available
         * on a document with flag `__isDeleted: true`.
         *
         * In the future, we may want to perform queries on behalf of a user,
         * in which case the soft deleted records can be returned for admin. But
         * for now, these are affectively hidden from the system.
         */
        await this.database.softDelete(roundId);
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
        const documents = await this.database.fetchMany();

        return documents.map((doc) => {
            const dto = mapDatabaseDocumentToAggregateDTO(doc);

            const instance = MemoryMatchRound.fromDto(dto);

            return instance;
        });
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }
}
