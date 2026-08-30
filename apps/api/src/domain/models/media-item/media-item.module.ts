import { ResourceType } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { IdGenerationModule } from '../../../lib/id-generation/id-generation.module';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../persistence/persistence.module';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { CreateMediaItem, MediaItemCreated } from './commands';
import { AddGeneratedTranscriptForMediaItem } from './commands/add-generated-transcript-for-media-item/add-generated-transcript-for-media-item.command';
import { AddGeneratedTranscriptForMediaItemCommandHandler } from './commands/add-generated-transcript-for-media-item/add-generated-transcript-for-media-item.command-handler';
import { GeneratedTranscriptAddedForMediaItem } from './commands/add-generated-transcript-for-media-item/generated-transcript-added-for-media-item';
import { CreateMediaItemCommandHandler } from './commands/create-media-item/create-media-item.command-handler';
import { MediaItem } from './entities/media-item.entity';
import { MEDIA_MANGAER_INJECTION_TOKEN } from './media-manager.interface';
import { FsMediaProber, MEDIA_PROBER_TOKEN } from './media-prober';
import { NodeMediaManagementService } from './node-media-management.service';
import { MediaItemController, MediaItemQueryService } from './queries';

@Module({
    imports: [
        ConfigModule,
        PersistenceModule,
        IdGenerationModule,
        CommandModule,
        MulterModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const options = {
                    // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-284] persist the file
                    // dest: configService.get('ON_DISK_BINARY_ASSET_STORAGE_DIRECTORY'),
                    limits: {
                        fileSize:
                            configService.get<number>('MAX_FILE_UPLOAD_SIZE_MB') * 1000 * 1000,
                        files: configService.get<number>('MAX_FILE_UPLOAD_COUNT'),
                    },
                };

                return options;
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [MediaItemController],
    providers: [
        // TODO Can we remove this?
        ArangoDatabaseProvider,
        MediaItemQueryService,
        CommandInfoService,
        CreateMediaItem,
        CreateMediaItemCommandHandler,
        AddGeneratedTranscriptForMediaItem,
        AddGeneratedTranscriptForMediaItemCommandHandler,
        // Data Type Ctors
        ...[
            // Domain Models
            MediaItem,
            // Events
            MediaItemCreated,
            GeneratedTranscriptAddedForMediaItem,
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
    exports: [MediaItemQueryService, MEDIA_PROBER_TOKEN, MEDIA_MANGAER_INJECTION_TOKEN],
})
export class MediaItemModule {}
