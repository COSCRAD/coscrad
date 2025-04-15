import { CommandModule } from '@coscrad/commands';
import { forwardRef, Module } from '@nestjs/common';
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
        ArangoPlaylistQueryRepository,
        // {
        //     provide: PLAYLIST_QUERY_REPOSITORY_TOKEN,
        //     useFactory: (arangoConnectionProvider: ArangoConnectionProvider) =>
        //         new ArangoPlaylistQueryRepository(arangoConnectionProvider),
        //     inject: [ArangoConnectionProvider],
        // },
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
