import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreatePhotograph, PhotographCreated } from '../../domain/models/photograph';
import { CreatePhotographCommandHandler } from '../../domain/models/photograph/commands/create-photograph/create-photograph.command-handler';
import { PhotographQueryService } from '../../domain/services/query-services/photograph-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { PhotographController } from '../controllers/resources/photograph.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [PhotographController],
    providers: [
        CommandInfoService,
        PhotographQueryService,
        CreatePhotograph,
        CreatePhotographCommandHandler,
        // Data classes
        ...[
            // Events
            PhotographCreated,
        ].map((Ctor) => ({
            provide: Ctor,
            useValue: Ctor,
        })),
    ],
})
export class PhotographModule {}
