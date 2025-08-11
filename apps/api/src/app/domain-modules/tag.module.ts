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
import { TagCreatedEventHandler } from '../../domain/models/tag/commands/create-tag/tag-created-event-handler';
import { TagCreated } from '../../domain/models/tag/commands/create-tag/tag-created.event';
import { TagRelabelledEventHandler } from '../../domain/models/tag/commands/relabel-tag/tag-relabelled.event-handler';
import { ResourceAddedToTagEventHandler } from '../../domain/models/tag/commands/tag-resource-or-note/resource-added-to-tag.event-handler';
import { ResourceOrNoteTagged } from '../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event';
import { TagAddedForResourceEventHandler } from '../../domain/models/tag/commands/tag-resource-or-note/tag-added-for-resource.event-handler';
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
        TagAddedForResourceEventHandler,
        TagCreatedEventHandler,
        TagRelabelledEventHandler,
        ResourceAddedToTagEventHandler,
        // Does this belong here?
        ArangoEventRepository,
        CoscradEventFactory,
        DynamicDataTypeFinderService,
        // Data Classes
        ...[
            //Events
            TagCreated,
            ResourceOrNoteTagged,
        ].map((Ctor) => ({
            provide: Ctor,
            useValue: Ctor,
        })),
    ],
})
export class TagModule {}
