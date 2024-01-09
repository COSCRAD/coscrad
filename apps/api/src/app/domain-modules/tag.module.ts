import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CoscradEventFactory } from '../../domain/common';
import {
    CreateTag,
    CreateTagCommandHandler,
    RelabelTag,
    RelabelTagCommandHandler,
    TagResourceOrNote,
    TagResourceOrNoteCommandHandler,
} from '../../domain/models/tag/commands';
import { ResourceOrNoteTagged } from '../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event';
import { ResourceOrNoteTaggedEventHandler } from '../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event-handler';
import { TagQueryService } from '../../domain/services/query-services/tag-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { ArangoEventRepository } from '../../persistence/repositories/arango-event-repository';
import { DynamicDataTypeFinderService } from '../../validation';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { TagController } from '../controllers/tag.controller';

@Module({
    imports: [CommandModule, IdGenerationModule],
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
        // Does this belong here?
        ArangoEventRepository,
        CoscradEventFactory,
        DynamicDataTypeFinderService,
        ResourceOrNoteTaggedEventHandler,
        // Data Classes
        ...[
            //Events
            ResourceOrNoteTagged,
        ].map((Ctor) => ({
            provide: Ctor,
            useValue: Ctor,
        })),
    ],
})
export class TagModule {}
