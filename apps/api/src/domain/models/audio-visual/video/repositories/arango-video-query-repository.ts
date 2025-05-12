import { IDetailQueryResult, IMultilingualTextItem } from '@coscrad/api-interfaces';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
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

    async createMany(view: EventSourcedVideoViewModel[]): Promise<void> {
        await this.database.createMany(view.map(mapEntityDTOToDatabaseDocument));
    }

    async fetchMany(): Promise<EventSourcedVideoViewModel[]> {
        const documents = await this.database.fetchMany();

        return documents.map(mapDatabaseDocumentToAggregateDTO) as EventSourcedVideoViewModel[];
    }

    async create(view: EventSourcedVideoViewModel): Promise<void> {
        await this.database.create(mapEntityDTOToDatabaseDocument(view));
    }

    async delete(id: AggregateId): Promise<void> {
        return this.database.delete(id);
    }

    async fetchById(id: AggregateId): Promise<Maybe<EventSourcedVideoViewModel>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) {
            return NotFound;
        }

        const dto = mapDatabaseDocumentToAggregateDTO(result);

        return EventSourcedVideoViewModel.fromDto(dto);
    }

    async translateName(
        id: AggregateId,
        { text, languageCode, role }: IMultilingualTextItem
    ): Promise<void> {
        const query = `
                FOR doc IN @@collectionName
                FILTER doc._key == @id
                let newItem = {
                            text: @text,
                            languageCode: @languageCode,
                            role: @role
                }
                UPDATE doc WITH {
                    name: {
                        items: APPEND(doc.name.items,newItem)
                    }
                } IN @@collectionName
                 RETURN OLD
                `;

        const bindVars = {
            '@collectionName': 'video__VIEWS',
            id: id,
            text: text,
            role: role,
            languageCode: languageCode,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(`Failed to translate video via VideoRepository: ${reason}`);
            });

        await cursor.all();
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }
}
