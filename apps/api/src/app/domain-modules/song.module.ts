import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    AddLyricsForSong,
    AddLyricsForSongCommandHandler,
} from '../../domain/models/song/commands';
import { CreateSong } from '../../domain/models/song/commands/create-song.command';
import { CreateSongCommandHandler } from '../../domain/models/song/commands/create-song.command-handler';
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
        // Data Classes
        ...[CreateSong, AddLyricsForSong].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class SongModule {}
