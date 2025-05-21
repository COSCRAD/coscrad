import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { AggregateId } from '../../../types/AggregateId';
import { ArangoResourceQueryBuilder } from '../../term/repositories/arango-resource-query-builder';
import { ISongQueryRepository } from '../queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../queries/song.view-model.event.sourced';

export class ArangoSongQueryRepository implements ISongQueryRepository {
    private readonly database: ArangoDatabaseForCollection<EventSourcedSongViewModel>;

    private readonly baseResourceQueryBuilder = new ArangoResourceQueryBuilder('song__VIEWS');

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'song__VIEWS'
        );
    }

    async createMany(view: EventSourcedSongViewModel[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async create(view: EventSourcedSongViewModel): Promise<void> {
        await this.database.create(mapEntityDTOToDatabaseDocument(view));
    }

    async fetchById(id: AggregateId): Promise<Maybe<EventSourcedSongViewModel>> {
        const document = await this.database.fetchById(id);

        if (isNotFound(document)) {
            return document;
        }

        const dto = mapDatabaseDocumentToAggregateDTO(document);

        return EventSourcedSongViewModel.fromDto(dto);
    }
}
