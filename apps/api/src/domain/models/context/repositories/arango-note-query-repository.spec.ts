import {
    EdgeConnectionType,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { NotFound } from '../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { buildTestInstance } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { DynamicDataTypeFinderService } from '../../../../validation';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { EventSourcedAudioItemViewModel } from '../../audio-visual/audio-item/queries';
import { ArangoAudioItemQueryRepository } from '../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { TAG_QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../tag/repositories/tag-query-repository.interface';
import { GeneralContext } from '../general-context/general-context.entity';
import { EventSourcedNoteViewModel } from '../note.view-model.event-sourced';
import { ArangoNoteQueryRepository } from './arango-note-query-repository';
import { INoteCreationRecord, INoteQueryRepository } from './note-query-repository.interface';

const WIDGET_TYPE = 'widget' as ResourceType;

const widgetCollectionName = 'widget__VIEWS';

const noteIds = [1, 2, 3].map(buildDummyUuid);

const textForNote = 'the text for a note';

class WidgetViewModel {
    readonly type = WIDGET_TYPE;

    id: AggregateId;

    rating: number;

    tags: EventSourcedTagViewModel[];

    constructor(dto: DTO<WidgetViewModel>) {
        if (!dto) return;

        const { id, rating } = dto;

        this.id = id;

        this.rating = rating;
    }

    getCompositeIdentifier() {
        return {
            type: WIDGET_TYPE,
            id: this.id,
        } as ResourceCompositeIdentifier;
    }

    toDto() {
        return cloneToPlainObject(this);
    }
}

const testWidget = new WidgetViewModel({
    type: WIDGET_TYPE,
    id: buildDummyUuid(1),
    rating: 55,
    tags: [],
});

const generalContext = new GeneralContext();

const assertWidgetDocumentMatchesWidget = (actual: unknown, widget: WidgetViewModel) => {
    const dto = widget.toDto();

    const rawWidgetDoc = actual as WidgetViewModel & {
        _id: string;
        _key: string;
        _rev: string;
    };

    delete rawWidgetDoc._id;
    delete rawWidgetDoc._key;
    delete rawWidgetDoc._rev;

    expect(rawWidgetDoc).toEqual(dto);
};

const unpublishedEdgeView = buildTestInstance(EventSourcedNoteViewModel, {
    isPublished: false,
});

describe(`ArangoNoteQueryRepository`, () => {
    let testQueryRepository: INoteQueryRepository;

    let connectionProvider: ArangoConnectionProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let widgetDatabase: ArangoDatabaseForCollection<WidgetViewModel>;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .overrideProvider(DynamicDataTypeFinderService)
            .useValue({
                bootstrapDynamicTypes: async () => {
                    Promise.resolve();
                },
            })
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        connectionProvider = app.get(ArangoConnectionProvider);

        connectionProvider.createCollectionIfNotExists(widgetCollectionName);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoNoteQueryRepository(connectionProvider);

        widgetDatabase = new ArangoDatabaseForCollection<WidgetViewModel>(
            new ArangoDatabase(connectionProvider.getConnection()),
            widgetCollectionName
        );
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        const existingNote: INoteCreationRecord = {
            id: noteIds[0],
            text: buildMultilingualTextWithSingleItem(textForNote),
            connectionType: EdgeConnectionType.self,
        };

        beforeEach(async () => {
            await databaseProvider.clearViews();
        });

        describe(`when the note exists`, () => {
            describe(`when the note is a self-note`, () => {
                beforeEach(async () => {
                    await widgetDatabase.create(mapEntityDTOToDatabaseDocument(testWidget));

                    await testQueryRepository.createNoteAbout(
                        {
                            ...existingNote,
                            id: buildDummyUuid(88),
                            text: buildMultilingualTextWithSingleItem(
                                'additional note for the given widget'
                            ),
                        },
                        testWidget.getCompositeIdentifier(),
                        generalContext
                    );

                    await testQueryRepository.createNoteAbout(
                        existingNote,
                        testWidget.getCompositeIdentifier(),
                        generalContext
                    );
                });

                it(`should return the note`, async () => {
                    const result = await testQueryRepository.fetchById(existingNote.id);

                    expect(result).not.toBe(NotFound);

                    const {
                        text,
                        connectedResources: { to, from, self },
                    } = result as EventSourcedNoteViewModel;

                    expect(to).toBeFalsy();

                    expect(from).toBeFalsy();

                    expect(self).not.toBeFalsy();

                    const { context, resource } = self;

                    expect(context).toEqual(generalContext);

                    expect(cloneToPlainObject(resource)).toEqual(testWidget.toDto());

                    assertWidgetDocumentMatchesWidget(resource, testWidget);

                    expect(text.toString()).toBe(existingNote.text.toString());
                });
            });

            describe(`when the note is a connecting-note`, () => {
                const toWidgetId = buildDummyUuid(99);

                const toWidget = new WidgetViewModel({
                    id: toWidgetId,
                    type: WIDGET_TYPE,
                    rating: 99,
                    tags: [],
                });

                beforeEach(async () => {
                    await widgetDatabase.createMany(
                        [testWidget, toWidget].map(mapEntityDTOToDatabaseDocument)
                    );
                });

                it(`should create the connection`, async () => {
                    await testQueryRepository.connectResourcesWithNote(
                        existingNote,
                        { type: WIDGET_TYPE, id: testWidget.id },
                        generalContext,
                        { type: WIDGET_TYPE, id: toWidgetId },
                        generalContext
                    );

                    const searchResult = await testQueryRepository.fetchById(existingNote.id);

                    expect(searchResult).not.toBe(NotFound);

                    const {
                        connectionType,
                        connectedResources: {
                            to: { resource: toResource },
                            from: { resource: fromResource },
                        },
                    } = searchResult as EventSourcedNoteViewModel;

                    assertWidgetDocumentMatchesWidget(fromResource, testWidget);

                    assertWidgetDocumentMatchesWidget(toResource, toWidget);

                    expect(connectionType).toBe(EdgeConnectionType.dual);
                });
            });
        });

        describe(`when the widget has been updated after note creation`, () => {
            const updatedRating = 1234;

            describe(`when the widget has been updated after creating a self-note`, () => {
                beforeEach(async () => {
                    await widgetDatabase.create(mapEntityDTOToDatabaseDocument(testWidget));
                });

                it(`should return the updated widget on the note`, async () => {
                    await testQueryRepository.createNoteAbout(
                        existingNote,
                        { type: WIDGET_TYPE, id: testWidget.id },
                        generalContext
                    );

                    await widgetDatabase.update(testWidget.id, {
                        rating: updatedRating,
                    });

                    const result = await testQueryRepository.fetchById(existingNote.id);

                    expect(result).not.toBe(NotFound);

                    const {
                        connectedResources: { to, from, self },
                    } = result as EventSourcedNoteViewModel;

                    expect(to).toBeFalsy();

                    expect(from).toBeFalsy();

                    expect(self).not.toBeFalsy();

                    const { context, resource } = self;

                    expect(context).toEqual(generalContext);

                    expect((resource as WidgetViewModel).rating).toBe(updatedRating);
                });
            });

            describe(`when the widget has been updated after creating a connection`, () => {
                const toWidgetId = buildDummyUuid(99);

                const toWidget = new WidgetViewModel({
                    id: toWidgetId,
                    type: WIDGET_TYPE,
                    rating: 99,
                    tags: [],
                });

                beforeEach(async () => {
                    await widgetDatabase.createMany(
                        [testWidget, toWidget].map(mapEntityDTOToDatabaseDocument)
                    );
                });

                it(`should return the updated widget on the note view`, async () => {
                    const updatedToWidgetRating = 300;

                    await testQueryRepository.connectResourcesWithNote(
                        existingNote,
                        { type: WIDGET_TYPE, id: testWidget.id },
                        generalContext,
                        { type: WIDGET_TYPE, id: toWidgetId },
                        generalContext
                    );

                    await widgetDatabase.update(testWidget.id, {
                        rating: updatedRating,
                    });

                    await widgetDatabase.update(toWidget.id, {
                        rating: updatedToWidgetRating,
                    });

                    const searchResult = await testQueryRepository.fetchById(existingNote.id);

                    expect(searchResult).not.toBe(NotFound);

                    const {
                        connectedResources: {
                            to: { resource: toResource },
                            from: { resource: fromResource },
                        },
                    } = searchResult as EventSourcedNoteViewModel;

                    expect((fromResource as WidgetViewModel).rating).toBe(updatedRating);

                    expect((toResource as WidgetViewModel).rating).toBe(updatedToWidgetRating);
                });
            });
        });

        describe(`when the note does not exist`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById(buildDummyUuid(404));

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        const selfWidget = new WidgetViewModel({
            id: buildDummyUuid(101),
            type: WIDGET_TYPE,
            rating: 1,
            tags: [],
        });

        const fromWidget = new WidgetViewModel({
            id: buildDummyUuid(102),
            type: WIDGET_TYPE,
            rating: 2,
            tags: [],
        });

        const toWidget = new WidgetViewModel({
            id: buildDummyUuid(103),
            type: WIDGET_TYPE,
            rating: 3,
            tags: [],
        });

        const existingSelfNote: EventSourcedNoteViewModel = buildTestInstance(
            EventSourcedNoteViewModel,
            {
                id: noteIds[0],
                text: buildMultilingualTextWithSingleItem(textForNote),
                connectedResources: {
                    self: {
                        resource: selfWidget.getCompositeIdentifier(),
                        context: generalContext,
                    },
                },
                tags: [],
                type: ResourceType.term,
                connectionType: EdgeConnectionType.self,
                audio: MultilingualAudio.buildEmpty(),
            }
        );

        const existingConnection = buildTestInstance(EventSourcedNoteViewModel, {
            id: noteIds[1],
            text: buildMultilingualTextWithSingleItem('note for the connection'),
            connectedResources: {
                from: {
                    resource: fromWidget.getCompositeIdentifier(),
                    context: generalContext,
                },
                to: {
                    resource: toWidget.getCompositeIdentifier(),
                    context: generalContext,
                },
            },
            tags: [],
            type: ResourceType.term,
            connectionType: EdgeConnectionType.dual,
            audio: MultilingualAudio.buildEmpty(),
        });

        const extraConnectionForWidget = buildTestInstance(EventSourcedNoteViewModel, {
            id: noteIds[2],
            text: buildMultilingualTextWithSingleItem('I am another note for the target widget'),
            connectedResources: {
                self: {
                    // We want to ensure our query logic is robust to multiple edges for the same widget
                    resource: selfWidget.getCompositeIdentifier(),
                    context: generalContext,
                },
            },
            tags: [],
            type: ResourceType.term,
            connectionType: EdgeConnectionType.self,
            audio: MultilingualAudio.buildEmpty(),
        });

        const allNotes = [existingSelfNote, existingConnection, extraConnectionForWidget];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            [selfWidget, toWidget, fromWidget].forEach(async (w) => {
                await widgetDatabase.create(mapEntityDTOToDatabaseDocument(w));
            });

            await testQueryRepository.createMany(allNotes);
        });

        it(`should return the notes along with joined resource views`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result.entities).toHaveLength(allNotes.length);

            const selfNote = await testQueryRepository.fetchById(existingSelfNote.id);

            expect(selfNote).not.toBe(NotFound);

            const {
                connectedResources: {
                    to,
                    from,
                    self: { resource, context },
                },
            } = selfNote as EventSourcedNoteViewModel;

            expect(context).toEqual(generalContext);

            assertWidgetDocumentMatchesWidget(resource, selfWidget);

            expect(to).toBeFalsy();

            expect(from).toBeFalsy();

            const connection = await testQueryRepository.fetchById(existingConnection.id);

            expect(connection).not.toBe(NotFound);

            const {
                connectedResources: { to: toForConnection, from: fromForConnection, self },
            } = connection as EventSourcedNoteViewModel;

            expect(self).toBeFalsy();

            expect(toForConnection.context).toEqual(generalContext);

            assertWidgetDocumentMatchesWidget(toForConnection.resource, toWidget);

            expect(fromForConnection.context).toEqual(generalContext);

            assertWidgetDocumentMatchesWidget(fromForConnection.resource, fromWidget);
        });
    });

    describe(`count`, () => {
        const existingNotes = [1, 2, 3].map((sequenceNumber) =>
            buildTestInstance(EventSourcedNoteViewModel, {
                id: noteIds[sequenceNumber - 1],
                text: buildMultilingualTextWithSingleItem(`note #${sequenceNumber}`),
                connectedResources: {
                    self: {
                        resource: testWidget.getCompositeIdentifier(),
                        context: generalContext,
                    },
                },
            })
        );

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(existingNotes);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(existingNotes.length);
        });
    });

    describe(`tag`, () => {
        const existingTagLabel = 'games';

        const existingTag: TagViewModel = {
            id: buildDummyUuid(67),
            label: existingTagLabel,
            name: buildMultilingualTextWithSingleItem(existingTagLabel),
            members: [],
        };

        const newTagId = buildDummyUuid(19);

        const newTagLabel = 'songs';

        const newTag = buildTestInstance(EventSourcedTagViewModel, {
            id: newTagId,
            label: newTagLabel,
        });

        const targetNote = buildTestInstance(EventSourcedNoteViewModel, {
            tags: [existingTag],
        });

        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection(ArangoCollectionId.tags).clear();

            await databaseProvider.clearViews();

            await testQueryRepository.createNoteAbout(
                targetNote,
                { type: WIDGET_TYPE, id: testWidget.id },
                generalContext
            );

            await app.get(TAG_QUERY_REPOSITORY_PROVIDER_TOKEN).create(newTag);
        });

        it(`should tag the note`, async () => {
            await testQueryRepository.tag(targetNote.id, newTag.id);

            const { tags } = (await testQueryRepository.fetchById(
                targetNote.id
            )) as EventSourcedNoteViewModel;

            expect(tags).toHaveLength(1);

            const tagSearchResult = tags.find(({ id }) => id === newTag.id);

            expect(tagSearchResult).toBeTruthy();

            const { label } = tagSearchResult;

            expect(label).toBe(newTagLabel);
        });
    });

    describe(`translate`, () => {
        const translationLanguageCode = LanguageCode.Chilcotin;

        const translationText = `translation of the note`;

        const translationRole = MultilingualTextItemRole.freeTranslation;

        const noteWithoutTranslation = buildTestInstance(EventSourcedNoteViewModel, {
            id: buildDummyUuid(1),
            text: buildMultilingualTextWithSingleItem('original english text for note'),
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await widgetDatabase.create(mapEntityDTOToDatabaseDocument(testWidget));

            await testQueryRepository.createNoteAbout(
                noteWithoutTranslation,
                {
                    type: WIDGET_TYPE,
                    id: testWidget.id,
                },
                generalContext
            );
        });

        it(`should translate the note`, async () => {
            await testQueryRepository.translate(noteWithoutTranslation.id, {
                text: translationText,
                role: translationRole,
                languageCode: translationLanguageCode,
            });

            const updatedView = (await testQueryRepository.fetchById(
                noteWithoutTranslation.id
            )) as EventSourcedNoteViewModel;

            const foo = updatedView.text.getTranslation(translationLanguageCode);

            expect(foo).not.toBe(NotFound);

            const { text, role } = foo as MultilingualTextItem;

            expect(text).toBe(translationText);

            expect(role).toBe(translationRole);
        });
    });

    describe(`publish`, () => {
        describe(`when the target is not yet published`, () => {
            beforeEach(async () => {
                await databaseProvider.clearViews();

                await widgetDatabase.create(mapEntityDTOToDatabaseDocument(testWidget));

                await testQueryRepository.createNoteAbout(
                    unpublishedEdgeView,
                    testWidget.getCompositeIdentifier(),
                    generalContext
                );
            });

            it(`should publsih the connection`, async () => {
                await testQueryRepository.publish(unpublishedEdgeView.id);

                const updatedEdgeView = (await testQueryRepository.fetchById(
                    unpublishedEdgeView.id
                )) as EventSourcedNoteViewModel;

                expect(updatedEdgeView.isPublished).toBe(true);
            });
        });
    });

    describe(`allowUser`, () => {
        const userId = buildDummyUuid(12);
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await widgetDatabase.create(mapEntityDTOToDatabaseDocument(testWidget));
        });

        describe(`when the target exists`, () => {
            it(`should allow access to the given user`, async () => {
                await testQueryRepository.allowUser(unpublishedEdgeView.id, userId);

                const updatedEdgeView = (await testQueryRepository.fetchById(
                    unpublishedEdgeView.id
                )) as EventSourcedNoteViewModel;

                expect(updatedEdgeView.accessControlList.canUser(userId)).toBe(true);
            });
        });
    });

    describe(`addAudio`, () => {
        describe(`when there is no audio to begin with`, () => {
            const audioId = buildDummyUuid(44);

            const existingAudio = buildTestInstance(EventSourcedAudioItemViewModel, {
                id: audioId,
            });

            const originalLanguageCode = LanguageCode.English;

            const noteWithNoAudio = buildTestInstance(EventSourcedNoteViewModel, {
                id: buildDummyUuid(1),
                text: buildMultilingualTextWithSingleItem(
                    'existing text for target language',
                    originalLanguageCode
                ),
            });

            beforeEach(async () => {
                await databaseProvider.clearViews();

                await widgetDatabase.create(mapEntityDTOToDatabaseDocument(testWidget));

                await testQueryRepository.createNoteAbout(
                    noteWithNoAudio,
                    {
                        type: WIDGET_TYPE,
                        id: testWidget.id,
                    },
                    generalContext
                );

                // @ts-expect-error FIX this
                await new ArangoAudioItemQueryRepository(connectionProvider).create(existingAudio);
            });

            it(`should add the audio`, async () => {
                await testQueryRepository.addAudio(
                    noteWithNoAudio.id,
                    existingAudio.id,
                    originalLanguageCode
                );

                const updatedView = (await testQueryRepository.fetchById(
                    noteWithNoAudio.id
                )) as EventSourcedNoteViewModel;

                expect(updatedView.audio.hasAudioIn(originalLanguageCode)).toBe(true);

                expect(updatedView.audio.getIdForAudioIn(originalLanguageCode)).toBe(audioId);
            });
        });

        describe(`when there is audio for the original language, but the audio is being added for the translation language`, () => {
            const originalLanguageAudioId = buildDummyUuid(44);

            const translationAudioId = buildDummyUuid(45);

            const originalLanguageAudio = buildTestInstance(EventSourcedAudioItemViewModel, {
                id: originalLanguageAudioId,
            });

            const existingTranslationAudio = buildTestInstance(EventSourcedAudioItemViewModel, {
                id: translationAudioId,
            });

            const originalLanguageCode = LanguageCode.English;

            const translationLanguageCode = LanguageCode.Chilcotin;

            const noteWithNoAudio = buildTestInstance(EventSourcedNoteViewModel, {
                id: buildDummyUuid(1),
                text: buildMultilingualTextWithSingleItem(
                    'existing text for target language',
                    originalLanguageCode
                ),
            });

            beforeEach(async () => {
                await databaseProvider.clearViews();

                await widgetDatabase.create(mapEntityDTOToDatabaseDocument(testWidget));

                await testQueryRepository.createNoteAbout(
                    noteWithNoAudio,
                    {
                        type: WIDGET_TYPE,
                        id: testWidget.id,
                    },
                    generalContext
                );

                await new ArangoAudioItemQueryRepository(connectionProvider).createMany([
                    originalLanguageAudio,
                    existingTranslationAudio,
                ]);
            });

            it(`should add audio for the translation language and preserve the audio for the original language`, async () => {
                await testQueryRepository.addAudio(
                    noteWithNoAudio.id,
                    originalLanguageAudio.id,
                    originalLanguageCode
                );

                await testQueryRepository.addAudio(
                    noteWithNoAudio.id,
                    existingTranslationAudio.id,
                    translationLanguageCode
                );

                const updatedView = (await testQueryRepository.fetchById(
                    noteWithNoAudio.id
                )) as EventSourcedNoteViewModel;

                expect(updatedView.audio.hasAudioIn(originalLanguageCode)).toBe(true);

                const foundOriginalAudioId =
                    updatedView.audio.getIdForAudioIn(originalLanguageCode);

                expect(foundOriginalAudioId).toBe(originalLanguageAudio.id);

                expect(updatedView.audio.hasAudioIn(translationLanguageCode)).toBe(true);

                expect(updatedView.audio.getIdForAudioIn(translationLanguageCode)).toBe(
                    translationAudioId
                );
            });
        });
    });
});
