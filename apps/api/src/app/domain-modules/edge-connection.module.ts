import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import {
    EdgeConnection,
    EdgeConnectionMember,
} from '../../domain/models/context/edge-connection.entity';
import { FreeMultilineContext } from '../../domain/models/context/free-multiline-context/free-multiline-context.entity';
import { GeneralContext } from '../../domain/models/context/general-context/general-context.entity';
import { IdentityContext } from '../../domain/models/context/identity-context.entity/identity-context.entity';
import { PageRangeContext } from '../../domain/models/context/page-range-context/page-range.context.entity';
import { PointContext } from '../../domain/models/context/point-context/point-context.entity';
import { TextFieldContext } from '../../domain/models/context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionQueryService } from '../../domain/services/query-services/edge-connection-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { NoteViewModel } from '../../view-models/edgeConnectionViewModels/note.view-model';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { EdgeConnectionController } from '../controllers/edgeConnection.controller';

import {
    CreateNoteAboutResource,
    CreateNoteAboutResourceCommandHandler,
} from '../../domain/models/context/commands';

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
            GeneralContext,
            FreeMultilineContext,
            TimeRangeContext,
            PageRangeContext,
            PointContext,
            TextFieldContext,
            IdentityContext,
            // Commands
            CreateNoteAboutResource,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),

        CreateNoteAboutResourceCommandHandler,
    ],
})
export class EdgeConnectionModule {}
