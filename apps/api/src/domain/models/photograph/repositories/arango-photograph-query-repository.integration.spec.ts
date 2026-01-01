import {
    AggregateType,
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    IDetailQueryResult,
    IEdgeConnectionContext,
    IPhotographViewModel,
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
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoRepositoryForAggregate } from '../../../../persistence/repositories/arango-repository-for-aggregate';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { TestEventStream } from '../../../../test-data/events';
import { buildTestInstance } from '../../../../test-data/utilities';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import buildInstanceFactory from '../../../factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateId } from '../../../types/AggregateId';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { EdgeConnection } from '../../context/edge-connection.entity';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { TAG_QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../tag/repositories/tag-query-repository.interface';
import { CoscradContributor } from '../../user-management/contributor';
import { FullName } from '../../user-management/user/entities/user/full-name.entity';
import { PhotographCreated } from '../commands';
import { IPhotographQueryRepository } from '../queries';
import { PhotographViewModel } from '../queries/photograph.view-model';
import { ArangoPhotographQueryRepository } from './arango-photograph-query-repository';

const photographIds = [1, 2, 3].map(buildDummyUuid);

const mediaItemIds = [4, 5, 6].map(buildDummyUuid);

const buildPhotographTitle = (id: string) => `photograph ${id}`;

const photographTitle = buildPhotographTitle(photographIds[0]);

// const buildMediaItemTitle = (id: string) => `media item ${id}`;

// const mediaItemTitle = buildMediaItemTitle(mediaItemIds[0]);

const originalLanguageCode = LanguageCode.Chilcotin;

const _translationLanguageCode = LanguageCode.English;

const _textTranslation = 'foobar';

const dummyPhotographer = 'Tester Track Photographer';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

const contributorIds = [101, 102, 103].map(buildDummyUuid);

const contributorIdsAndNames = contributorIds.map((contributorId) => ({
    contributorId,
    fullName: new FullName({
        firstName: `user`,
        lastName: contributorId,
    }),
}));

const testContributors = contributorIdsAndNames.map(({ contributorId, fullName }) =>
    dummyContributor.clone({
        id: contributorId,
        fullName,
    })
);

const buildPhotographEventHistory = (
    id: AggregateId,
    title: string,
    languageCodeForTitle: LanguageCode,
    photographer: string,
    mediaItemId: string
) => {
    const photographCreated = new TestEventStream().andThen<PhotographCreated>({
        type: 'PHOTOGRAPH_CREATED',
        payload: {
            title,
            languageCodeForTitle,
            photographer,
            mediaItemId,
        },
        meta: {
            contributorIds: testContributors.map(({ id }) => id),
        },
    });

    return photographCreated.as({
        type: AggregateType.photograph,
        id,
    });
};

const photographEventStreams = photographIds.map((id, index) =>
    buildPhotographEventHistory(
        id,
        buildPhotographTitle(id),
        originalLanguageCode,
        dummyPhotographer,
        mediaItemIds[index]
    )
);

const photographViews = photographIds.map((_id, index) => {
    const eventHistory = photographEventStreams[index];

    const creationEvent = eventHistory[0] as PhotographCreated;

    return PhotographViewModel.fromPhotographCreated(creationEvent);
});

