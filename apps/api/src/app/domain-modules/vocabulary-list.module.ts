import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    CreateVocabularyList,
    CreateVocabularyListCommandHandler,
} from '../../domain/models/vocabulary-list/commands/create-vocabulary-list';
import { VocabularyListQueryService } from '../../domain/services/query-services/vocabulary-list-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { VocabularyListController } from '../controllers/resources/vocabulary-list.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [VocabularyListController],
    providers: [
        CommandInfoService,
        VocabularyListQueryService,
        CreateVocabularyListCommandHandler,
        // Data Classes
        ...[CreateVocabularyList].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class VocabularyListModule {}
