import {
    AggregateType,
    CoscradUserRole,
    IDetailQueryResult,
    ITermViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../domain/models/shared/access-control/access-control-list.entity';
import { TermCreated } from '../../domain/models/term/commands';
import {
    ITermQueryRepository,
    TERM_QUERY_REPOSITORY_TOKEN,
} from '../../domain/models/term/queries';
import { CoscradContributor } from '../../domain/models/user-management/contributor';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { FullName } from '../../domain/models/user-management/user/entities/user/full-name.entity';
import { AggregateId } from '../../domain/types/AggregateId';
import { clonePlainObjectWithOverrides } from '../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events';
import { BaseResourceViewModel } from '../buildViewModelForResource/viewModels/base-resource.view-model';
import { TermViewModel } from '../buildViewModelForResource/viewModels/term.view-model';

// Set up endpoints: index endpoint, id endpoint
const indexEndpoint = `/resources/terms`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

// We require an existing user for ACL tests
const dummyQueryUserId = buildDummyUuid(4);

const { user: users, userGroup: userGroups } = buildTestDataInFlatFormat();

const dummyUser = (users as CoscradUser[])[0].clone({
    authProviderUserId: `auth0|${dummyQueryUserId}`,
    id: dummyQueryUserId,
    roles: [CoscradUserRole.viewer],
});

const dummyGroup = (userGroups as CoscradUserGroup[])[0].clone({ userIds: [dummyUser.id] });

const dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, [dummyGroup]);

// Set up test data (use event sourcing to set up state)
const termText = `Term (in the language)`;

const originalLanguage = LanguageCode.Haida;

const termId = buildDummyUuid(1);

const termCompositeId = {
    type: AggregateType.term,
    id: termId,
};

const dummyContributorFirstName = 'Dumb';

const dummyContributorLastName = 'McContributor';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor).clone({
    fullName: new FullName({
        firstName: dummyContributorFirstName,
        lastName: dummyContributorLastName,
    }),
});

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
    payload: {
        text: termText,
        languageCode: originalLanguage,
    },
    meta: {
        contributorIds: [dummyContributor.id],
    },
});

const dummyTerm = TermViewModel.fromTermCreated(termCreated.as(termCompositeId)[0] as TermCreated);

const targetTermView = clonePlainObjectWithOverrides(dummyTerm, {
    isPublished: true,
    contributions: [
        {
            id: dummyContributor.id,
            fullName: dummyContributor.fullName.toString(),
        },
    ],
});

const privateTermThatUserCanAccess = clonePlainObjectWithOverrides(dummyTerm, {
    accessControlList: new AccessControlList({
        allowedUserIds: [dummyQueryUserId],
        allowedGroupIds: [],
    }),
    isPublished: false,
});

// TODO Add happy path cases for a prompt term
// const promptTermId = buildDummyUuid(2)

const assertResourceHasContributionFor = (
    { id: contributorId }: CoscradContributor,
    resource: BaseResourceViewModel
) => {
    const hasContribution = resource.contributions.some(
        ({ id }) => id === contributorId
        // TODO support joining in contributors
        // && fullName === `${firstName} ${lastName}`
    );

    expect(hasContribution).toBe(true);
};

