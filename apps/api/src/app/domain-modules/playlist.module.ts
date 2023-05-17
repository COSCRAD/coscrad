import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    CreatePlayList,
    CreatePlayListCommandHandler,
} from '../../domain/models/playlist/commands';
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
        CreatePlayList,
        CreatePlayListCommandHandler,
    ],
})
export class PlaylistModule {}
