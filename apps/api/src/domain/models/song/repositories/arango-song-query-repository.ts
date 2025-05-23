import { IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
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

    async addLyrics(
        id: AggregateId,
        textForLyrics: string,
        languageCode: LanguageCode
    ): Promise<void> {
        const lyricsDto = buildMultilingualTextWithSingleItem(textForLyrics, languageCode).toDTO();

        await this.database.update(id, { lyrics: lyricsDto });
    }

    async translateName(
        id: AggregateId,
        { text, languageCode, role }: IMultilingualTextItem
    ): Promise<void> {
        await this.database.query(
            this.baseResourceQueryBuilder.translateName(id, text, languageCode, role)
        );
    }

    async translateLyrics(id: AggregateId, translation: IMultilingualTextItem): Promise<void> {
        const query = `
            FOR doc IN @@collectionName
            FILTER doc._key == @id
            UPDATE doc WITH {
                name: {
                    items: APPEND(doc.name.items,@newItem)
                }
            } IN @@collectionName
            `;

        const bindVars = {
            '@collectionName': ArangoCollectionId.songs,
            id: id,
            newItem: translation,
        };

        const q = {
            query,
            bindVars,
        };

        await this.database.query(q);
    }

    async delete(id: AggregateId): Promise<void> {
        return this.database.delete(id);
    }

    async fetchMany(): Promise<EventSourcedSongViewModel[]> {
        const result = await this.database.fetchMany();

        const asViews = result.map((doc) =>
            EventSourcedSongViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(doc))
        );

        return asViews;
    }

    async createMany(view: EventSourcedSongViewModel[]): Promise<void> {
        const documents = view.map(mapEntityDTOToDatabaseDocument);

        await this.database.createMany(documents);
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
