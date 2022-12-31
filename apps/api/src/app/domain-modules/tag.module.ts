import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreateTag } from '../../domain/models/tag/commands/create-tag.command';
import { CreateTagCommandHandler } from '../../domain/models/tag/commands/create-tag.command-handler';
import { RelabelTag, RelabelTagCommandHandler } from '../../domain/models/tag/commands/relabel-tag';
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
    ],
})
export class TagModule {}
