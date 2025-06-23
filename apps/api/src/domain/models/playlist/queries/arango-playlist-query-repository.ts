import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoViewRepository } from '../../../../persistence/database/decorators/arango-view-repository.decorator';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { AggregateId } from '../../../types/AggregateId';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { ContributionSummary } from '../../user-management';
import { IPlaylistQueryRepository } from './playlist-query-repository.interface';

@Injectable()
@ArangoViewRepository('playlist')
export class ArangoPlaylistQueryRepository implements IPlaylistQueryRepository {
    private readonly database: ArangoDatabaseForCollection<PlaylistViewModel>;

    private readonly baseResourceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(
        // should we inject the database directly?
        @Inject(ArangoConnectionProvider) arangoConnectionProvider: ArangoConnectionProvider
        // @Inject(COSCRAD_LOGGER_TOKEN)
        // readonly logger: ICoscradLogger
    ) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'playlist__VIEWS'
        );

        this.baseResourceQueryBuilder = new BaseArangoResourceViewQueryBuilder('playlist__VIEWS');
    }

    count(): Promise<number> {
        return this.database.getCount();
    }

    subscribeToUpdates(): Observable<{ data: { type: string } }> {
        throw new Error('Method not implemented.');
    }

    async create(view: PlaylistViewModel): Promise<void> {
        await this.database.create(mapEntityDTOToDatabaseDocument(view));
    }

    async createMany(views: PlaylistViewModel[]): Promise<void> {
        const documents = views.map(mapEntityDTOToDatabaseDocument);

        await this.database.createMany(documents);
    }

    async delete(id: AggregateId): Promise<void> {
        await this.database.delete(id);
    }

    async publish(id: AggregateId): Promise<void> {
        const cursor = await this.database.query(this.baseResourceQueryBuilder.publish(id));

        await cursor.all();
    }

    async tag(playlistId: string, tagId: string): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.tag(playlistId, tagId));
    }

    async createNoteAbout(id: string, dto: INoteCreationDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.createNoteAbout(id, dto));
    }

    async createConnection(id: string, dto: IResourceConnectionDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.connectResourcesWithNote(id, dto));
    }

    async fetchById(id: AggregateId): Promise<Maybe<PlaylistViewModel>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) return result;

        const asView = mapDatabaseDocumentToAggregateDTO(result);

        return PlaylistViewModel.fromDto(asView);
    }

    async fetchMany(): Promise<PlaylistViewModel[]> {
        const result = await this.database.fetchMany();

        const asViews = result.map((doc) =>
            PlaylistViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(doc))
        );

        return asViews;
    }

    allowUser(_id: AggregateId, _userId: AggregateId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async addAudioItem(playlistId: AggregateId, audioItemId: string) {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        FOR a IN audioItem__VIEWS
        FILTER a._key == @audioItemId
        LET nextEpisode = {
                name: a.name,
                mediaItemId: a.mediaItemId
            }
        UPDATE doc WITH {
            episodes: APPEND(doc.episodes,nextEpisode)
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'playlist__VIEWS',
            id: playlistId,
            audioItemId,
        };

        await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(
                    `Failed to add audio item as episode to playlist via term query repository: ${reason}`
                );
            });
    }

    async translatePlaylistName(
        id: AggregateId,
        text: String,
        languageCode: LanguageCode
        // TODO should `role: MultilingualTextItemRole` come from the event as well?
    ): Promise<void> {
        const cursor = await this.database
            .query(
                this.baseResourceQueryBuilder.translateName(
                    id,
                    text,
                    languageCode,
                    MultilingualTextItemRole.freeTranslation
                )
            )
            .catch((reason) => {
                throw new InternalError(`Failed to translate playlist name: ${reason}`);
            });

        await cursor.all();
    }

    async importAudioItems(id: AggregateId, audioItemIds: AggregateId[]): Promise<void> {
        // TODO handle ACL and publication status below as well
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        LET newEpisodes = (
            FOR a IN audioItem__VIEWS
            FILTER CONTAINS(@audioItemIds,a._key)
                RETURN {
                    name: a.name,
                    mediaItemId: a.mediaItemId
                })

        UPDATE doc WITH {
            episodes: APPEND(doc.episodes,newEpisodes)
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'playlist__VIEWS',
            id,
            audioItemIds,
        };

        await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(
                    `Failed to import audio items as episodes to playlist via term query repository: ${reason}`
                );
            });
    }

    async attribute(id: AggregateId, summary: ContributionSummary): Promise<void> {
        const cursor = await this.database.query(
            this.baseResourceQueryBuilder.attribute(id, summary)
        );

        await cursor.all();
    }
}
