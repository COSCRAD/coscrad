import {
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    IEdgeConnectionContext,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { DigitalTextViewModel } from '../../../../queries/digital-text';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { EdgeConnection } from '../../context/edge-connection.entity';
import { Tag } from '../../tag/tag.entity';
import { ArangoDigitalTextQueryRepository } from './arango-digital-text-query-repository';
import { IDigitalTextQueryRepository } from './digital-text-query-repository.interface';

const digitalTextIds = [1, 2, 3].map(buildDummyUuid);

describe(`ArangoDigitalTextQueryRepository`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    // let contributorRepository: IRepositoryForAggregate<CoscradContributor>;

    let app: INestApplication;

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
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoDigitalTextQueryRepository(connectionProvider);

        /**
         * Currently, the contributors are snapshot based (not event sourced).
         */
        // contributorRepository = new ArangoRepositoryForAggregate(
        //     databaseProvider,
        //     ArangoCollectionId.contributors,
        //     buildInstanceFactory(CoscradContributor),
        //     mapDatabaseDocumentToAggregateDTO,
        //     mapEntityDTOToDatabaseDocument
        // );
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        const digitalTextId = digitalTextIds[0];

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            id: digitalTextId,
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetDigitalText);
        });

        describe(`when there is a digital text with the given ID`, () => {
            it(`should return the expected result`, async () => {
                const result = await testQueryRepository.fetchById(digitalTextId);

                expect(result).not.toBe(NotFound);

                // check all properties
            });
        });

        describe(`when there is no digital text with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('bogus-id');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        const digitalTexts = digitalTextIds.map((id) =>
            buildTestInstance(DigitalTextViewModel, {
                id,
            })
        );

        beforeEach(async () => {
            await testQueryRepository.createMany(digitalTexts);
        });

        it(`should return the expected digital texts`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result).toHaveLength(digitalTexts.length);

            const missingDigitalTexts = digitalTexts.filter(
                ({ id }) => !result.some((found) => found.id === id)
            );

            expect(missingDigitalTexts).toEqual([]);
        });
    });

    describe(`count`, () => {
        const digitalTexts = digitalTextIds.map((id) =>
            buildTestInstance(DigitalTextViewModel, { id })
        );

        beforeEach(async () => {
            await testQueryRepository.createMany(digitalTexts);
        });

        it(`should return the number of digital texts`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(digitalTexts.length);
        });
    });

    describe(`publish`, () => {
        const digitalTextId = digitalTextIds[0];

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            id: digitalTextId,
            isPublished: false,
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetDigitalText);
        });

        it(`should publish the target digital text`, async () => {
            await testQueryRepository.publish(digitalTextId);

            const updatedView = (await testQueryRepository.fetchById(
                digitalTextId
            )) as DigitalTextViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`tag`, () => {
        const existingTagLabel = 'plants';

        const existingTag: TagViewModel = {
            id: buildDummyUuid(90),
            label: existingTagLabel,
            name: buildMultilingualTextWithSingleItem(existingTagLabel),
            // TODO do we want this here?
            members: [],
        };

        const newTagId = buildDummyUuid(91);

        const newTagLabel = 'animals';

        // TODO use event sourced setup?
        const newTag = buildTestInstance(Tag, {
            id: newTagId,
            label: newTagLabel,
        });

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            tags: [existingTag],
        });

        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection(ArangoCollectionId.tags).clear();

            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.tags)
                .create(mapEntityDTOToDatabaseDocument(newTag.toDTO()));
        });

        it(`should tag the digital text`, async () => {
            await testQueryRepository.tag(targetDigitalText.id, newTag.id);

            const { tags } = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            expect(tags).toHaveLength(2);

            const tagSearchResult = tags.find(({ id }) => id === newTag.id);

            expect(tagSearchResult).toBeTruthy();

            const { label } = tagSearchResult;

            expect(label).toBe(newTagLabel);
        });
    });

    describe(`createNoteAbout`, () => {
        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            notes: [],
        });

        const targetNote = buildTestInstance(EdgeConnection, {
            members: [
                {
                    compositeIdentifier: {
                        type: ResourceType.video,
                        id: targetDigitalText.id,
                    },
                    context: { type: EdgeConnectionContextType.general },
                    role: EdgeConnectionMemberRole.self,
                },
            ],
        });

        beforeEach(async () => {
            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.edgeConnectionCollectionID)
                .clear();

            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);

            /**
             * Note that there is no need to put the target note in the domain
             * database. The context is passed into the repo update method
             * from the note creation event payload.
             */
        });

        it(`should append a note to the term`, async () => {
            await testQueryRepository.createNoteAbout(targetDigitalText.id, {
                noteId: targetNote.id,
                context: targetNote.members[0].context,
                text: targetNote.note,
            });

            const { notes } = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            expect(notes).toHaveLength(1);

            const { note } = notes[0];

            expect(note.toDTO()).toEqual(targetNote.note.toDTO());
        });
    });

    describe(`createConnection`, () => {
        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            // no connections to start
            connections: [],
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);
        });

        it(`should add the connection info`, async () => {
            const generalContext: IEdgeConnectionContext = {
                type: EdgeConnectionContextType.general,
            };

            const otherCompositeIdentifier = {
                type: 'widget' as ResourceType,
                id: buildDummyUuid(88),
            };

            const noteId = buildDummyUuid(89);

            const textForNote = 'This is why the widget is relevant to the term.';

            const langaugeCodeForNote = LanguageCode.Chilcotin;

            const role = EdgeConnectionMemberRole.to;

            await testQueryRepository.createConnection(targetDigitalText.id, {
                noteId,
                selfContext: generalContext,
                otherContext: generalContext,
                // `otherCompositeIdentifier` ?
                compositeIdentifier: otherCompositeIdentifier,
                text: buildMultilingualTextWithSingleItem(textForNote, langaugeCodeForNote),
                role,
            });

            const { connections } = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            expect(connections).toHaveLength(1);

            const {
                selfContext,
                otherCompositeIdentifier: foundCompositeIdentifierForConnectedResource,
                otherContext,
                note,
                role: edgeConnectionMemberRole,
            } = connections[0];

            expect(selfContext).toEqual(generalContext);

            expect(otherContext).toEqual(generalContext);

            expect(foundCompositeIdentifierForConnectedResource).toEqual(otherCompositeIdentifier);

            const { languageCode: foundLanguageCode, text: foundNoteText } =
                note.getOriginalTextItem();

            expect(foundNoteText).toEqual(textForNote);

            expect(foundLanguageCode).toEqual(langaugeCodeForNote);

            expect(edgeConnectionMemberRole).toEqual(role);
        });
    });

    describe(`allowUser`, () => {
        const digitalTextId = digitalTextIds[0];

        const targeView = buildTestInstance(DigitalTextViewModel, {
            id: digitalTextId,
        });

        beforeEach(async () => {
            // clear existing term views
            await databaseProvider.clearViews();

            // clear existing audio item views

            await testQueryRepository.create(targeView);
        });

        it(`should add the user to the ACL`, async () => {
            const userId = buildDummyUuid(456);

            await testQueryRepository.allowUser(targeView.id, userId);

            const updatedView = (await testQueryRepository.fetchById(
                targeView.id
            )) as DigitalTextViewModel;

            const canUser = updatedView.canUser(userId);

            expect(canUser).toBe(true);
        });
    });
});
