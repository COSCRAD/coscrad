import { ResourceType } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreatePhotograph, PhotographCommandsModule, PhotographCreated } from '.';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { PhotographController } from '../../../app/controllers/resources/photograph.controller';
import { IdGenerationModule } from '../../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../../persistence/persistence.module';
import { DynamicDataTypeModule } from '../../../validation';
import { EventModule } from '../../common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../shared/common-commands/publish-resource/resource-published.event-handler';
import { ArangoQueryRepositoryProvider } from '../term/repositories/arango-query-repository-provider';
import { CreatePhotographCommandHandler } from './commands/create-photograph/create-photograph.command-handler';
import { Photograph } from './entities/photograph.entity';
import { PHOTOGRAPH_QUERY_REPOSITORY_TOKEN } from './queries';
import { PhotographQueryService } from './queries/photograph-query.service';

@Module({
    imports: [
        ConfigModule,
        PersistenceModule,
        DynamicDataTypeModule,
        CommandModule,
        IdGenerationModule,
        EventModule,
        PhotographCommandsModule,
    ],
    controllers: [PhotographController],
    providers: [
        CommandInfoService,
        PhotographQueryService,
        {
            provide: PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
            useFactory: (provider: ArangoQueryRepositoryProvider) =>
                provider.forResource(ResourceType.photograph),
            inject: [QUERY_REPOSITORY_PROVIDER_TOKEN],
        },
        CreatePhotograph,
        CreatePhotographCommandHandler,
        // Data classes
        ...[
            // Domain Model
            Photograph,
            // Events
            PhotographCreated,
        ].map((Ctor) => ({
            provide: Ctor,
            useValue: Ctor,
        })),
        // PhotographCreatedEventHandler,
    ],
    exports: [PhotographQueryService],
})
export class PhotographModule {}
