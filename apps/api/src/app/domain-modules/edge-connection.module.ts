import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    EdgeConnection,
    EdgeConnectionMember,
} from '../../domain/models/context/edge-connection.entity';
import { FreeMultilineContext } from '../../domain/models/context/free-multiline-context/free-multiline-context.entity';
import { GeneralContext } from '../../domain/models/context/general-context/general-context.entity';
import { PageRangeContext } from '../../domain/models/context/page-range-context/page-range.context.entity';
import { PointContext } from '../../domain/models/context/point-context/point-context.entity';
import { TextFieldContext } from '../../domain/models/context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionQueryService } from '../../domain/services/query-services/edge-connection-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { NoteViewModel } from '../../queries/edgeConnectionViewModels/note.view-model';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { EdgeConnectionController } from '../controllers/edge-connection.controller';

import {
    AddAudioForNote,
    AddAudioForNoteCommandHandler,
    AudioAddedForNote,
    ConnectResourcesWithNote,
    ConnectResourcesWithNoteCommandHandler,
    CreateNoteAboutResource,
    CreateNoteAboutResourceCommandHandler,
    NoteTranslated,
    TranslateNote,
    TranslateNoteCommandHandler,
} from '../../domain/models/context/commands';
import { ResourcesConnectedWithNote } from '../../domain/models/context/commands/connect-resources-with-note/resources-connected-with-note.event';
import { NoteAboutResourceCreated } from '../../domain/models/context/commands/create-note-about-resource/note-about-resource-created.event';
import { EdgeConnectionContextUnion } from '../../domain/models/context/edge-connection-context-union';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [EdgeConnectionController],
    providers: [
        CommandInfoService,
        EdgeConnectionQueryService,
        // Data Classes
        ...[
            EdgeConnection,
            NoteViewModel,
            EdgeConnectionMember,
            // context models
            EdgeConnectionContextUnion,
            GeneralContext,
            FreeMultilineContext,
            TimeRangeContext,
            PageRangeContext,
            PointContext,
            TextFieldContext,
            // Commands
            CreateNoteAboutResource,
            ConnectResourcesWithNote,
            TranslateNote,
            AddAudioForNote,
            // Events
            NoteAboutResourceCreated,
            ResourcesConnectedWithNote,
            NoteTranslated,
            AudioAddedForNote,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),

        CreateNoteAboutResourceCommandHandler,
        ConnectResourcesWithNoteCommandHandler,
        TranslateNoteCommandHandler,
        AddAudioForNoteCommandHandler,
    ],
    exports: [EdgeConnectionQueryService],
})
export class EdgeConnectionModule {}
