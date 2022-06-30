import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreateMediaItem } from '../../domain/models/media-item/commands/create-media-item.command';
import { CreateMediaItemCommandHandler } from '../../domain/models/media-item/commands/create-media-item.command-handler';
import { PublishMediaItem } from '../../domain/models/media-item/commands/publish-media-item.command';
import { PublishMediaItemCommandHandler } from '../../domain/models/media-item/commands/publish-media-item.command-handler';
import { MediaItemQueryService } from '../../domain/services/query-services/media-item-query.service';
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
        PublishMediaItem,
        PublishMediaItemCommandHandler,
    ],
})
export class MediaItemModule {}
