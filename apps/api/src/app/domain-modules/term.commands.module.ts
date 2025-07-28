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
import { AddImageForTerm } from '../../domain/models/term/commands/add-image-for-term/add-image-for-term.command';
import { AddImageForTermCommandHandler } from '../../domain/models/term/commands/add-image-for-term/add-image-for-term.command-handler';
import { ProvideLiteralTranslationOfTerm } from '../../domain/models/term/commands/provide-literal-translation-of-term/provide-literal-translation-of-term.command';
import { ProvideLiteralTranslationOfTermCommandHandler } from '../../domain/models/term/commands/provide-literal-translation-of-term/provide-literal-translation-of-term.command-handler';
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
        AddImageForTermCommandHandler,
        ...[
            CreateTerm,
            CreatePromptTerm,
            TranslateTerm,
            ElicitTermFromPrompt,
            AddAudioForTerm,
            ProvideLiteralTranslationOfTerm,
            AddImageForTerm,
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
        AddImageForTerm,
    ],
})
export class TermCommandsModule {}
