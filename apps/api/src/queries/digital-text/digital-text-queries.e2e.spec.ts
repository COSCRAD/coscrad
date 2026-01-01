import {
    CoscradUserRole,
    IDetailQueryResult,
    IDigitalTextViewModel,
    IIndexQueryResult,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes, { HttpStatusCode } from '../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import { buildMultilingualTextWithSingleItem } from '../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../domain/common/entities/multilingual-text';
import { assertQueryResult } from '../../domain/models/__tests__';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import DigitalTextPage from '../../domain/models/digital-text/entities/digital-text-page.entity';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../domain/models/digital-text/queries/digital-text-query-repository.interface';
import { AccessControlList } from '../../domain/models/shared/access-control/access-control-list.entity';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { AggregateId } from '../../domain/types/AggregateId';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../test-data/utilities';
import { ConnectionRecordForResourceViewModel } from '../buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { EventSourcedTagViewModel } from '../buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { DigitalTextViewModel } from './digital-text.view-model';

const indexEndpoint = `/resources/digitalTexts`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

const digitalTextId = buildDummyUuid(900);

const dummyUser = buildTestInstance(CoscradUser, {
    id: buildDummyUuid(88),
    roles: [CoscradUserRole.viewer],
});

const dummyGroup = buildTestInstance(CoscradUserGroup, {
    userIds: [dummyUser.id],
});

const dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, [dummyGroup]);

const publicDigitalText = buildTestInstance(DigitalTextViewModel, {
    id: buildDummyUuid(101),
    name: buildMultilingualTextWithSingleItem('published text'),
    isPublished: true,
    accessControlList: new AccessControlList(),
    tags: [buildTestInstance(EventSourcedTagViewModel)],
});

const testNote = buildTestInstance(NoteRecordForResourceViewModel, {});

const privateDigitalText = buildTestInstance(DigitalTextViewModel, {
    id: buildDummyUuid(102),
    name: buildMultilingualTextWithSingleItem('private text'),
    isPublished: false,
    // empty
    accessControlList: new AccessControlList(),
    tags: [buildTestInstance(EventSourcedTagViewModel)],
    notes: {
        [testNote.id]: testNote,
    },
    connections: [buildTestInstance(ConnectionRecordForResourceViewModel)],
    pages: ['i', 'ii', 'iii'].map((pageId) =>
        buildTestInstance(DigitalTextPage, {
            identifier: pageId,
        })
    ),
});

/**
 * TODO Move this test to a higher level. Eventually, we may want to run the
 * API out of process and execute these queries against a local, live server.
 * This will optimize performance and solve some known memory leaks with
 * test libraries.
 *
 * TODO Write a separate test for `getAvailableCommands`.
 */
