import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreateMediaItem } from '../../domain/models/media-item/commands/create-media-item/create-media-item.command';
import { CreateMediaItemCommandHandler } from '../../domain/models/media-item/commands/create-media-item/create-media-item.command-handler';
import {
    FsMediaProber,
    MEDIA_PROBER_TOKEN,
} from '../../domain/services/query-services/media-management';
import { MediaItemQueryService } from '../../domain/services/query-services/media-management/media-item-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { MediaItemController } from '../controllers/resources/media-item.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [MediaItemController],
    providers: [
        MediaItemQueryService,
        CommandInfoService,
        CreateMediaItem,
        CreateMediaItemCommandHandler,
        {
            provide: MEDIA_PROBER_TOKEN,
            useClass: FsMediaProber,
        },
    ],
    exports: [MediaItemQueryService, MEDIA_PROBER_TOKEN],
})
export class MediaItemModule {}
