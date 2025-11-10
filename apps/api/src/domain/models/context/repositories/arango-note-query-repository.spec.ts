import { EdgeConnectionType, ResourceType } from '@coscrad/api-interfaces';
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
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { DynamicDataTypeFinderService } from '../../../../validation';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../types/AggregateId';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { EventSourcedNoteViewModel } from '../event-sourced-note.view-model';
import { GeneralContext } from '../general-context/general-context.entity';
import { ArangoNoteQueryRepository } from './arango-note-query-repository';
import { INoteCreationRecord, INoteQueryRepository } from './note-query-repository.interface';

const WIDGET_TYPE = 'widget' as ResourceType;

const widgetCollectionName = 'widget__VIEWS';

const noteIds = [2, 3, 4].map(buildDummyUuid);

const textForNote = 'the text for a note';

const existingNotes = [1, 2, 3].map((sequenceNumber, index) =>
    buildTestInstance(EventSourcedNoteViewModel, {
        id: noteIds[index],
        text: buildMultilingualTextWithSingleItem(`note #${index}`),
    })
);

class WidgetViewModel {
    readonly type = WIDGET_TYPE;

    id: AggregateId;

    rating: number;

    constructor(dto: DTO<WidgetViewModel>) {
        if (!dto) return;

        const { id, rating } = dto;

        this.id = id;

        this.rating = rating;
    }

    toDto() {
        return cloneToPlainObject(this);
    }
}

const testWidget = new WidgetViewModel({
    type: WIDGET_TYPE,
    id: buildDummyUuid(1),
    rating: 55,
});

const generalContext = new GeneralContext();

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

    describe.only(`fetchById`, () => {
        const existingNote: INoteCreationRecord = {
            id: noteIds[0],
            // TODO should this be called text?
            text: buildMultilingualTextWithSingleItem(textForNote),
            connectionType: EdgeConnectionType.self,
        };

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await widgetDatabase.create(mapEntityDTOToDatabaseDocument(testWidget));

            await testQueryRepository.createNoteAbout(
                existingNote,
                { type: WIDGET_TYPE, id: testWidget.id },
                generalContext
            );
        });

        describe(`when the note exists`, () => {
            it(`should return the note`, async () => {
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

                expect(cloneToPlainObject(resource)).toEqual(testWidget.toDto());
            });
        });

        // TODO when the widget has been updated after note creation, it should return the updated resource on the note

        // TODO when the note does not exist
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(existingNotes);
        });

        it(`should return the notes`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result).toHaveLength(existingNotes.length);
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(existingNotes);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(existingNotes.length);
        });
    });

    // describe(`translate`, () => {
    //     const translationLanguageCode = LanguageCode.Chilcotin;

    //     const translationText = `translation of the note`;

    //     const translationRole = MultilingualTextItemRole.freeTranslation;

    //     const noteWithoutTranslation = buildTestInstance(EventSourcedNoteViewModel, {
    //         id: buildDummyUuid(1),
    //         text: buildMultilingualTextWithSingleItem('original english text for note'),
    //     });

    //     beforeEach(async () => {
    //         await databaseProvider.clearViews();

    //         await testQueryRepository.create(noteWithoutTranslation);
    //     });

    //     it(`should translate the note`, async () => {
    //         await testQueryRepository.translate(noteWithoutTranslation.id, {
    //             text: translationText,
    //             role: translationRole,
    //             languageCode: translationLanguageCode,
    //         });

    //         const updatedView = (await testQueryRepository.fetchById(
    //             noteWithoutTranslation.id
    //         )) as EventSourcedNoteViewModel;

    //         const foo = updatedView.text.getTranslation(translationLanguageCode);

    //         expect(foo).not.toBe(NotFound);

    //         const { text, role } = foo as MultilingualTextItem;

    //         expect(text).toBe(translationText);

    //         expect(role).toBe(translationRole);
    //     });
    // });

    // describe(`addAudio`, () => {
    //     describe(`when there is no audio to begin with`, () => {
    //         const audioId = buildDummyUuid(44);

    //         const existingAudio = buildTestInstance(EventSourcedAudioItemViewModel, {
    //             id: audioId,
    //         });

    //         const originalLanguageCode = LanguageCode.English;

    //         const noteWithNoAudio = buildTestInstance(EventSourcedNoteViewModel, {
    //             id: buildDummyUuid(1),
    //             text: buildMultilingualTextWithSingleItem(
    //                 'existing text for target language',
    //                 originalLanguageCode
    //             ),
    //         });

    //         beforeEach(async () => {
    //             await databaseProvider.clearViews();

    //             await testQueryRepository.create(noteWithNoAudio);

    //             // @ts-expect-error FIX ME
    //             await new ArangoAudioItemQueryRepository(connectionProvider).create(existingAudio);
    //         });

    //         it(`should have a test`, async () => {
    //             await testQueryRepository.addAudio(
    //                 noteWithNoAudio.id,
    //                 audioId,
    //                 originalLanguageCode
    //             );

    //             const updatedView = (await testQueryRepository.fetchById(
    //                 noteWithNoAudio.id
    //             )) as EventSourcedNoteViewModel;

    //             expect(updatedView.audio.hasAudioIn(originalLanguageCode)).toBe(true);

    //             expect(updatedView.audio.getIdForAudioIn(originalLanguageCode)).toBe(audioId);
    //         });
    //     });

    //     describe(`when there is audio for the original language, but the audio is being added for the translation language`, () => {
    //         it.todo(`should have a test`);
    //     });
    // });

    // describe.skip(`createNoteAbout`, () => {
    //     const resourceCompositeIdentifier = {
    //         type: WIDGET_TYPE,
    //         id: buildDummyUuid(123),
    //     };

    //     const testWidget = new WidgetViewModel({
    //         ...resourceCompositeIdentifier,
    //         rating: 100,
    //     });

    //     const note = buildTestInstance(EventSourcedNoteViewModel, {
    //         id: buildDummyUuid(5),
    //         connectedResources: {
    //             self: {
    //                 ...testWidget,
    //                 context: generalContext,
    //             },
    //         },
    //     });

    //     beforeEach(async () => {
    //         await databaseProvider.clearViews();

    //         await databaseProvider.getDatabaseForCollection('widget__VIEWS').clear();

    //         await databaseProvider
    //             .getDatabaseForCollection('widget__VIEWS')
    //             .create(mapEntityDTOToDatabaseDocument(testWidget));
    //     });

    //     it(`should create the note`, async () => {
    //         // TODO we don't want the full note here
    //         await testQueryRepository.createNoteAbout(note, resourceCompositeIdentifier);

    //         const searchResult = await testQueryRepository.fetchById(note.id);

    //         expect(searchResult).not.toBe(NotFound);

    //         const newNote = searchResult as EventSourcedNoteViewModel;

    //         const {
    //             connectedResources: {
    //                 self: {
    //                     resource: {
    //                         type,
    //                         id,
    //                         // @ts-expect-error TODO make this prop generic
    //                         rating,
    //                     },
    //                     context,
    //                 },
    //                 to,
    //                 from,
    //             },
    //         } = newNote;

    //         expect(to).toBeFalsy();

    //         expect(from).toBeFalsy();

    //         expect(type).toBe(WIDGET_TYPE);

    //         expect(id).toBe(resourceCompositeIdentifier.id);

    //         expect(rating).toBe(testWidget.rating);

    //         expect(context).toEqual(generalContext);
    //     });
    // });
});