describe(`when querying for a term: fetch by Id`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let termQueryRepository: ITermQueryRepository;

    let seedTerms: (terms: TermViewModel[]) => Promise<void>;

    // let eventPublisher: ICoscradEventPublisher;
    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await databaseProvider.clearViews();
    });

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

            // eventPublisher = app.get(EVENT_PUBLISHER_TOKEN);

            termQueryRepository = app.get(TERM_QUERY_REPOSITORY_TOKEN);

            /**
             * We need to use the proper publisher to make sure events only
             * run if they match the pattern for the given handler.
             */
            seedTerms = async (terms: TermViewModel[]) => {
                await termQueryRepository.createMany(terms);
            };
        });

        describe(`when there is a term with the given Id`, () => {
            describe(`when a term is published`, () => {
                beforeEach(async () => {
                    /**
                     * It is important that we do this before allowing the event
                     * handlers to run, as they will only add contributions
                     * if the corresponding contributor exists.
                     */
                    await testRepositoryProvider
                        .getContributorRepository()
                        .create(dummyContributor);

                    await databaseProvider.clearViews();

                    await seedTerms([targetTermView]);
                });

                it('should return the expected result', async () => {
                    const res = await request(app.getHttpServer()).get(buildDetailEndpoint(termId));

                    expect(res.status).toBe(httpStatusCodes.ok);

                    const result = res.body as IDetailQueryResult<TermViewModel>;

                    expect(result.id).toBe(termId);

                    // We don't expose actions to non-admin users
                    expect(result.actions).toEqual([]);

                    assertResourceHasContributionFor(dummyContributor, result);
                });
            });

            describe(`when a term is not published`, () => {
                beforeEach(async () => {
                    // note that there is no publication event in this event history

                    // TODO: we need to check that contributors come through
                    await seedTerms([
                        clonePlainObjectWithOverrides(targetTermView, {
                            isPublished: false,
                        }),
                    ]);
                });

                // We pretend the resource does not exist when the user
                // does not have access to this term
                it(`should return not found (404)`, async () => {
                    const res = await request(app.getHttpServer()).get(buildDetailEndpoint(termId));

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });
        });

        describe(`when there is no term with the given Id`, () => {
            it(`should return not found (404)`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(buildDummyUuid(456))
                );

                expect(res.status).toBe(httpStatusCodes.notFound);
            });
        });
    });

    describe(`when the user is authenticated`, () => {
        describe(`when the user is a coscrad admin`, () => {
            beforeAll(async () => {
                ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: testDatabaseName,
                    },
                    {
                        testUserWithGroups: new CoscradUserWithGroups(
                            dummyUser.clone({
                                roles: [CoscradUserRole.superAdmin],
                            }),
                            []
                        ),
                    }
                ));

                seedTerms = async (terms: TermViewModel[]) => {
                    await termQueryRepository.createMany(terms);
                };
            });

            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    beforeEach(async () => {
                        // TODO: we need to check that contributors come through
                        await seedTerms([targetTermView]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        // Commands should be visible to admin
                        expect(res.body.actions).not.toEqual([]);
                    });
                });

                describe(`when the term is not published`, () => {
                    beforeEach(async () => {
                        // note that there is no publication event in this event history

                        // TODO: we need to check that contributors come through

                        await seedTerms([
                            clonePlainObjectWithOverrides(targetTermView, {
                                isPublished: false,
                            }),
                        ]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        // Commands should be visible to admin
                        expect(res.body.actions).not.toEqual([]);
                    });
                });

                describe(`when the term is not published but the user has explicit access`, () => {
                    beforeEach(async () => {
                        // note that there is no publication event in this event history

                        // TODO: we need to check that contributors come through

                        await seedTerms([privateTermThatUserCanAccess]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        // Commands should be visible to admin
                        expect(res.body.actions).not.toEqual([]);
                    });
                });
            });

            describe(`when there is no term with the given Id`, () => {
                it(`should return not found (404)`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(buildDummyUuid(456))
                    );

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });
        });

        describe(`when the user is a project admin`, () => {
            beforeAll(async () => {
                ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: testDatabaseName,
                    },
                    {
                        testUserWithGroups: new CoscradUserWithGroups(
                            dummyUser.clone({
                                roles: [CoscradUserRole.projectAdmin],
                            }),
                            []
                        ),
                    }
                ));

                seedTerms = async (terms: TermViewModel[]) => {
                    await termQueryRepository.createMany(terms);
                };
            });

            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    beforeEach(async () => {
                        // TODO: we need to check that contributors come through

                        await seedTerms([targetTermView]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        const term = res.body as IDetailQueryResult<ITermViewModel>;

                        const { actions } = term;

                        // admin should see commands
                        expect(actions).not.toHaveLength(0);

                        /**
                         * TODO We should add a separate test that checks
                         * that the correct actions come through in different
                         * scenarios.
                         */
                        expect(actions).toMatchSnapshot();
                    });
                });

                describe(`when the term is not published`, () => {
                    beforeEach(async () => {
                        await seedTerms([
                            clonePlainObjectWithOverrides(targetTermView, {
                                isPublished: false,
                            }),
                        ]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        // Commands should be visible to admin
                        expect(res.body.actions).not.toEqual([]);
                    });
                });

                describe(`when the term is not published but the user has explicit access`, () => {
                    // This case is a bit unclear: does this project admin have access to
                    // the project this term is a part of?
                    beforeEach(async () => {
                        await seedTerms([privateTermThatUserCanAccess]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        // Commands should be visible to admin
                        expect(res.body.actions).not.toEqual([]);
                    });
                });
            });

            describe(`when there is no term with the given Id`, () => {
                it(`should return not found (404)`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(buildDummyUuid(456))
                    );

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });
        });

        describe(`when the user is an ordinary authenticated user`, () => {
            beforeAll(async () => {
                ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: testDatabaseName,
                    },
                    {
                        testUserWithGroups: dummyUserWithGroups,
                    }
                ));

                seedTerms = async (terms: TermViewModel[]) => {
                    await termQueryRepository.createMany(terms);
                };
            });

            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    beforeEach(async () => {
                        await seedTerms([targetTermView]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        // We don't expose actions to non-admin users
                        expect(res.body.actions).toEqual([]);
                    });
                });

                describe(`when the term is not published and the user does not have access`, () => {
                    beforeEach(async () => {
                        await seedTerms([
                            clonePlainObjectWithOverrides(targetTermView, {
                                isPublished: false,
                                // no special access here
                                accessControlList: new AccessControlList(),
                            }),
                        ]);
                    });

                    // We pretend the resource does not exist when the user
                    // does not have access to this term
                    it(`should return not found (404)`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.notFound);
                    });
                });

                describe(`when the term is not published but the user has access`, () => {
                    beforeEach(async () => {
                        await seedTerms([privateTermThatUserCanAccess]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        // We don't expose actions to non-admin users
                        expect(res.body.actions).toEqual([]);
                    });
                });
            });

            describe(`when there is no term with the given Id`, () => {
                it(`should return not found (404)`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(buildDummyUuid(456))
                    );

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });
        });
    });
});
