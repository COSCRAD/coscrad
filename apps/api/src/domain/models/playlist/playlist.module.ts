import { CommandModule } from '@coscrad/commands';
import { forwardRef, Module } from '@nestjs/common';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { IdGenerationModule } from '../../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../../persistence/persistence.module';
import {
    AddAudioItemToPlaylist,
    AddAudioItemToPlaylistCommandHandler,
    CreatePlayList,
    CreatePlayListCommandHandler,
    ImportAudioItemsToPlaylist,
    ImportAudioItemsToPlaylistCommandHandler,
    TranslatePlaylistName,
    TranslatePlaylistNameCommandHandler,
} from './commands';
import { AudioItemAddedToPlaylist } from './commands/add-audio-item-to-playlist/audio-item-added-to-playlist.event';
import { AudioItemAddedToPlaylistEventHandler } from './commands/add-audio-item-to-playlist/audio-item-added-to-playlist.event-handler';
import { PlaylistCreated } from './commands/playlist-created.event';
import { PlaylistCreatedEventHandler } from './commands/playlist-created.event-handler';
import { PlaylistController } from './playlist.controller';
import { ArangoPlaylistQueryRepository } from './queries/arango-playlist-query-repository';
import { PLAYLIST_QUERY_REPOSITORY_TOKEN } from './queries/playlist-query-repository.interface';
import { PlaylistQueryService } from './queries/playlist-query.service';

@Module({
    imports: [
        forwardRef(() => PersistenceModule),
        CommandModule,
        forwardRef(() => IdGenerationModule),
    ],
    controllers: [PlaylistController],
    providers: [
        CommandInfoService,
        PlaylistQueryService,
        CreatePlayListCommandHandler,
        TranslatePlaylistNameCommandHandler,
        AddAudioItemToPlaylistCommandHandler,
        ImportAudioItemsToPlaylistCommandHandler,
        PlaylistCreatedEventHandler,
        AudioItemAddedToPlaylistEventHandler,
        {
            provide: PLAYLIST_QUERY_REPOSITORY_TOKEN,
            useFactory: (connectionProvider: ArangoConnectionProvider) => {
                const instance = new ArangoPlaylistQueryRepository(connectionProvider);

                console.log({
                    instance,
                    connectionProvider,
                });

                return instance;
            },
            inject: [ArangoConnectionProvider],
        },
        // Data Classes
        ...[
            CreatePlayList,
            PlaylistCreated,
            TranslatePlaylistName,
            AddAudioItemToPlaylist,
            AudioItemAddedToPlaylist,
            ImportAudioItemsToPlaylist,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class PlaylistModule {}
