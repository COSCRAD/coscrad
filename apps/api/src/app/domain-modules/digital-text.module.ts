import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CoscradEventFactory, EventModule } from '../../domain/common';
import {
    AddAudioForDigitalTextPage,
    AddAudioForDigitalTextPageCommandHandler,
    AddPageToDigitalText,
    AddPageToDigitalTextCommandHandler,
    AudioAddedForDigitalTextPage,
    DigitalTextPageContentTranslated,
    PageAddedToDigitalText,
    TranslateDigitalTextPageContent,
} from '../../domain/models/digital-text/commands';
import {
    AddContentToDigitalTextPage,
    AddContentToDigitalTextPageCommandHandler,
    ContentAddedToDigitalTextPage,
} from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import { CreateDigitalText } from '../../domain/models/digital-text/commands/create-digital-text/create-digital-text.command';
import { CreateDigitalTextCommandHandler } from '../../domain/models/digital-text/commands/create-digital-text/create-digital-text.command-handler';
import { AudioAddedForDigitalTextPageEventHandler } from '../../domain/models/digital-text/commands/events/audio-added-for-digital-text-page.event-handler';
import { ContentAddedToDigitalTextPageEventHandler } from '../../domain/models/digital-text/commands/events/content-added-to-digital-text-page.event-handler';
import { DigitalTextCreated } from '../../domain/models/digital-text/commands/events/digital-text-created.event';
import { DigitalTextCreatedEventHandler } from '../../domain/models/digital-text/commands/events/digital-text-created.event-handler';
import { DigitalTextPageContentTranslatedEventHandler } from '../../domain/models/digital-text/commands/events/digital-text-page-content-translated.event-handler';
import { PageAddedToDigitalTextEventHandler } from '../../domain/models/digital-text/commands/events/page-added-to-digital-text.event-handler';
import { DigitalText } from '../../domain/models/digital-text/entities/digital-text.entity';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { ArangoEventRepository } from '../../persistence/repositories/arango-event-repository';
import { DigitalTextQueryService } from '../../queries/digital-text';
import { DynamicDataTypeFinderService } from '../../validation';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { DigitalTextQueryController } from '../controllers/resources/digital-text.controller';

/**
 * TODO Move this to the models directory
 */
@Module({
    imports: [CommandModule, IdGenerationModule, EventModule],
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
        // Event Handlers
        DigitalTextCreatedEventHandler,
        PageAddedToDigitalTextEventHandler,
        ContentAddedToDigitalTextPageEventHandler,
        DigitalTextPageContentTranslatedEventHandler,
        AudioAddedForDigitalTextPageEventHandler,
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
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
    exports: [DigitalTextQueryService],
})
export class DigitalTextModule {}
