import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { PLAYLIST_QUERY_REPOSITORY_TOKEN } from '../../domain/models/playlist';
import {
    AddAudioItemToPlaylist,
    AddAudioItemToPlaylistCommandHandler,
    CreatePlayList,
    CreatePlayListCommandHandler,
    ImportAudioItemsToPlaylist,
    ImportAudioItemsToPlaylistCommandHandler,
    TranslatePlaylistName,
    TranslatePlaylistNameCommandHandler,
} from '../../domain/models/playlist/commands';
import { PlaylistCreated } from '../../domain/models/playlist/commands/playlist-created.event';
import { PlaylistCreatedEventHandler } from '../../domain/models/playlist/commands/playlist-created.event-handler';
import { ArangoPlaylistQueryRepository } from '../../domain/models/playlist/queries/arango-playlist-query-repository';
import { PlaylistQueryService } from '../../domain/services/query-services/playlist-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { ArangoConnectionProvider } from '../../persistence/database/arango-connection.provider';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { PlaylistController } from '../controllers/resources/playlist.controller';

// TODO move this
@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [PlaylistController],
    providers: [
        {
            provide: PLAYLIST_QUERY_REPOSITORY_TOKEN,
            useFactory: (connectionProvider: ArangoConnectionProvider) => {
                return new ArangoPlaylistQueryRepository(connectionProvider);
            },
            inject: [ArangoConnectionProvider],
        },
        CommandInfoService,
        PlaylistQueryService,
        CreatePlayListCommandHandler,
        TranslatePlaylistNameCommandHandler,
        AddAudioItemToPlaylistCommandHandler,
        ImportAudioItemsToPlaylistCommandHandler,
        PlaylistCreatedEventHandler,
        // Data Classes
        ...[
            CreatePlayList,
            PlaylistCreated,
            TranslatePlaylistName,
            AddAudioItemToPlaylist,
            ImportAudioItemsToPlaylist,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class PlaylistModule {}