describe(`ArangoPhotographQueryRepository`, () => {
    let testQueryRepository: IPhotographQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let arangoDatabaseForCollection: ArangoDatabaseForCollection<
        IDetailQueryResult<IPhotographViewModel>
    >;

    let contributorRepository: IRepositoryForAggregate<CoscradContributor>;

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

        arangoDatabaseForCollection =
            databaseProvider.getDatabaseForCollection('photograph__VIEWS');

        testQueryRepository = new ArangoPhotographQueryRepository(connectionProvider);

        /**
         * Currently, the contributors are snapshot based (not event sourced).
         */
        contributorRepository = new ArangoRepositoryForAggregate(
            databaseProvider,
            ArangoCollectionId.contributors,
            buildInstanceFactory(CoscradContributor),
            mapDatabaseDocumentToAggregateDTO,
            mapEntityDTOToDatabaseDocument
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        const targetPhotographId = photographIds[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(photographViews[0]);
        });

        describe(`when there is a photograph with the given ID`, () => {
            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(targetPhotographId);

                expect(result).not.toBe(NotFound);

                const { name, mediaItemId: foundMediaItemID } = result as PhotographViewModel;

                const foundOriginalTitleForPhotograph = name.items.find(
                    ({ languageCode }) => languageCode === originalLanguageCode
                ).text;

                expect(foundOriginalTitleForPhotograph).toBe(photographTitle);

                expect(foundMediaItemID).toBe(mediaItemIds[0]);
            });
        });

        describe(`when there is no photograph with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('BOGUS_123');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            for (const photograph of photographViews) {
                await testQueryRepository.create(photograph);
            }
        });

        it(`should return the expected photograph views`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result).toHaveLength(photographViews.length);
        });
    });

    describe(`count`, () => {
        describe(`when there are photograph views in the database`, () => {
            beforeEach(async () => {
                await arangoDatabaseForCollection.clear();

                for (const photograph of photographViews) {
                    await testQueryRepository.create(photograph);
                }
            });

            it(`should return the expected result`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(photographViews.length);
            });
        });

        describe(`when the database collection is empty`, () => {
            beforeEach(async () => {
                await arangoDatabaseForCollection.clear();

                // no photographs are added here
            });

            it(`should return 0`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(0);
            });
        });
    });

    describe(`allowUser`, () => {
        const targetPhotograph = photographViews[0];

        beforeEach(async () => {
            // clear existing photograph views
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(targetPhotograph);
        });

        it(`should add the user to the ACL`, async () => {
            const userId = buildDummyUuid(457);

            await testQueryRepository.allowUser(targetPhotograph.id, userId);

            const updatedView = (await testQueryRepository.fetchById(
                targetPhotograph.id
            )) as PhotographViewModel;

            const updatedAcl = new AccessControlList(updatedView.accessControlList);

            const canUser = updatedAcl.canUser(userId);

            expect(canUser).toBe(true);
        });
    });

    describe(`delete`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.createMany(photographViews);
        });

        it(`should remove the given photograph`, async () => {
            const targetPhotographViewId = photographIds[0];

            const expectedNumberOfPhotographsAfterDelete = photographViews.length - 1;

            await testQueryRepository.delete(targetPhotographViewId);

            const actualNumberOfPhotographs = await testQueryRepository.count();

            expect(actualNumberOfPhotographs).toBe(expectedNumberOfPhotographsAfterDelete);
        });
    });

    describe(`create`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();
        });

        it(`should create the correct Photograph view`, async () => {
            const photographToCreate = photographViews[0];

            // act
            await testQueryRepository.create(photographToCreate);

            const searchResult = await testQueryRepository.fetchById(photographToCreate.id);

            expect(searchResult).not.toBe(NotFound);

            const foundPhotographView = searchResult as PhotographViewModel;

            const name = new MultilingualText(foundPhotographView.name);

            expect(name.getOriginalTextItem().text).toBe(photographTitle);
        });
    });

    describe(`createMany`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();
        });

        it(`should create the expected photograph views`, async () => {
            // act
            await testQueryRepository.createMany(photographViews);

            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(photographViews.length);
        });
    });

    describe('publish', () => {
        const targetPhotograph = photographViews[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(targetPhotograph);
        });

        it(`should publish the given photograph`, async () => {
            await testQueryRepository.publish(targetPhotograph.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetPhotograph.id
            )) as PhotographViewModel;

            expect(updatedView.isPublished).toBe(true);

            expect(updatedView.getAvailableCommands()).not.toContain('PUBLISH_RESOURCE');
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

        const newTag = buildTestInstance(EventSourcedTagViewModel, {
            id: newTagId,
            label: newTagLabel,
        });

        const targetView = buildTestInstance(PhotographViewModel, {
            tags: [existingTag],
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetView);

            await app.get(TAG_QUERY_REPOSITORY_PROVIDER_TOKEN).create(newTag);
        });

        it(`should tag the term`, async () => {
            await testQueryRepository.tag(targetView.id, newTag.id);

            const { tags } = (await testQueryRepository.fetchById(
                targetView.id
            )) as PhotographViewModel;

            expect(tags).toHaveLength(2);

            const tagSearchResult = tags.find(({ id }) => id === newTag.id);

            expect(tagSearchResult).toBeTruthy();

            const { label } = tagSearchResult;

            expect(label).toBe(newTagLabel);
        });
    });

    describe(`createNoteAbout`, () => {
        const targetView = buildTestInstance(PhotographViewModel, {
            notes: {},
        });

        const targetNote = buildTestInstance(EdgeConnection, {
            members: [
                {
                    compositeIdentifier: {
                        type: ResourceType.photograph,
                        id: targetView.id,
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

            await testQueryRepository.create(targetView);

            /**
             * Note that there is no need to put the target note in the domain
             * database. The context is passed into the repo update method
             * from the note creation event payload.
             */
        });

        it(`should append a note to the view`, async () => {
            await testQueryRepository.createNoteAbout(targetView.id, {
                noteId: targetNote.id,
                context: targetNote.members[0].context,
                text: targetNote.note,
            });

            const { notes } = (await testQueryRepository.fetchById(
                targetView.id
            )) as PhotographViewModel;

            expect(Object.keys(notes)).toHaveLength(1);

            const { note } = notes[targetNote.id];

            expect(note).toEqual({
                original: {
                    text: targetNote.note.items[0].text,
                    languageCode: targetNote.note.items[0].languageCode,
                },
                translations: {},
            });
        });
    });

    describe(`connectResourcesWith`, () => {
        const targetPhotograph = buildTestInstance(PhotographViewModel, {
            // no connections to start
            connections: [],
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetPhotograph);
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

            const textForNote = 'This is why the widget is relevant to the photograph.';

            const languageCodeForNote = LanguageCode.Chilcotin;

            const role = EdgeConnectionMemberRole.to;

            await testQueryRepository.createConnection(targetPhotograph.id, {
                noteId,
                selfContext: generalContext,
                otherContext: generalContext,
                otherCompositeIdentifier,
                text: buildMultilingualTextWithSingleItem(textForNote, languageCodeForNote),
                role,
            });

            const { connections } = (await testQueryRepository.fetchById(
                targetPhotograph.id
            )) as PhotographViewModel;

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

            expect(foundLanguageCode).toEqual(languageCodeForNote);

            expect(edgeConnectionMemberRole).toEqual(role);
        });
    });

    /**
     * TODO[https://www.pivotaltracker.com/story/show/188764063] support `unpublish`
     */
    describe(`attribute`, () => {
        const targetPhotograph = photographViews[0];

        const creationEvent = photographEventStreams[0][0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await databaseProvider.getDatabaseForCollection('contributors').clear();

            await testQueryRepository.create(targetPhotograph);

            await contributorRepository.createMany(testContributors);
        });

        it(`should add the given contributions`, async () => {
            await testQueryRepository.attribute(
                targetPhotograph.id,
                creationEvent.buildContributionSummary()
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetPhotograph.id
            )) as PhotographViewModel;

            const missingAttributions = updatedView.contributions.filter(
                ({ contributorIds: foundContributorIds }) =>
                    !contributorIds.some((id) => foundContributorIds.includes(id))
            );

            expect(missingAttributions).toHaveLength(0);

            const { contributorId: targetContributorId, fullName: expectedFullName } =
                contributorIdsAndNames[0];

            const contributionForFirstUser = updatedView.contributions.find(({ contributorIds }) =>
                contributorIds.includes(targetContributorId)
            );

            expect(contributionForFirstUser.statement.includes(expectedFullName.toString())).toBe(
                true
            );
        });
    });
});
