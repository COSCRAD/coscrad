import {
    AggregateType,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Test } from '@nestjs/testing';
import { NotFound } from '../../../lib/types/not-found';
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
import { EdgeConnectionContextType } from './types/EdgeConnectionContextType';

const noteText = 'this is cool';

const generalContext = new GeneralContext();

const originalLanguageCode = LanguageCode.English;

const resourceCompositeIdentifier = {
    type: ResourceType.audioItem,
    id: buildDummyUuid(5),
};

const connectedResourceCompositeIdentifier = {
    type: ResourceType.digitalText,
    id: buildDummyUuid(6),
};

const pageRangeContext = new PageRangeContext({
    type: EdgeConnectionContextType.pageRange,
    pageIdentifiers: ['1'],
});

const noteAboutResourceCreated = new TestEventStream().andThen<NoteAboutResourceCreated>({
    type: 'NOTE_ABOUT_RESOURCE_CREATED',
    payload: {
        text: noteText,
        resourceCompositeIdentifier,
        resourceContext: generalContext.toDTO(),
        languageCode: originalLanguageCode,
    },
});

const resourcesConnectedWithNote = new TestEventStream().andThen<ResourcesConnectedWithNote>({
    type: 'RESOURCES_CONNECTED_WITH_NOTE',
    payload: {
        text: noteText,
        languageCode: originalLanguageCode,
        fromMemberCompositeIdentifier: resourceCompositeIdentifier,
        fromMemberContext: generalContext,
        toMemberCompositeIdentifier: connectedResourceCompositeIdentifier,
        toMemberContext: pageRangeContext,
    },
});

const edgeConnectionId = buildDummyUuid(1);

const aggregateCompositeIdentifier = {
    type: AggregateType.note,
    id: edgeConnectionId,
};

const _foo = resourcesConnectedWithNote.as(aggregateCompositeIdentifier);

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

    describe(`When creating a self-note`, () => {
        describe(`when there is only a creation event: NOTE_ABOUT_RESOURCE_CREATED`, () => {
            it(`should create the expected edge connection`, () => {
                const result = EdgeConnection.fromEventHistory(
                    noteAboutResourceCreated.as(aggregateCompositeIdentifier),
                    edgeConnectionId
                );

                expect(result).toBeInstanceOf(EdgeConnection);

                const note = result as EdgeConnection;

                const { text, languageCode } = note.note.getOriginalTextItem();

                expect(text).toBe(noteText);

                expect(languageCode).toBe(originalLanguageCode);

                expect(note.members).toHaveLength(1);

                expect(note.connectionType).toBe(EdgeConnectionType.self);

                const { compositeIdentifier, context, role } = note.members[0];

                expect(role).toBe(EdgeConnectionMemberRole.self);

                expect(compositeIdentifier).toEqual(resourceCompositeIdentifier);

                expect(context).toEqual(generalContext);
            });
        });
    });

    describe(`When created via RESOURCES_CONNECTED_WITH_NOTE`, () => {
        describe(`when there is only a creation event: RESOURCES_CONNECTED_WITH_NOTE`, () => {
            it(`should create the expected edge connection`, () => {
                const result = EdgeConnection.fromEventHistory(
                    resourcesConnectedWithNote.as(aggregateCompositeIdentifier),
                    edgeConnectionId
                );

                expect(result).toBeInstanceOf(EdgeConnection);

                const edgeConnection = result as EdgeConnection;

                const { text, languageCode } = edgeConnection.note.getOriginalTextItem();

                expect(text).toBe(noteText);

                expect(languageCode).toBe(languageCode);

                const { members } = edgeConnection;

                expect(members).toHaveLength(2);

                const { compositeIdentifier: fromCompositeId, context: fromContext } =
                    edgeConnection.getMemberWithRole(
                        EdgeConnectionMemberRole.from
                    ) as EdgeConnectionMember;

                expect(fromCompositeId).toEqual(resourceCompositeIdentifier);

                expect(fromContext).toEqual(generalContext.toDTO());

                const { compositeIdentifier: toCompositeId, context: toContext } =
                    edgeConnection.getMemberWithRole(
                        EdgeConnectionMemberRole.to
                    ) as EdgeConnectionMember;

                expect(toCompositeId).toEqual(connectedResourceCompositeIdentifier);

                expect(toContext).toEqual(pageRangeContext.toDTO());
            });
        });
    });

    describe(`when the event history is invalid`, () => {
        describe(`when there are no events for the given note`, () => {
            it(`should return not found`, () => {
                const result = EdgeConnection.fromEventHistory(
                    noteAboutResourceCreated.as({
                        type: AggregateType.note,
                        id: buildDummyUuid(333),
                    }),
                    edgeConnectionId
                );

                expect(result).toBe(NotFound);
            });
        });

        // this could be due to botching event versioning, for example
        describe(`when the existing event is invalid`, () => {
            describe(`RESOURCES_CONNECTED_WITH_NOTE`, () => {
                it(`should throw`, () => {
                    const eventSource = () => {
                        EdgeConnection.fromEventHistory(
                            new TestEventStream()
                                .andThen<ResourcesConnectedWithNote>({
                                    type: 'RESOURCES_CONNECTED_WITH_NOTE',
                                    payload: {
                                        // this cannot be empty
                                        text: '',
                                    },
                                })
                                .as(aggregateCompositeIdentifier),
                            edgeConnectionId
                        );
                    };

                    expect(eventSource).toThrow();
                });
            });

            describe(`NOTE_ABOUT_RESOURCE_CREATED`, () => {
                it(`should throw`, () => {
                    const eventSource = () => {
                        EdgeConnection.fromEventHistory(
                            new TestEventStream()
                                .andThen<NoteAboutResourceCreated>({
                                    type: 'NOTE_ABOUT_RESOURCE_CREATED',
                                    payload: {
                                        // this is not an allowed language code
                                        languageCode: 'ZqZ' as LanguageCode,
                                    },
                                })
                                .as(aggregateCompositeIdentifier),
                            edgeConnectionId
                        );
                    };

                    expect(eventSource).toThrow();
                });
            });
        });
    });
});
