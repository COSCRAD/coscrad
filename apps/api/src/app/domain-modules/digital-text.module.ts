import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    AddPageToDigitalText,
    AddPageToDigitalTextCommandHandler,
    PageAddedToDigitalText,
} from '../../domain/models/digital-text/commands';
import {
    AddContentToDigitalTextPage,
    ContentAddedToDigitalTextPage,
} from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import { CreateDigitalText } from '../../domain/models/digital-text/commands/create-digital-text.command';
import { CreateDigitalTextCommandHandler } from '../../domain/models/digital-text/commands/create-digital-text.command-handler';
import { DigitalTextCreated } from '../../domain/models/digital-text/commands/digital-text-created.event';
import { DigitalText } from '../../domain/models/digital-text/entities/digital-text.entity';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { DigitalTextQueryService } from '../../queries/digital-text';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { DigitalTextQueryController } from '../controllers/resources/digital-text.controller';

@Module({
    imports: [CommandModule, IdGenerationModule],
    controllers: [DigitalTextQueryController],
    providers: [
        CommandInfoService,
        CreateDigitalTextCommandHandler,
        AddPageToDigitalTextCommandHandler,
        DigitalTextQueryService,
        ...[
            // Domain Model
            DigitalText,
            // Commands
            CreateDigitalText,
            AddPageToDigitalText,
            AddContentToDigitalTextPage,
            // Events
            DigitalTextCreated,
            PageAddedToDigitalText,
            ContentAddedToDigitalTextPage,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class DigitalTextModule {}
