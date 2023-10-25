import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    AddPageToDigitalText,
    AddPageToDigitalTextCommandHandler,
    PageAddedToDigitalText,
} from '../../domain/models/digital-text/commands';
import { CreateDigitalText } from '../../domain/models/digital-text/commands/create-digital-text.command';
import { CreateDigitalTextCommandHandler } from '../../domain/models/digital-text/commands/create-digital-text.command-handler';
import { DigitalTextCreated } from '../../domain/models/digital-text/commands/digital-text-created.event';
import { DigitalText } from '../../domain/models/digital-text/entities/digital-text.entity';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    providers: [
        CommandInfoService,
        CreateDigitalTextCommandHandler,
        AddPageToDigitalTextCommandHandler,
        ...[
            // Domain Model
            DigitalText,
            // Commands
            CreateDigitalText,
            AddPageToDigitalText,
            // Events
            DigitalTextCreated,
            PageAddedToDigitalText,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class DigitalTextModule {}
