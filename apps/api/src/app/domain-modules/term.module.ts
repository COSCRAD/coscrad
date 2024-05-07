import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    AddAudioForTerm,
    AddAudioForTermCommandHandler,
    AudioAddedForTerm,
    CreatePromptTerm,
    CreatePromptTermCommandHandler,
    CreateTerm,
    CreateTermCommandHandler,
    ElicitTermFromPrompt,
    ElicitTermFromPromptCommandHandler,
    PromptTermCreated,
    TermCreated,
    TermElicitedFromPrompt,
    TermTranslated,
    TranslateTerm,
    TranslateTermCommandHandler,
} from '../../domain/models/term/commands';
import { Term } from '../../domain/models/term/entities/term.entity';
import { TermQueryService } from '../../domain/services/query-services/term-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { TermController } from '../controllers/resources/term.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [TermController],
    providers: [
        CommandInfoService,
        TermQueryService,
        CreateTermCommandHandler,
        CreatePromptTermCommandHandler,
        TranslateTermCommandHandler,
        ElicitTermFromPromptCommandHandler,
        AddAudioForTermCommandHandler,
        // Data Classes
        ...[
            // Domain Model
            Term,
            // Commands
            CreateTerm,
            CreatePromptTerm,
            TranslateTerm,
            ElicitTermFromPrompt,
            AddAudioForTerm,
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
    ],
})
export class TermModule {}
