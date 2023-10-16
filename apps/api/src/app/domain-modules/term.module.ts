import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    CreatePromptTerm,
    CreatePromptTermCommandHandler,
    CreateTerm,
    CreateTermCommandHandler,
    ElicitTermFromPrompt,
    ElicitTermFromPromptCommandHandler,
    TranslateTerm,
    TranslateTermCommandHandler,
} from '../../domain/models/term/commands';
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
        // Data Classes
        ...[CreateTerm, CreatePromptTerm, TranslateTerm, ElicitTermFromPrompt].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class TermModule {}
