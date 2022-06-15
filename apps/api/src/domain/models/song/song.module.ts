import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { SongController } from '../../../app/controllers/resources/song.controller';
import { PersistenceModule } from '../../../persistence/persistence.module';
import { SongQueryService } from '../../services/query-services/song-query.service';
import { CreateSong } from './commands/create-song.command';
import { CreateSongCommandHandler } from './commands/create-song.command-handler';
import { PublishSong } from './commands/publish-song.command';
import { PublishSongCommandHandler } from './commands/publish-song.command-handler';

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
