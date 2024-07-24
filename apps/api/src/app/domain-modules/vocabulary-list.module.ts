import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { ConsoleCoscradCliLogger } from '../../coscrad-cli/logging';
import {
    AddTermToVocabularyList,
    AddTermToVocabularyListCommandHandler,
    AnalyzeTermInVocabularyList,
    AnalyzeTermInVocabularyListCommandHandler,
    CreateVocabularyList,
    CreateVocabularyListCommandHandler,
    EntriesImportedToVocabularyList,
    ImportEntriesToVocabularyList,
    ImportEntriesToVocabularyListCommandHandler,
    RegisterVocabularyListFilterProperty,
    RegisterVocabularyListFilterPropertyCommandHandler,
    TranslateVocabularyListName,
    TranslateVocabularyListNameCommandHandler,
} from '../../domain/models/vocabulary-list/commands';
import { VocabularyListNameTranslated } from '../../domain/models/vocabulary-list/commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event';
import { VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN } from '../../domain/models/vocabulary-list/queries';
import { ArangoVocabularyListQueryRepository } from '../../domain/models/vocabulary-list/repositories';
import { VocabularyListQueryService } from '../../domain/services/query-services/vocabulary-list-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { VocabularyListController } from '../controllers/resources/vocabulary-list.controller';

@Module({
    imports: [PersistenceModule, IdGenerationModule, CommandModule],
    controllers: [VocabularyListController],
    providers: [
        {
            provide: VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
            useFactory: (databaseProvider: ArangoDatabaseProvider) =>
                new ArangoVocabularyListQueryRepository(
                    databaseProvider,
                    new ConsoleCoscradCliLogger()
                ),
            inject: [ArangoDatabaseProvider],
        },
        CommandInfoService,
        VocabularyListQueryService,
        CreateVocabularyListCommandHandler,
        TranslateVocabularyListNameCommandHandler,
        AddTermToVocabularyListCommandHandler,
        AnalyzeTermInVocabularyListCommandHandler,
        RegisterVocabularyListFilterPropertyCommandHandler,
        AnalyzeTermInVocabularyList,
        ImportEntriesToVocabularyList,
        ImportEntriesToVocabularyListCommandHandler,
        // Data Classes
        ...[
            CreateVocabularyList,
            TranslateVocabularyListName,
            VocabularyListNameTranslated,
            AddTermToVocabularyList,
            RegisterVocabularyListFilterProperty,
            AnalyzeTermInVocabularyList,
            EntriesImportedToVocabularyList,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class VocabularyListModule {}
