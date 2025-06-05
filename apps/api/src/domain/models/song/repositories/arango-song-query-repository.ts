import { IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../types/AggregateId';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { ISongQueryRepository } from '../queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../queries/song.view-model.event.sourced';

export class ArangoSongQueryRepository implements ISongQueryRepository {
    private readonly database: ArangoDatabaseForCollection<EventSourcedSongViewModel>;

    private readonly baseResourceQueryBuilder = new BaseArangoResourceViewQueryBuilder(
        'song__VIEWS'
    );

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'song__VIEWS'
        );
    }

    async allowUser(aggregateId: AggregateId, userId: AggregateId): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.allowUser(aggregateId, userId));
    }

    async publish(id: AggregateId): Promise<void> {
        const cursor = await this.database.query(this.baseResourceQueryBuilder.publish(id));

        await cursor.all();
    }

    async tag(id: string, tagId: string): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.tag(id, tagId));
    }

    async createNoteAbout(id: string, dto: INoteCreationDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.createNoteAbout(id, dto));
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
                lyrics: {
                    items: APPEND(doc.lyrics.items,@newItem)
                }
            } IN @@collectionName
            `;

        const bindVars = {
            '@collectionName': 'song__VIEWS',
            id: id,
            newItem: translation,
        };

        const q = {
            query,
            bindVars,
        };

        const cursor = await this.database.query(q);

        const result = await cursor.all();

        result;
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

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async create(view: EventSourcedSongViewModel): Promise<void> {
        const query = `
            LET mediaItemIds = (
                FOR a IN audioItem__VIEWS
                FILTER a._key == @songDoc.audioItemId
                RETURN a.mediaItemId
            )
            INSERT MERGE(@songDoc, LENGTH(mediaItemIds) == 1 ? { mediaItemId: mediaItemIds[0]} : {})
            in song__VIEWS
        `;

        const bindVars = {
            // `view.toDto()` ?
            songDoc: mapEntityDTOToDatabaseDocument(view),
        };

        await this.database.query({
            query,
            bindVars,
        });
    }

    async createMany(views: EventSourcedSongViewModel[]): Promise<void> {
        const query = `
            FOR songDoc in @songDocs
            LET mediaItemIds = (
                FOR a IN audioItem__VIEWS
                FILTER a._key == songDoc.audioItemId
                RETURN a.mediaItemId
            )
            INSERT MERGE(songDoc, LENGTH(mediaItemIds) == 1 ? { mediaItemId: mediaItemIds[0]} : {})
            in song__VIEWS
        `;

        const bindVars = {
            songDocs: views.map(mapEntityDTOToDatabaseDocument),
        };

        await this.database.query({
            query,
            bindVars,
        });
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
