import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { ConsoleCoscradCliLogger } from '../../coscrad-cli/logging';
import { EventModule } from '../../domain/common';
import { AUDIO_QUERY_REPOSITORY_TOKEN } from '../../domain/models/audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../domain/models/audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import {
    AudioAddedForTerm,
    PromptTermCreated,
    TermCreated,
    TermElicitedFromPrompt,
    TermElicitedFromPromptEventHandler,
    TermTranslated,
} from '../../domain/models/term/commands';
import { AudioAddedForTermEventHandler } from '../../domain/models/term/commands/add-audio-for-term/audio-added-for-term.event-handler';
import { PromptTermCreatedEventHandler } from '../../domain/models/term/commands/create-prompt-term/prompt-term-created.event-handler';
import { TermCreatedEventHandler } from '../../domain/models/term/commands/create-term/term-created.event-handler';
import { TermTranslatedEventHandler } from '../../domain/models/term/commands/translate-term/term-translated.event-handler';
import { Term } from '../../domain/models/term/entities/term.entity';
import { TERM_QUERY_REPOSITORY_TOKEN } from '../../domain/models/term/queries';
import { ArangoTermQueryRepository } from '../../domain/models/term/repositories';
import { TermQueryService } from '../../domain/services/query-services/term-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { ArangoConnectionProvider } from '../../persistence/database/arango-connection.provider';
import { PersistenceModule } from '../../persistence/persistence.module';
import { DynamicDataTypeModule } from '../../validation';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { TermController } from '../controllers/resources/term.controller';
import { TermCommandsModule } from './term.commands.module';

@Module({
    imports: [
        PersistenceModule,
        DynamicDataTypeModule,
        CommandModule,
        IdGenerationModule,
        EventModule,
        TermCommandsModule,
    ],
    controllers: [TermController],
    providers: [
        CommandInfoService,
        TermQueryService,
        {
            provide: AUDIO_QUERY_REPOSITORY_TOKEN,
            useFactory: (arangoConnectionProvider: ArangoConnectionProvider) =>
                new ArangoAudioItemQueryRepository(arangoConnectionProvider),
            inject: [ArangoConnectionProvider],
        },
        {
            provide: TERM_QUERY_REPOSITORY_TOKEN,
            useFactory: (
                arangoConnectionProvider: ArangoConnectionProvider,
                audioItemQueryRepository: ArangoAudioItemQueryRepository
            ) =>
                new ArangoTermQueryRepository(
                    arangoConnectionProvider,
                    audioItemQueryRepository,
                    new ConsoleCoscradCliLogger()
                ),
            inject: [ArangoConnectionProvider, AUDIO_QUERY_REPOSITORY_TOKEN],
        },
        // Data Classes
        ...[
            // Domain Model
            Term,
            // Events
            TermCreated,
            PromptTermCreated,
            TermTranslated,
            TermElicitedFromPrompt,
            AudioAddedForTerm,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
        // Event Handlers
        TermCreatedEventHandler,
        TermTranslatedEventHandler,
        PromptTermCreatedEventHandler,
        TermElicitedFromPromptEventHandler,
        AudioAddedForTermEventHandler,
    ],
    exports: [TermQueryService],
})
export class TermModule {}
