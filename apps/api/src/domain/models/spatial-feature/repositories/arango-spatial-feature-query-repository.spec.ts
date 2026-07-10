import {
    CoscradUserRole,
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    IEdgeConnectionContext,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import { SpatialFeatureModule } from '../../../../app/domain-modules/spatial-feature.module';
import { InternalError } from '../../../../lib/errors/InternalError';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import { ArangoRepositoryForAggregate } from '../../../../persistence/repositories/arango-repository-for-aggregate';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildInstanceFactory from '../../../factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { EdgeConnection } from '../../context/edge-connection.entity';
import { TAG_QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../tag/repositories/tag-query-repository.interface';
import { CoscradContributor } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import { FullName } from '../../user-management/user/entities/user/full-name.entity';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../__tests__/utilities/dummyDateNow';
import { PointCreated } from '../point/commands';
import {
    ISpatialFeatureQueryRepository,
    SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
} from '../queries/spatial-feature-query-repository.interface';
import { EventSourcedSpatialFeatureViewModel } from '../queries/spatial-feature.view-model.event-sourced';

const testAdminUser = new CoscradUserWithGroups(
    buildTestInstance(CoscradUser, {
        roles: [CoscradUserRole.superAdmin],
    }),
    []
);

describe(`ArangoSpatialFeatureRepository`, () => {
    let testQueryRepository: ISpatialFeatureQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let contributorRepository: IRepositoryForAggregate<CoscradContributor>;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync(), SpatialFeatureModule],
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

        await app.init();

        testQueryRepository = app.get(SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN);

        // TODO Once we have a query DB for contributors, we need to leverage this.
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

    const spatialFeatureIds = [1, 2, 3].map(buildDummyUuid);

    const buildTextForSpatialFeatureName = (id: string) => `spatial feature ${id}`;

    const spatialFeatureName = buildTextForSpatialFeatureName(spatialFeatureIds[0]);

    const originalLanguageCode = LanguageCode.English;

    const translationLanguageCode = LanguageCode.Chinook;

    const translationTextForName = 'translation of name';

    const dummyContributor = buildTestInstance(CoscradContributor);

    const contributorIds = [102, 103, 104].map(buildDummyUuid);

    const contributorIdsAndNames = contributorIds.map((contributorId) => ({
        contributorId,
        fullName: new FullName({
            firstName: 'user',
            lastName: contributorId,
        }),
    }));

    const testContributors = contributorIdsAndNames.map(({ contributorId, fullName }) =>
        dummyContributor.clone({ id: contributorId, fullName })
    );

    // TODO add examples of point, line and polygon
    const spatialFeatureViews: EventSourcedSpatialFeatureViewModel[] = spatialFeatureIds.map(
        (id) => {
            const name = buildMultilingualTextWithSingleItem(
                buildTextForSpatialFeatureName(id),
                originalLanguageCode
            );

            return buildTestInstance(EventSourcedSpatialFeatureViewModel, {
                id,
                // TODO remove the duplication between these 2 props. top-level name should be a getter \ calculated field.
                name,
                properties: {
                    name,
                },
            });
        }
    );

    describe(`fetchById`, () => {
        const targetSpatialFeatureId = spatialFeatureIds[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(spatialFeatureViews[0]);
        });

        describe(`when there is a spatial feature with the given ID`, () => {
            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(
                    targetSpatialFeatureId,
                    testAdminUser
                );

                expect(result).not.toBe(NotFound);

                const { name } = result as EventSourcedSpatialFeatureViewModel;

                const foundOriginalTextForSpatialFeature = name.items.find(
                    ({ languageCode }) => languageCode === originalLanguageCode
                ).text;

                expect(foundOriginalTextForSpatialFeature).toBe(spatialFeatureName);
            });
        });

        describe(`when there is no spatial feature with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('BOGUS_321');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(spatialFeatureViews);
        });

        it('should return the expected spatial feature views', async () => {
            const { entities: result } = await testQueryRepository.fetchMany({
                user: testAdminUser,
            });

            expect(result).toHaveLength(spatialFeatureIds.length);
        });
    });

    describe(`count`, () => {
        describe(`when there are spatial feature views in the database`, () => {
            beforeEach(async () => {
                await databaseProvider.clearViews();

                await testQueryRepository.createMany(spatialFeatureViews);
            });

            it(`should return the expected result`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(spatialFeatureViews.length);
            });
        });
    });

    describe.skip(`create`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();
        });

        it(`should create the correct spatial feature view`, async () => {
            const spatialFeatureToCreate = spatialFeatureViews[0];

            await testQueryRepository.create(spatialFeatureToCreate);

            const searchResult = await testQueryRepository.fetchById(
                spatialFeatureToCreate.id,
                testAdminUser
            );

            expect(searchResult).not.toBe(NotFound);

            const foundSpatialFeatureView = searchResult as EventSourcedSpatialFeatureViewModel;

            const name = new MultilingualText(foundSpatialFeatureView.name);

            const foundNameText = name.getOriginalTextItem().text;

            expect(foundNameText).toBe(spatialFeatureName);
        });
    });

    describe(`createMany`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();
        });

        it(`should create the expected spatial feature views`, async () => {
            await testQueryRepository.createMany(spatialFeatureViews);

            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(spatialFeatureViews.length);
        });
    });

    describe(`tag`, () => {
        const existingTagLabel = 'trees';

        const existingTag: TagViewModel = {
            id: buildDummyUuid(9),
            label: existingTagLabel,
            name: buildMultilingualTextWithSingleItem(existingTagLabel),
            members: [],
        };

        const newTagId = buildDummyUuid(19);

        const newTagLabel = 'mammals';

        const newTag = buildTestInstance(EventSourcedTagViewModel, {
            id: newTagId,
            label: newTagLabel,
        });

        const targetSpatialFeature = buildTestInstance(EventSourcedSpatialFeatureViewModel, {
            tags: [existingTag],
        });

        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection(ArangoCollectionId.tags).clear();

            await databaseProvider.clearViews();

            await testQueryRepository.create(targetSpatialFeature);

            await app.get(TAG_QUERY_REPOSITORY_PROVIDER_TOKEN).create(newTag);
        });

        it(`should tag the spatial feature`, async () => {
            await testQueryRepository.tag(targetSpatialFeature.id, newTag.id);

            const { tags } = (await testQueryRepository.fetchById(
                targetSpatialFeature.id,
                testAdminUser
            )) as EventSourcedSpatialFeatureViewModel;

            expect(tags).toHaveLength(2);

            const tagSearchResult = tags.find(({ id }) => id === newTag.id);

            expect(tagSearchResult).toBeTruthy();

            const { label } = tagSearchResult;

            expect(label).toBe(newTagLabel);
        });
    });

    describe(`createNoteAbout`, () => {
        const targetSpatialFeature = buildTestInstance(EventSourcedSpatialFeatureViewModel, {
            notes: {},
        });

        const targetNoteText = 'this is a note for the spatial feature';

        const targetNoteLanguageCode = LanguageCode.English;

        const targetNoteMultilingualText = buildMultilingualTextWithSingleItem(
            targetNoteText,
            targetNoteLanguageCode
        );

        const targetNote = buildTestInstance(EdgeConnection, {
            note: targetNoteMultilingualText,
            members: [
                {
                    compositeIdentifier: {
                        type: ResourceType.video,
                        id: targetSpatialFeature.id,
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

            await testQueryRepository.create(targetSpatialFeature);
        });

        it(`should append a note to the spatial feature`, async () => {
            await testQueryRepository.createNoteAbout(targetSpatialFeature.id, {
                noteId: targetNote.id,
                context: targetNote.members[0].context,
                text: targetNote.note,
            });

            const { notes } = (await testQueryRepository.fetchById(
                targetSpatialFeature.id,
                testAdminUser
            )) as EventSourcedSpatialFeatureViewModel;

            expect(Object.keys(notes)).toHaveLength(1);

            const { note } = notes[targetNote.id];

            expect(note).toEqual({
                original: {
                    languageCode: LanguageCode.English,
                    text: targetNoteText,
                },
                translations: {},
            });
        });
    });

    describe(`translateSpatialFeatureName`, () => {
        const targetSpatialFeature = spatialFeatureViews[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetSpatialFeature);
        });

        it(`should append the expected multilingual text item`, async () => {
            await testQueryRepository.translateSpatialFeatureName(
                targetSpatialFeature.id,
                translationTextForName,
                translationLanguageCode
            );

            const updatedSpatialFeature = await testQueryRepository.fetchById(
                targetSpatialFeature.id,
                testAdminUser
            );

            if (isNotFound(updatedSpatialFeature)) {
                expect(updatedSpatialFeature).not.toBe(NotFound);

                throw new InternalError('test failed');
            }

            const updatedName = new MultilingualText(updatedSpatialFeature.name);

            const searchResultForTranslation = updatedName.getTranslation(translationLanguageCode);

            expect(searchResultForTranslation).not.toBe(NotFound);

            const foundTranslation = searchResultForTranslation as MultilingualTextItem;

            expect(foundTranslation.text).toBe(translationTextForName);

            expect(foundTranslation.role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`createConnection`, () => {
        const targetSpatialFeature = buildTestInstance(EventSourcedSpatialFeatureViewModel, {
            connections: {},
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetSpatialFeature);
        });

        it(`should add the connection info`, async () => {
            const generalContext: IEdgeConnectionContext = {
                type: EdgeConnectionContextType.general,
            };

            const otherCompositeIdentifier = {
                type: 'widget' as ResourceType,
                id: buildDummyUuid(98),
            };

            const noteId = buildDummyUuid(43);

            const textForNote = 'this is why the widget is relevant to the spatial feature';

            const languageCodeForNote = LanguageCode.Chilcotin;

            const role = EdgeConnectionMemberRole.to;

            await testQueryRepository.createConnection(targetSpatialFeature.id, {
                noteId,
                selfContext: generalContext,
                otherContext: generalContext,
                otherCompositeIdentifier,
                text: buildMultilingualTextWithSingleItem(textForNote, languageCodeForNote),
                role,
            });

            const { connections } = (await testQueryRepository.fetchById(
                targetSpatialFeature.id,
                testAdminUser
            )) as EventSourcedSpatialFeatureViewModel;

            expect(Object.keys(connections)).toHaveLength(1);

            const {
                selfContext,
                otherCompositeIdentifier: foundCompositeIdentifierForConnectedResource,
                otherContext,
                note,
                role: edgeConnectionMemberRole,
            } = connections[noteId];

            expect(selfContext).toEqual(generalContext);

            expect(otherContext).toEqual(generalContext);

            expect(foundCompositeIdentifierForConnectedResource).toEqual(otherCompositeIdentifier);

            const {
                original: { languageCode: foundLanguageCode, text: foundNoteText },
            } = note;

            expect(foundNoteText).toEqual(textForNote);

            expect(foundLanguageCode).toEqual(languageCodeForNote);

            expect(edgeConnectionMemberRole).toEqual(role);
        });
    });

    describe(`allowUser`, () => {
        const targetSpatialFeature = spatialFeatureViews[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetSpatialFeature);
        });

        // TODO run as the target user
        it(`should add the user to the ACL`, async () => {
            const userId = buildDummyUuid(567);

            await testQueryRepository.allowUser(targetSpatialFeature.id, userId);
        });
    });

    describe(`publish`, () => {
        const targetSpatialFeature = spatialFeatureViews[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetSpatialFeature);
        });

        it(`should publish the given spatial feature`, async () => {
            await testQueryRepository.publish(targetSpatialFeature.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetSpatialFeature.id,
                undefined
            )) as EventSourcedSpatialFeatureViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`attribute`, () => {
        const targetSpatialFeature = spatialFeatureViews[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await databaseProvider.getDatabaseForCollection('contributors').clear();

            await testQueryRepository.create(targetSpatialFeature);

            await contributorRepository.createMany(testContributors);
        });

        describe(`when there are contributor IDs on the event meta`, () => {
            it(`should add the given contributions`, async () => {
                const testTimestamp = dummyDateNow;

                await testQueryRepository.attribute(
                    targetSpatialFeature.id,
                    buildTestInstance(PointCreated, {
                        type: 'POINT_CREATED',
                        meta: {
                            contributorIds: testContributors.map((c) => c.id),
                            dateCreated: testTimestamp,
                        },
                    }).buildContributionSummary()
                );

                const updatedView = (await testQueryRepository.fetchById(
                    targetSpatialFeature.id,
                    testAdminUser
                )) as EventSourcedSpatialFeatureViewModel;

                const missingAttributions = updatedView.contributions.filter(
                    (contributionRecord) =>
                        !contributorIds.some((id) => contributionRecord.contributorIds.includes(id))
                );

                expect(missingAttributions).toHaveLength(0);

                const contributionForCreationEvent = updatedView.contributions.find(
                    ({ type }) => type === 'POINT_CREATED'
                );

                expect(contributionForCreationEvent.statement).toMatchSnapshot();

                expect(contributionForCreationEvent.contributorIds).toEqual(
                    testContributors.map(({ id }) => id)
                );

                expect(contributionForCreationEvent.timestamp).toEqual(testTimestamp);
            });
        });

        describe(`when there are no contributor IDs on the event meta`, () => {
            it(`should default the message to admin`, async () => {
                await testQueryRepository.attribute(
                    targetSpatialFeature.id,
                    buildTestInstance(PointCreated, {
                        type: 'POINT_CREATED',
                        meta: {
                            contributorIds: [],
                        },
                    }).buildContributionSummary()
                );

                const updatedView = (await testQueryRepository.fetchById(
                    targetSpatialFeature.id,
                    testAdminUser
                )) as EventSourcedSpatialFeatureViewModel;

                const targetContribution = updatedView.contributions[0];

                expect(targetContribution.contributorIds).toHaveLength(0);

                expect(targetContribution.statement.includes('by: (data entry) admin')).toBe(true);
            });
        });
    });
});
