import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { Playlist } from '../../domain/models/playlist';
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
import { AudioItemAddedToPlaylist } from '../../domain/models/playlist/commands/add-audio-item-to-playlist/audio-item-added-to-playlist.event';
import { AudioItemAddedToPlaylistEventHandler } from '../../domain/models/playlist/commands/add-audio-item-to-playlist/audio-item-added-to-playlist.event-handler';
import { AudioItemsImportedToPlaylist } from '../../domain/models/playlist/commands/import-audio-items-to-playlist/audio-items-imported-to-playlist.event';
import { PlaylistCreated } from '../../domain/models/playlist/commands/playlist-created.event';
import { PlaylistCreatedEventHandler } from '../../domain/models/playlist/commands/playlist-created.event-handler';
import { PlaylistNameTranslated } from '../../domain/models/playlist/commands/translate-playlist-name/playlist-name-translated.event';
import { PlaylistQueryService } from '../../domain/services/query-services/playlist-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { PlaylistController } from '../controllers/resources/playlist.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
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
        // Data Classes
        ...[
            Playlist,
            CreatePlayList,
            TranslatePlaylistName,
            AddAudioItemToPlaylist,
            ImportAudioItemsToPlaylist,
            PlaylistCreated,
            PlaylistNameTranslated,
            AudioItemAddedToPlaylist,
            AudioItemsImportedToPlaylist,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class PlaylistModule {}
