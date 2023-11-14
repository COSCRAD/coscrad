import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    AddTermToVocabularyList,
    AddTermtoVocabularyListCommandHandler,
    CreateVocabularyList,
    CreateVocabularyListCommandHandler,
    RegisterVocabularyListFilterProperty,
    RegisterVocabularyListFilterPropertyCommandHandler,
    TranslateVocabularyListName,
    TranslateVocabularyListNameCommandHandler,
} from '../../domain/models/vocabulary-list/commands';

import { VocabularyListNameTranslated } from '../../domain/models/vocabulary-list/commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event';
import { VocabularyListQueryService } from '../../domain/services/query-services/vocabulary-list-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { VocabularyListController } from '../controllers/resources/vocabulary-list.controller';

@Module({
    imports: [PersistenceModule, IdGenerationModule, CommandModule],
    controllers: [VocabularyListController],
    providers: [
        CommandInfoService,
        VocabularyListQueryService,
        CreateVocabularyListCommandHandler,
        TranslateVocabularyListNameCommandHandler,
        AddTermtoVocabularyListCommandHandler,
        RegisterVocabularyListFilterPropertyCommandHandler,
        // Data Classes
        ...[
            CreateVocabularyList,
            TranslateVocabularyListName,
            VocabularyListNameTranslated,
            AddTermToVocabularyList,
            RegisterVocabularyListFilterProperty,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class VocabularyListModule {}
