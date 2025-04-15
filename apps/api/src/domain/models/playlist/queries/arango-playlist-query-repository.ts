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
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { AggregateId } from '../../../types/AggregateId';
import { ArangoResourceQueryBuilder } from '../../term/repositories/arango-resource-query-builder';
import { IPlaylistQueryRepository } from './playlist-query-repository.interface';

@Injectable()
@ArangoViewRepository('playlist')
export class ArangoPlaylistQueryRepository implements IPlaylistQueryRepository {
    private readonly database: ArangoDatabaseForCollection<PlaylistViewModel>;

    /**
     * We use this helper to achieve composition over inheritance.
     */
    private readonly baseResourceQueryBuilder: ArangoResourceQueryBuilder;

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

        this.baseResourceQueryBuilder = new ArangoResourceQueryBuilder('playlist__VIEWS');

        console.log(`PLAYLIST QUERY REPO intantiated`);
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

    delete(_id: AggregateId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async publish(id: AggregateId): Promise<void> {
        const cursor = await this.database.query(this.baseResourceQueryBuilder.publish(id));

        await cursor.all();
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
                mimeType: a.mimeType,
                lengthMilliseconds: a.lengthMilliseconds,
                mediaItemId: a.mediaItemId
            }
        UPDATE doc WITH {
            episodes: APPEND(doc.episodes,nextEpisode)
        } IN @@collectionName
         RETURN NEW
        `;

        const bindVars = {
            '@collectionName': 'playlist__VIEWS',
            id: playlistId,
            audioItemId,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(
                    `Failed to add audio item as episode to playlist via term query repository: ${reason}`
                );
            });

        const _new = await cursor.all();

        _new;
    }

    async attribute(id: AggregateId, contributorIds: AggregateId[]): Promise<void> {
        const cursor = await this.database.query(
            this.baseResourceQueryBuilder.attribute(id, contributorIds)
        );

        await cursor.all();
    }
}