describe(`When querying for a digital text`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
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

            await app.init();
        });

        describe(`fetch single (by ID)`, () => {
            describe(`when the resource is published`, () => {
                it(`should return the resource (consistent with the API contract)`, async () => {
                    await app
                        .get<IDigitalTextQueryRepository>(
                            DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                        )
                        .create(publicDigitalText);

                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(publicDigitalText.id)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);
                });

                it.todo(`should not expose private photos or audio`);
            });

            describe(`when the resource is not published`, () => {
                it(`should return not found`, async () => {
                    await assertQueryResult({
                        app,
                        seedInitialState: async () => {
                            await app
                                .get<IDigitalTextQueryRepository>(
                                    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                                )
                                .create(privateDigitalText);
                        },
                        endpoint: buildDetailEndpoint(privateDigitalText.id),
                        expectedStatus: HttpStatusCode.notFound,
                    });
                });
            });
        });

        describe(`fetch many`, () => {
            it(`should only return published digital texts`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await app
                            .get<IDigitalTextQueryRepository>(
                                DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                            )
                            .createMany([privateDigitalText, publicDigitalText]);
                    },
                    endpoint: indexEndpoint,
                    expectedStatus: HttpStatusCode.ok,
                    checkResponseBody: async ({
                        entities,
                    }: IIndexQueryResult<IDigitalTextViewModel>) => {
                        // The public user should only see the 1 public digital text
                        expect(entities).toHaveLength(1);
                    },
                });
            });

            it.todo(`should not expose private photos or audio`);
        });
    });

    describe(`when the user is authenticated as a non-admin user`, () => {
        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                },
                {
                    testUserWithGroups: dummyUserWithGroups,
                }
            ));
        });

        const privateWithUserAccess = buildTestInstance(DigitalTextViewModel, {
            id: digitalTextId,
            isPublished: false,
            accessControlList: new AccessControlList().allowUser(dummyUserWithGroups.id),
        });

        describe(`fetch single (by ID)`, () => {
            describe(`when there are no existing digital texts`, () => {
                it(`should return not found`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(buildDummyUuid(456))
                    );

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });

            describe(`when there is a digital text with the given ID`, () => {
                describe(`when the digital text is published`, () => {
                    it(`should return the corresponding result`, async () => {
                        await assertQueryResult({
                            app,
                            seedInitialState: async () => {
                                await app
                                    .get<IDigitalTextQueryRepository>(
                                        DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                                    )
                                    .create(publicDigitalText);
                            },
                            endpoint: buildDetailEndpoint(publicDigitalText.id),
                            expectedStatus: HttpStatusCode.ok,
                            checkResponseBody: async (
                                result: IDetailQueryResult<IDigitalTextViewModel>
                            ) => {
                                expect(result.id).toBe(publicDigitalText.id);

                                const expectedTitle = new MultilingualText(publicDigitalText.name);

                                expect(result.name).toEqual(expectedTitle.toDTO());

                                const searchResult = result.tags.find(
                                    ({ label }) => label === publicDigitalText.tags[0].label
                                );

                                expect(searchResult.id).toBe(publicDigitalText.tags[0].id);
                            },
                        });
                    });

                    it.todo(`should not expose private photos or audio`);
                });

                describe(`when the digital text is not published`, () => {
                    describe(`when the user is not part of the digital text's ACL`, () => {
                        it(`should return not found`, async () => {
                            await assertQueryResult({
                                app,
                                seedInitialState: async () => {
                                    await app
                                        .get<IDigitalTextQueryRepository>(
                                            DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                                        )
                                        .create(privateDigitalText);
                                },
                                endpoint: buildDetailEndpoint(digitalTextId),
                                expectedStatus: HttpStatusCode.notFound,
                            });
                        });
                    });

                    describe(`when the user is part of the digital text's ACL`, () => {
                        describe('as a user ', () => {
                            it(`should return the digital text`, async () => {
                                await assertQueryResult({
                                    app,
                                    seedInitialState: async () => {
                                        await app
                                            .get<IDigitalTextQueryRepository>(
                                                DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                                            )
                                            .create(privateWithUserAccess);
                                    },
                                    endpoint: buildDetailEndpoint(digitalTextId),
                                    expectedStatus: HttpStatusCode.ok,
                                });
                            });
                        });

                        describe(`as the member of a group`, () => {
                            // TODO Add `GRANT_RESOURCE_READ_ACCESS_TO_GROUP`
                            it.todo(`should succeed`);
                        });
                    });
                });
            });
        });

        describe(`fetch many`, () => {
            describe(`when the digital text is not published`, () => {
                describe(`when the user does not have read access`, () => {
                    it(`should not return the unpublished digital text`, async () => {
                        await assertQueryResult({
                            app,
                            seedInitialState: async () => {
                                await app
                                    .get<IDigitalTextQueryRepository>(
                                        DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                                    )
                                    .createMany([
                                        privateDigitalText,
                                        publicDigitalText,
                                        privateWithUserAccess,
                                    ]);
                            },
                            endpoint: indexEndpoint,
                            expectedStatus: HttpStatusCode.ok,
                            checkResponseBody: async ({
                                entities,
                            }: IIndexQueryResult<IDigitalTextViewModel>) => {
                                /**
                                 * - privateDigitalText
                                 * + publicDigitalText
                                 * + privateWithUserAccess
                                 */
                                expect(entities).toHaveLength(2);
                            },
                        });
                    });

                    it.todo(`should not expose private photos or audio`);
                });
            });
        });
    });

    describe(`when the user is a project admin`, () => {
        const userRole = CoscradUserRole.projectAdmin;

        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                },
                {
                    testUserWithGroups: new CoscradUserWithGroups(
                        dummyUser.clone({
                            roles: [userRole],
                        }),
                        []
                    ),
                }
            ));
        });

        describe(`detail queries (fetch by ID)`, () => {
            it(`should allow the user to access the private resource`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await app
                            .get<IDigitalTextQueryRepository>(
                                DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                            )
                            .create(privateDigitalText);
                    },
                    endpoint: buildDetailEndpoint(privateDigitalText.id),
                    expectedStatus: HttpStatusCode.ok,
                    checkResponseBody: async (body: IDetailQueryResult<IDigitalTextViewModel>) => {
                        /**
                         * Whenever this snapshot changes, it means the API contract
                         * with the client has changed. At a practical level, this means
                         * we have introduced potentially breaking changes or at least
                         * enhancements that now must be supported on the front-end.
                         *
                         * Snapshotting forces us to be intentional about making
                         * such changes in a controlled manner.
                         *
                         * We do this in one of the admin test cases to capture
                         * command forms and other priviliged properties in the
                         * snapshot.
                         */
                        expect(body).toMatchSnapshot();
                    },
                });
            });
        });

        describe(`index queries (fetch many)`, () => {
            it(`should allow the user to access private resources`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await app
                            .get<IDigitalTextQueryRepository>(
                                DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                            )
                            .createMany([publicDigitalText, privateDigitalText]);
                    },
                    endpoint: indexEndpoint,
                    expectedStatus: HttpStatusCode.ok,
                    checkResponseBody: async (body: IIndexQueryResult<IDigitalTextViewModel>) => {
                        const { entities } = body;

                        expect(entities).toHaveLength(2);

                        // we do this for one admin test case for the index response as well as a contract test
                        expect(body).toMatchSnapshot();
                    },
                });
            });
        });
    });

    describe(`when the user is a COSCRAD admin`, () => {
        const userRole = CoscradUserRole.superAdmin;

        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                },
                {
                    testUserWithGroups: new CoscradUserWithGroups(
                        dummyUser.clone({
                            roles: [userRole],
                        }),
                        []
                    ),
                }
            ));
        });

        describe(`detail queries (fetch by ID)`, () => {
            it(`should allow the user to access the private resource`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await app
                            .get<IDigitalTextQueryRepository>(
                                DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                            )
                            .create(privateDigitalText);
                    },
                    endpoint: buildDetailEndpoint(privateDigitalText.id),
                    expectedStatus: HttpStatusCode.ok,
                    checkResponseBody: async (body: IDetailQueryResult<IDigitalTextViewModel>) => {
                        /**
                         * Whenever this snapshot changes, it means the API contract
                         * with the client has changed. At a practical level, this means
                         * we have introduced potentially breaking changes or at least
                         * enhancements that now must be supported on the front-end.
                         *
                         * Snapshotting forces us to be intentional about making
                         * such changes in a controlled manner.
                         *
                         * We do this in one of the admin test cases to capture
                         * command forms and other priviliged properties in the
                         * snapshot.
                         */
                        expect(body).toMatchSnapshot();
                    },
                });
            });
        });

        describe(`index queries (fetch many)`, () => {
            it(`should allow the user to access private resources`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await app
                            .get<IDigitalTextQueryRepository>(
                                DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN
                            )
                            .createMany([publicDigitalText, privateDigitalText]);
                    },
                    endpoint: indexEndpoint,
                    expectedStatus: HttpStatusCode.ok,
                    checkResponseBody: async (body: IIndexQueryResult<IDigitalTextViewModel>) => {
                        const { entities } = body;

                        expect(entities).toHaveLength(2);

                        // we do this for one admin test case for the index response as well as a contract test
                        expect(body).toMatchSnapshot();
                    },
                });
            });
        });
    });
});
