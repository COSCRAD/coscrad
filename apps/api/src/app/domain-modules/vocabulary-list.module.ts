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
    TermAddedToVocabularyList,
    TermInVocabularyListAnalyzed,
    TranslateVocabularyListName,
    TranslateVocabularyListNameCommandHandler,
    VocabularyListCreated,
    VocabularyListCreatedEventHandler,
    VocabularyListFilterPropertyRegistered,
} from '../../domain/models/vocabulary-list/commands';
import { TermAddedToVocabularyListEventHandler } from '../../domain/models/vocabulary-list/commands/add-term-to-vocabulary-list/term-added-to-vocabulary-list.event-handler';
import { TermInVocabularyListAnalyzedEventHandler } from '../../domain/models/vocabulary-list/commands/analyze-term-in-vocabulary-list/term-in-vocabulary-list-analyzed.event-handler';
import { EntriesImportedToVocabularyListEventHandler } from '../../domain/models/vocabulary-list/commands/import-entries-to-vocabulary-list/entries-imported-to-vocabulary-list.event-handler';
import { VocabularyListFilterPropertyRegisteredEventHandler } from '../../domain/models/vocabulary-list/commands/register-vocabulary-list-filter-property/vocabulary-list-filter-property-registered.event-handler';
import { VocabularyListNameTranslated } from '../../domain/models/vocabulary-list/commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event';
import { VocabularyListNameTranslatedEventHandler } from '../../domain/models/vocabulary-list/commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event-handler';
import { VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN } from '../../domain/models/vocabulary-list/queries';
import { ArangoVocabularyListQueryRepository } from '../../domain/models/vocabulary-list/repositories';
import { VocabularyListQueryService } from '../../domain/services/query-services/vocabulary-list-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { ArangoConnectionProvider } from '../../persistence/database/arango-connection.provider';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { VocabularyListController } from '../controllers/resources/vocabulary-list.controller';

@Module({
    imports: [PersistenceModule, IdGenerationModule, CommandModule],
    controllers: [VocabularyListController],
    providers: [
        {
            provide: VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
            useFactory: (connectionProvider: ArangoConnectionProvider) =>
                new ArangoVocabularyListQueryRepository(
                    connectionProvider,
                    new ConsoleCoscradCliLogger()
                ),
            inject: [ArangoConnectionProvider],
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
        // Event Handlers
        VocabularyListCreatedEventHandler,
        VocabularyListNameTranslatedEventHandler,
        VocabularyListFilterPropertyRegisteredEventHandler,
        TermAddedToVocabularyListEventHandler,
        TermInVocabularyListAnalyzedEventHandler,
        EntriesImportedToVocabularyListEventHandler,

        // Data Classes
        ...[
            CreateVocabularyList,
            TranslateVocabularyListName,
            VocabularyListNameTranslated,
            AddTermToVocabularyList,
            RegisterVocabularyListFilterProperty,
            AnalyzeTermInVocabularyList,
            EntriesImportedToVocabularyList,
            // events
            VocabularyListCreated,
            VocabularyListNameTranslated,
            TermAddedToVocabularyList,
            VocabularyListFilterPropertyRegistered,
            TermInVocabularyListAnalyzed,
            EntriesImportedToVocabularyList,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class VocabularyListModule {}
