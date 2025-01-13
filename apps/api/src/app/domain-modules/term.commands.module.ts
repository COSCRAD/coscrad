import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    AddAudioForTerm,
    AddAudioForTermCommandHandler,
    CreatePromptTerm,
    CreatePromptTermCommandHandler,
    CreateTerm,
    CreateTermCommandHandler,
    ElicitTermFromPrompt,
    ElicitTermFromPromptCommandHandler,
    TranslateTerm,
    TranslateTermCommandHandler,
} from '../../domain/models/term/commands';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';

/**
 * TODO Move this and the Term module to the Term
 * directory in the domain.
 */
@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    providers: [
        CreateTermCommandHandler,
        CreatePromptTermCommandHandler,
        TranslateTermCommandHandler,
        ElicitTermFromPromptCommandHandler,
        AddAudioForTermCommandHandler,
        ...[CreateTerm, CreatePromptTerm, TranslateTerm, ElicitTermFromPrompt, AddAudioForTerm].map(
            (Ctor) => ({
                provide: Ctor,
                useValue: Ctor,
            })
        ),
    ],
    exports: [CreateTerm, CreatePromptTerm, TranslateTerm, ElicitTermFromPrompt, AddAudioForTerm],
})
export class TermCommandsModule {}
