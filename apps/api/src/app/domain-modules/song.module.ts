import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateSong } from '../../domain/models/song/commands/create-song.command';
import { CreateSongCommandHandler } from '../../domain/models/song/commands/create-song.command-handler';
import { PublishSong } from '../../domain/models/song/commands/publish-song.command';
import { PublishSongCommandHandler } from '../../domain/models/song/commands/publish-song.command-handler';
import { SongQueryService } from '../../domain/services/query-services/song-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { SongController } from '../controllers/resources/song.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [SongController],
    providers: [
        CommandInfoService,
        CreateSong,
        CreateSongCommandHandler,
        PublishSong,
        PublishSongCommandHandler,
        {
            provide: 'ID_GENERATOR',
            useFactory: () => ({
                generate: () => Promise.resolve(uuidv4()),
            }),
        },
        SongQueryService,
    ],
})
export class SongModule {}
