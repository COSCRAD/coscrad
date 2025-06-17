import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    AddLyricsForSong,
    AddLyricsForSongCommandHandler,
    SongLyricsTranslated,
    SongTitleTranslated,
    TranslateSongLyrics,
    TranslateSongLyricsCommandHandler,
    TranslateSongTitle,
    TranslateSongTitleCommandHandler,
} from '../../domain/models/song/commands';
import { LyricsAddedForSong } from '../../domain/models/song/commands/add-lyrics-for-song/lyrics-added-for-song.event';
import { LyricsAddedForSongEventHandler } from '../../domain/models/song/commands/add-lyrics-for-song/lyrics-added-for-song.event-handler';
import { CreateSong } from '../../domain/models/song/commands/create-song.command';
import { CreateSongCommandHandler } from '../../domain/models/song/commands/create-song.command-handler';
import { SongCreated } from '../../domain/models/song/commands/song-created.event';
import { SongCreatedEventHandler } from '../../domain/models/song/commands/song-created.event-handler';
import { SongLyricsTranslatedEventHandler } from '../../domain/models/song/commands/translate-song-lyrics/song-lyrics-translated.event-handler';
import { SongTitleTranslatedEventHandler } from '../../domain/models/song/commands/translate-song-title/song-title-translated.event-handler';
import { EventSourcedSongViewModel } from '../../domain/models/song/queries/song.view-model.event.sourced';
import { Song } from '../../domain/models/song/song.entity';
import { SongQueryService } from '../../domain/services/query-services/song-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { CoscradNLPModule } from '../../lib/nlp';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { SongController } from '../controllers/resources/song.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule, CoscradNLPModule],
    controllers: [SongController],
    providers: [
        CommandInfoService,
        SongQueryService,
        CreateSongCommandHandler,
        SongCreatedEventHandler,
        AddLyricsForSongCommandHandler,
        TranslateSongLyricsCommandHandler,
        TranslateSongTitleCommandHandler,
        // Data Classes
        ...[
            // Domain Model
            Song,
            // view models
            EventSourcedSongViewModel,
            // Commands
            CreateSong,
            AddLyricsForSong,
            TranslateSongLyrics,
            TranslateSongTitle,
            SongCreated,
            SongTitleTranslated,
            LyricsAddedForSong,
            SongLyricsTranslated,
            // TODO Add remaining song events
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
        // event handlers
        SongCreatedEventHandler,
        SongTitleTranslatedEventHandler,
        LyricsAddedForSongEventHandler,
        SongLyricsTranslatedEventHandler,
    ],
})
export class SongModule {}
