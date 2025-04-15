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
import { CreatePhotographCommandHandler } from './commands/create-photograph/create-photograph.command-handler';
import { PhotographCreatedEventHandler } from './commands/create-photograph/photograph-created.event-handler';
import { Photograph } from './entities/photograph.entity';
import { PHOTOGRAPH_QUERY_REPOSITORY_TOKEN } from './queries';
import { PhotographQueryService } from './queries/photograph-query.service';
import { ArangoPhotographQueryRepository } from './repositories';

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
            useClass: ArangoPhotographQueryRepository,
        },
        CreatePhotograph,
        CreatePhotographCommandHandler,
        // Event Handlers
        PhotographCreatedEventHandler,
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
