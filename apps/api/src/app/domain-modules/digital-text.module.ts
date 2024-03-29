import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CoscradEventFactory } from '../../domain/common';
import {
    AddAudioForDigitalTextPage,
    AddAudioForDigitalTextPageCommandHandler,
    AddPageToDigitalText,
    AddPageToDigitalTextCommandHandler,
    AudioAddedForDigitalTextPage,
    DigitalTextPageContentTranslated,
    DigitalTextTitleTranslated,
    PageAddedToDigitalText,
    TranslateDigitalTextPageContent,
} from '../../domain/models/digital-text/commands';
import {
    AddContentToDigitalTextPage,
    AddContentToDigitalTextPageCommandHandler,
    ContentAddedToDigitalTextPage,
} from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import { CreateDigitalText } from '../../domain/models/digital-text/commands/create-digital-text.command';
import { CreateDigitalTextCommandHandler } from '../../domain/models/digital-text/commands/create-digital-text.command-handler';
import { DigitalTextCreated } from '../../domain/models/digital-text/commands/digital-text-created.event';
import { DigitalText } from '../../domain/models/digital-text/entities/digital-text.entity';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { ArangoEventRepository } from '../../persistence/repositories/arango-event-repository';
import { DigitalTextQueryService } from '../../queries/digital-text';
import { DynamicDataTypeFinderService } from '../../validation';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { DigitalTextQueryController } from '../controllers/resources/digital-text.controller';

@Module({
    imports: [CommandModule, IdGenerationModule],
    controllers: [DigitalTextQueryController],
    providers: [
        CommandInfoService,
        ArangoEventRepository,
        DynamicDataTypeFinderService,
        CoscradEventFactory,
        CreateDigitalTextCommandHandler,
        AddPageToDigitalTextCommandHandler,
        AddContentToDigitalTextPageCommandHandler,
        AddAudioForDigitalTextPageCommandHandler,
        DigitalTextQueryService,

        ...[
            // Domain Model
            DigitalText,
            // Commands
            CreateDigitalText,
            AddPageToDigitalText,
            AddContentToDigitalTextPage,
            TranslateDigitalTextPageContent,
            AddAudioForDigitalTextPage,
            // Events
            DigitalTextCreated,
            PageAddedToDigitalText,
            ContentAddedToDigitalTextPage,
            DigitalTextPageContentTranslated,
            AudioAddedForDigitalTextPage,
            DigitalTextTitleTranslated,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class DigitalTextModule {}
