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
import { AddPhotograhForTerm } from '../../domain/models/term/commands/add-photograph-for-term/add-photograph-for-term.command';
import { AddPhotographForTermCommandHandler } from '../../domain/models/term/commands/add-photograph-for-term/add-photograph-for-term.command-handler';
import { AddVideoForTerm } from '../../domain/models/term/commands/add-video-for-term/add-video-for-term.command';
import { AddVideoForTermCommandHandler } from '../../domain/models/term/commands/add-video-for-term/add-video-for-term.command-handler';
import { ProvideLiteralTranslationOfTerm } from '../../domain/models/term/commands/provide-literal-translation-of-term/provide-literal-translation-of-term.command';
import { ProvideLiteralTranslationOfTermCommandHandler } from '../../domain/models/term/commands/provide-literal-translation-of-term/provide-literal-translation-of-term.command-handler';
import { RegisterPromptForExistingTerm } from '../../domain/models/term/commands/register-prompt-for-existing-term/register-prompt-for-existing-term.command';
import { RegisterPromptForExistingTermCommandHandler } from '../../domain/models/term/commands/register-prompt-for-existing-term/register-prompt-for-existing-term.command-handler';
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
        ProvideLiteralTranslationOfTermCommandHandler,
        AddPhotographForTermCommandHandler,
        AddVideoForTermCommandHandler,
        RegisterPromptForExistingTermCommandHandler,
        ...[
            CreateTerm,
            CreatePromptTerm,
            TranslateTerm,
            ElicitTermFromPrompt,
            AddAudioForTerm,
            ProvideLiteralTranslationOfTerm,
            AddPhotograhForTerm,
            AddVideoForTerm,
            RegisterPromptForExistingTerm,
        ].map((Ctor) => ({
            provide: Ctor,
            useValue: Ctor,
        })),
    ],
    exports: [
        CreateTerm,
        CreatePromptTerm,
        TranslateTerm,
        ElicitTermFromPrompt,
        AddAudioForTerm,
        AddPhotograhForTerm,
        AddVideoForTerm,
        RegisterPromptForExistingTerm,
    ],
})
export class TermCommandsModule {}
