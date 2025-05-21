import {
    AggregateType,
    CoscradUserRole,
    HttpStatusCode,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { clonePlainObjectWithOverrides } from '../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestDataInFlatFormat from '../../../../test-data/buildTestDataInFlatFormat';
import { buildTestInstance } from '../../../../test-data/utilities';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { assertResourceHasContributionFor } from '../../__tests__';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { ContributionSummary } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import { FullName } from '../../user-management/user/entities/user/full-name.entity';
import {
    IPhotographQueryRepository,
    PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
} from './photograph-query-repository.interface';
import { PhotographViewModel } from './photograph.view-model';

const indexEndpoint = `/resources/photographs`;

// We require an existing user for ACL tests
const dummyQueryUserId = buildDummyUuid(4);

const { user: users } = buildTestDataInFlatFormat();

// TODO support user groups
const dummyUser = (users as CoscradUser[])[0].clone({
    authProviderUserId: `auth0|${dummyQueryUserId}`,
    id: dummyQueryUserId,
    roles: [CoscradUserRole.viewer],
});

// Set up test data (use event sourcing to set up state)
const photographTitle = `Photograph Name (in the language)`;

const originalLanguage = LanguageCode.Haida;

const photographTitleTranslation = `Photograph Name (in English)`;

const translationLanguage = LanguageCode.English;

const photographId = buildDummyUuid(101);

const photographCompositeIdentifier = {
    type: AggregateType.photograph,
    id: photographId,
};

const photographIdUnpublishedNoUserAccessId = buildDummyUuid(102);

const photographIdUnpublishedWithUserAccessId = buildDummyUuid(103);

const dummyContributorFirstName = 'Dumb';

const dummyContributorLastName = 'McContributor';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor).clone({
    fullName: new FullName({
        firstName: dummyContributorFirstName,
        lastName: dummyContributorLastName,
    }),
});

const dummyPhotographView = buildTestInstance(PhotographViewModel, {
    ...photographCompositeIdentifier,
    name: buildMultilingualTextWithSingleItem(photographTitle, originalLanguage),
    contributions: [
        buildTestInstance(ContributionSummary, {
            contributorIds: [dummyContributor.id],
            statement: `Photograph created by ${dummyContributor.fullName.toString()}`,
            type: 'PHOTOGRAPH_CREATED',
        }),
    ],
});

const publicPhotographView = clonePlainObjectWithOverrides(dummyPhotographView, {
    isPublished: true,
    name: new MultilingualText(dummyPhotographView.name).translate({
        text: photographTitleTranslation,
        languageCode: translationLanguage,
        role: MultilingualTextItemRole.freeTranslation,
        // we are insisting by casting that the call to `translate` won't fail above
    }) as MultilingualText,
});

const privatePhotographThatUserCanAccess = clonePlainObjectWithOverrides(publicPhotographView, {
    id: photographIdUnpublishedWithUserAccessId,
    isPublished: false,
    accessControlList: new AccessControlList().allowUser(dummyQueryUserId),
});

const privatePhotographUserCannotAccess = clonePlainObjectWithOverrides(publicPhotographView, {
    id: photographIdUnpublishedNoUserAccessId,
    isPublished: false,
    // no special access
    accessControlList: new AccessControlList(),
});

