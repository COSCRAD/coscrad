import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CoscradEventFactory } from '../../domain/common';
import {
    AddAudioForDigitalTextPage,
    AddAudioForDigitalTextPageCommandHandler,
    AddAudioForDigitalTextTitle,
    AddPageToDigitalText,
    AddPageToDigitalTextCommandHandler,
    AudioAddedForDigitalTextPage,
    AudioAddedForDigitalTextTitle,
    DigitalTextPageContentTranslated,
    DigitalTextTitleTranslated,
    PageAddedToDigitalText,
    PagesImportedToDigitalText,
    TranslateDigitalTextPageContent,
    TranslateDigitalTextTitle,
} from '../../domain/models/digital-text/commands';
import { AudioAddedForDigitalTextPageEventHandler } from '../../domain/models/digital-text/commands/add-audio-for-digital-text-page/audio-added-for-digital-text-page.event-handler';
import { AudioAddedForDigitalTextTitleEventHandler } from '../../domain/models/digital-text/commands/add-audio-for-digital-text-title/audio-added-for-digital-text-title.event-handler';
import {
    AddContentToDigitalTextPage,
    AddContentToDigitalTextPageCommandHandler,
    ContentAddedToDigitalTextPage,
} from '../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import { ContentAddedToDigitalTextPageEventHandler } from '../../domain/models/digital-text/commands/add-content-to-digital-text-page/content-added-to-digital-text-page.event-handler';
import { PageAddedToDigitalTextEventHandler } from '../../domain/models/digital-text/commands/add-page-to-digital-text/page-added-to-digital-text.event-handler';
import { CreateDigitalText } from '../../domain/models/digital-text/commands/create-digital-text.command';
import { CreateDigitalTextCommandHandler } from '../../domain/models/digital-text/commands/create-digital-text.command-handler';
import { DigitalTextCreated } from '../../domain/models/digital-text/commands/digital-text-created.event';
import { DigitalTextCreatedEventHandler } from '../../domain/models/digital-text/commands/digital-text-created.event-handler';
import { PagesImportedToDigitalTextEventHandler } from '../../domain/models/digital-text/commands/import-pages-to-digital-text/pages-imported-to-digital-text.event-handler';
import { DigitalTextPageContentTranslatedEventHandler } from '../../domain/models/digital-text/commands/translate-digital-text-page-content/digital-text-page-content-translated.event-handler';
import { DigitalTextTitleTranslatedEventHandler } from '../../domain/models/digital-text/commands/translate-digital-text-title/digital-text-title-translated.event-handler';
import { DigitalText } from '../../domain/models/digital-text/entities/digital-text.entity';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { CoscradNLPModule } from '../../lib/nlp';
import { ArangoEventRepository } from '../../persistence/repositories/arango-event-repository';
import { DigitalTextQueryService } from '../../queries/digital-text';
import { DynamicDataTypeModule } from '../../validation';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { DigitalTextQueryController } from '../controllers/resources/digital-text.controller';

@Module({
    imports: [CommandModule, IdGenerationModule, CoscradNLPModule, DynamicDataTypeModule],
    controllers: [DigitalTextQueryController],
    providers: [
        CommandInfoService,
        ArangoEventRepository,
        CoscradEventFactory,
        CreateDigitalTextCommandHandler,
        AddPageToDigitalTextCommandHandler,
        AddContentToDigitalTextPageCommandHandler,
        AddAudioForDigitalTextPageCommandHandler,
        DigitalTextQueryService,
        DigitalTextCreatedEventHandler,
        DigitalTextTitleTranslatedEventHandler,
        PageAddedToDigitalTextEventHandler,
        ContentAddedToDigitalTextPageEventHandler,
        DigitalTextPageContentTranslatedEventHandler,
        AudioAddedForDigitalTextPageEventHandler,
        AudioAddedForDigitalTextTitleEventHandler,
        PagesImportedToDigitalTextEventHandler,
        ...[
            // Domain Model
            DigitalText,
            // Commands
            CreateDigitalText,
            AddPageToDigitalText,
            AddContentToDigitalTextPage,
            TranslateDigitalTextPageContent,
            TranslateDigitalTextTitle,
            AddAudioForDigitalTextPage,
            AddAudioForDigitalTextTitle,
            // Events
            DigitalTextCreated,
            PageAddedToDigitalText,
            ContentAddedToDigitalTextPage,
            DigitalTextPageContentTranslated,
            DigitalTextTitleTranslated,
            AudioAddedForDigitalTextPage,
            AudioAddedForDigitalTextTitle,
            DigitalTextTitleTranslated,
            PagesImportedToDigitalText,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class DigitalTextModule {}
