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
import { CreateSong } from '../../domain/models/song/commands/create-song.command';
import { CreateSongCommandHandler } from '../../domain/models/song/commands/create-song.command-handler';
import { SongCreated } from '../../domain/models/song/commands/song-created.event';
import { Song } from '../../domain/models/song/song.entity';
import { SongQueryService } from '../../domain/services/query-services/song-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { SongController } from '../controllers/resources/song.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [SongController],
    providers: [
        CommandInfoService,
        SongQueryService,
        CreateSongCommandHandler,
        AddLyricsForSongCommandHandler,
        TranslateSongLyricsCommandHandler,
        TranslateSongTitleCommandHandler,
        // Data Classes
        ...[
            // Domain Model
            Song,
            // Commands
            CreateSong,
            AddLyricsForSong,
            TranslateSongLyrics,
            TranslateSongTitle,
            // Events
            SongCreated,
            SongTitleTranslated,
            LyricsAddedForSong,
            SongLyricsTranslated,
            // TODO Add remaining song events
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class SongModule {}
