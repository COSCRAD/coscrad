import { ResourceType } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { IdGenerationModule } from '../../../lib/id-generation/id-generation.module';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { PersistenceModule } from '../../../persistence/persistence.module';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { CreateMediaItem, MediaItemCreated } from './commands';
import { CreateMediaItemCommandHandler } from './commands/create-media-item/create-media-item.command-handler';
import { MediaItem } from './entities/media-item.entity';
import { MEDIA_MANGAER_INJECTION_TOKEN } from './media-manager.interface';
import { FsMediaProber, MEDIA_PROBER_TOKEN } from './media-prober';
import { NodeMediaManagementService } from './node-media-management.service';
import { MediaItemController, MediaItemQueryService } from './queries';

@Module({
    imports: [ConfigModule, PersistenceModule, IdGenerationModule, CommandModule],
    controllers: [MediaItemController],
    providers: [
        MediaItemQueryService,
        CommandInfoService,
        CreateMediaItem,
        CreateMediaItemCommandHandler,
        // Data Type Ctors
        ...[
            // Domain Models
            MediaItem,
            // Events
            MediaItemCreated,
        ].map((Ctor) => ({
            provide: Ctor,
            useValue: Ctor,
        })),
        {
            provide: MEDIA_PROBER_TOKEN,
            useClass: FsMediaProber,
        },
        {
            provide: MEDIA_MANGAER_INJECTION_TOKEN,
            useClass: NodeMediaManagementService,
        },
        {
            provide: 'MEDIA_ITEM_COMMAND_REPOSITORY_INJECTION_TOKEN',
            //  TODO update this logic \ pattern as media items will no longer be resources
            // rename to `ICommandRepositoryProvider`?
            useFactory: (provider: IRepositoryProvider) =>
                provider.forResource(ResourceType.mediaItem),
            inject: [REPOSITORY_PROVIDER_TOKEN],
        },
    ],
    exports: [MediaItemQueryService, MEDIA_PROBER_TOKEN],
})
export class MediaItemModule {}
