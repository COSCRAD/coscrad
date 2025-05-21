import { IDetailQueryResult } from '@coscrad/api-interfaces';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoResourceQueryBuilder } from '../../term/repositories/arango-resource-query-builder';
import { ISongQueryRepository } from '../queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../queries/song.view-model.event.sourced';

export class ArangoSongQueryRepository implements ISongQueryRepository {
    private readonly database: ArangoDatabaseForCollection<
        IDetailQueryResult<EventSourcedSongViewModel>
    >;

    private readonly baseResourceQueryBuilder = new ArangoResourceQueryBuilder('song__VIEWS');

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'song__VIEWS'
        );
    }
}
