import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { IdGenerationModule } from '../../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../../persistence/persistence.module';
import { CreateMediaItem, MediaItemCreated } from './commands';
import { CreateMediaItemCommandHandler } from './commands/create-media-item/create-media-item.command-handler';
import { FsMediaProber, MEDIA_PROBER_TOKEN } from './media-prober';
import { MediaItemController, MediaItemQueryService } from './queries';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [MediaItemController],
    providers: [
        MediaItemQueryService,
        CommandInfoService,
        CreateMediaItem,
        CreateMediaItemCommandHandler,
        // Data Type Ctors
        // Events
        ...[MediaItemCreated].map((Ctor) => ({
            provide: Ctor,
            useValue: Ctor,
        })),
        {
            provide: MEDIA_PROBER_TOKEN,
            useClass: FsMediaProber,
        },
    ],
    exports: [MediaItemQueryService, MEDIA_PROBER_TOKEN],
})
export class MediaItemModule {}
