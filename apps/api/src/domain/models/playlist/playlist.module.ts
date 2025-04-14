import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { PLAYLIST_QUERY_REPOSITORY_TOKEN } from '.';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { IdGenerationModule } from '../../../lib/id-generation/id-generation.module';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
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
import { PlaylistQueryService } from './queries/playlist-query.service';

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
        AudioItemAddedToPlaylistEventHandler,
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
