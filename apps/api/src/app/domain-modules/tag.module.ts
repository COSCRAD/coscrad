import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    CreateTag,
    CreateTagCommandHandler,
    RelabelTag,
    RelabelTagCommandHandler,
    TagResourceOrNote,
    TagResourceOrNoteCommandHandler,
} from '../../domain/models/tag/commands';
import { TagQueryService } from '../../domain/services/query-services/tag-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { TagController } from '../controllers/tag.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [TagController],
    providers: [
        CommandInfoService,
        TagQueryService,
        CreateTag,
        CreateTagCommandHandler,
        RelabelTag,
        RelabelTagCommandHandler,
        TagResourceOrNote,
        TagResourceOrNoteCommandHandler,
    ],
})
export class TagModule {}
