import { IDetailQueryResult } from '@coscrad/api-interfaces';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { ArangoResourceQueryBuilder } from '../../../term/repositories/arango-resource-query-builder';
import { EventSourcedVideoViewModel, IVideoQueryRepository } from '../queries';

export class ArangoVideoQueryRepository implements IVideoQueryRepository {
    private readonly database: ArangoDatabaseForCollection<
        IDetailQueryResult<EventSourcedVideoViewModel>
    >;

    private readonly baseResourceQueryBuilder = new ArangoResourceQueryBuilder('video__VIEWS');

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'video__VIEWS'
        );
    }

    async create(view: EventSourcedVideoViewModel): Promise<void> {
        await this.database.create(mapEntityDTOToDatabaseDocument(view));
    }

    async fetchById(id: AggregateId): Promise<Maybe<EventSourcedVideoViewModel>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) {
            return NotFound;
        }

        const dto = mapDatabaseDocumentToAggregateDTO(result);

        return EventSourcedVideoViewModel.fromDto(dto);
    }
}
