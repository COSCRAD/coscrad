import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { Test } from '@nestjs/testing';
import { NoteViewModel } from '../../../queries/edgeConnectionViewModels/note.view-model';
import { TestEventStream } from '../../../test-data/events';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../validation';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { ConnectResourcesWithNote, CreateNoteAboutResource } from './commands';
import { ResourcesConnectedWithNote } from './commands/connect-resources-with-note/resources-connected-with-note.event';
import { NoteAboutResourceCreated } from './commands/create-note-about-resource/note-about-resource-created.event';
import { EdgeConnectionContextUnion } from './edge-connection-context-union';
import { EdgeConnection, EdgeConnectionMember } from './edge-connection.entity';
import { FreeMultilineContext } from './free-multiline-context/free-multiline-context.entity';
import { GeneralContext } from './general-context/general-context.entity';
import { PageRangeContext } from './page-range-context/page-range.context.entity';
import { PointContext } from './point-context/point-context.entity';
import { TextFieldContext } from './text-field-context/text-field-context.entity';
import { TimeRangeContext } from './time-range-context/time-range-context.entity';

const noteText = 'this is cool';

const generalContext = new GeneralContext();

const originalLanguageCode = LanguageCode.English;

const noteAboutResourceCreated = new TestEventStream().andThen<NoteAboutResourceCreated>({
    type: 'NOTE_ABOUT_RESOURCE_CREATED',
    payload: {
        text: noteText,
        resourceContext: generalContext.toDTO(),
        languageCode: originalLanguageCode,
    },
});

const edgeConnectionId = buildDummyUuid(1);

const aggregateCompositeIdentifier = {
    type: AggregateType.note,
    id: edgeConnectionId,
};

describe(`EdgeConnection.fromEventHistory`, () => {
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [DynamicDataTypeModule],
            // Data Classes
            providers: [
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
                    // Events
                    NoteAboutResourceCreated,
                    ResourcesConnectedWithNote,
                ].map((ctor) => ({
                    provide: ctor,
                    useValue: ctor,
                })),
            ],
        }).compile();

        const app = moduleRef.createNestApplication();

        const dynamicDataService = app.get(DynamicDataTypeFinderService);

        await dynamicDataService.bootstrapDynamicTypes();
    });

    describe(`when there is a creation event only`, () => {
        describe(`of type NOTE_ABOUT_RESOURCE_CREATED`, () => {
            it(`should create the expected edge connection`, () => {
                const result = EdgeConnection.fromEventHistory(
                    noteAboutResourceCreated.as(aggregateCompositeIdentifier),
                    edgeConnectionId
                );

                expect(result).toBeInstanceOf(EdgeConnection);
            });
        });
    });
});