describe(`when querying for a photograph: fetch many`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let photographQueryRepository: IPhotographQueryRepository;

    const setItUp = async (testUserWithGroups?: CoscradUserWithGroups) => {
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
            {
                ARANGO_DB_NAME: testDatabaseName,
                BASE_URL: 'https://www.photograph-queries.com',
                GLOBAL_PREFIX: 'myapi',
            },
            {
                testUserWithGroups,
            }
        ));

        photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);
    };

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                }
                // no authenticated user
            ));

            await app.init();

            photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);
        });

        describe(`when there is a published photograph in the index view`, () => {
            beforeEach(async () => {
                await databaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.contributors)
                    .clear();

                await databaseProvider.getDatabaseForCollection('photograph__VIEWS').clear();

                await testRepositoryProvider.getContributorRepository().create(dummyContributor);

                await photographQueryRepository.createMany([
                    publicPhotographView,
                    privatePhotographThatUserCanAccess,
                    privatePhotographUserCannotAccess,
                ]);
            });

            it(`should only return published photographs`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(httpStatusCodes.ok);

                const {
                    body: { entities },
                } = res;

                // TODO check that the actions are correct !!!!!
                expect(entities).toHaveLength(1);

                // Only one published result should come through from eventHistoryForMany
                const result = entities[0] as PhotographViewModel;

                expect(result.id).toBe(photographId);

                assertResourceHasContributionFor(dummyContributor, result);
            });
        });

        describe(`when there are no published photographs`, () => {
            beforeEach(async () => {
                await databaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.contributors)
                    .clear();

                await databaseProvider.getDatabaseForCollection('photograph__VIEWS').clear();

                await testRepositoryProvider.getContributorRepository().create(dummyContributor);

                /**
                 * Note that there is no ordinary system user authenticated for the request
                 * in this scenario. This is a public request.
                 */
                await photographQueryRepository.createMany([
                    privatePhotographUserCannotAccess,
                    privatePhotographThatUserCanAccess,
                ]);
            });

            it(`should return no photographs`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(httpStatusCodes.ok);

                expect(res.body.entities).toHaveLength(0);
            });
        });
    });

    describe(`when the user is authenticated as a non-admin user`, () => {
        beforeAll(async () => {
            await setItUp(
                new CoscradUserWithGroups(
                    dummyUser.clone({
                        roles: [CoscradUserRole.viewer],
                    }),
                    []
                )
            );
        });

        describe(`when there are some resources the user should not access`, () => {
            beforeEach(async () => {
                await databaseProvider.getDatabaseForCollection('photograph__VIEWS').clear();

                await databaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.contributors)
                    .clear();

                await photographQueryRepository.createMany([
                    publicPhotographView,
                    privatePhotographThatUserCanAccess,
                    // This one should not be visible to an ordinary user
                    privatePhotographUserCannotAccess,
                ]);

                await testRepositoryProvider.getContributorRepository().create(dummyContributor);
            });

            it(`should not return private results`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(httpStatusCodes.ok);

                /**
                 * + private, but user in ACL
                 * - private, user not in ACL
                 * + published
                 */
                expect(res.body.entities).toHaveLength(2);
            });
        });
    });

    describe('when the user is a project admin', () => {
        const userRole = CoscradUserRole.projectAdmin;

        beforeAll(async () => {
            await setItUp(
                new CoscradUserWithGroups(
                    dummyUser.clone({
                        roles: [userRole],
                    }),
                    []
                )
            );
        });

        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection('photograph__VIEWS').clear();

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.contributors)
                .clear();

            await photographQueryRepository.createMany([
                publicPhotographView,
                privatePhotographThatUserCanAccess,
                privatePhotographUserCannotAccess,
            ]);

            await testRepositoryProvider.getContributorRepository().create(dummyContributor);
        });

        it(`should allow the user to access private resources`, async () => {
            const res = await request(app.getHttpServer()).get(indexEndpoint);

            const numberOfPrivatePhotographs = 2;

            const numberOfPublicPhotographs = 1;

            expect(res.status).toBe(HttpStatusCode.ok);

            expect(res.body.entities).toHaveLength(
                numberOfPrivatePhotographs + numberOfPublicPhotographs
            );

            /**
             * This is to catch breaking changes in the API contract with
             * the client. See the above comment for the corresponding detail
             * endpoint test case.
             */
            expect(res.body).toMatchSnapshot();
        });
    });

    describe('when the user is a COSCRAD admin', () => {
        const userRole = CoscradUserRole.superAdmin;

        beforeAll(async () => {
            await setItUp(
                new CoscradUserWithGroups(
                    dummyUser.clone({
                        roles: [userRole],
                    }),
                    []
                )
            );
        });

        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection('photograph__VIEWS').clear();

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.contributors)
                .clear();

            await photographQueryRepository.createMany([
                publicPhotographView,
                privatePhotographThatUserCanAccess,
                privatePhotographUserCannotAccess,
            ]);

            await testRepositoryProvider.getContributorRepository().create(dummyContributor);
        });

        it(`should allow the user to access private resources`, async () => {
            const res = await request(app.getHttpServer()).get(indexEndpoint);

            const numberOfPrivatePhotographs = 2;

            const numberOfPublicPhotographs = 1;

            expect(res.status).toBe(HttpStatusCode.ok);

            expect(res.body.entities).toHaveLength(
                numberOfPrivatePhotographs + numberOfPublicPhotographs
            );
        });
    });
});
