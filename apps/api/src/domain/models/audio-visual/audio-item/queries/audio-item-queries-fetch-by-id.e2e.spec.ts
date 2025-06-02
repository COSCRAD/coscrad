import { CoscradUserRole, HttpStatusCode, IDetailQueryResult } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { assertQueryResult } from '../../../__tests__';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from './audio-item-query-repository.interface';
import { EventSourcedAudioItemViewModel } from './audio-item.view-model.event-sourced';

const indexEndpoint = `/resources/audioItems`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

const _dummyQueryUserId = buildDummyUuid(42);

const audioItemId = buildDummyUuid(1);

const testAudioItemName = 'You got the right one, baby, uh huh!';

describe(`when querying for an audio item: fetch by ID`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let audioItemQueryRepository: IAudioItemQueryRepository;

    const setItUp = async (userWithGroups?: CoscradUserWithGroups) => {
        // TODO Can we avoid this here?
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
            {
                ARANGO_DB_NAME: testDatabaseName,
                BASE_URL: 'https://jaybam.com/home',
            },
            {
                testUserWithGroups: userWithGroups,
            }
        ));

        audioItemQueryRepository = app.get(AUDIO_QUERY_REPOSITORY_TOKEN);
    };

    // let eventPublisher: ICoscradEventPublisher;
    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is aunauthenticated (general public)`, () => {
        beforeAll(async () => {
            // no mock user
            await setItUp();
        });

        describe(`when there is an audio item with the given ID`, () => {
            describe(`when the audio item is published`, () => {
                it(`should return the audio item`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(audioItemId),
                        seedInitialState: async () => {
                            await audioItemQueryRepository.create(
                                buildTestInstance(EventSourcedAudioItemViewModel, {
                                    id: audioItemId,
                                    name: buildMultilingualTextWithSingleItem(testAudioItemName),
                                    accessControlList: new AccessControlList(),
                                    isPublished: true,
                                })
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                        checkResponseBody: async (
                            result: IDetailQueryResult<EventSourcedAudioItemViewModel>
                        ) => {
                            /**
                             * We stick to a sanity check here. We test that
                             * the repo writes \ fetches the correct info in
                             * great detail in its test.
                             */
                            expect(result?.name?.items[0].text).toBe(testAudioItemName);
                        },
                    });
                });
            });

            describe(`when the audio item is not published`, () => {
                it(`should return not found`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(audioItemId),
                        seedInitialState: async () => {
                            await audioItemQueryRepository.create(
                                buildTestInstance(EventSourcedAudioItemViewModel, {
                                    id: audioItemId,
                                    isPublished: false,
                                })
                            );
                        },
                        expectedStatus: HttpStatusCode.notFound,
                    });
                });
            });
        });

        describe(`when there is no audio item with the given ID`, () => {
            it(`should return not found`, async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(audioItemId),
                    seedInitialState: async () => {
                        // no terms were added
                        Promise.resolve();
                    },
                    expectedStatus: HttpStatusCode.notFound,
                });
            });
        });
    });

    describe(`when the user is an ordinary viewer (non-admin)`, () => {
        const ordinaryUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.viewer],
        });

        const testUserWithGroups = new CoscradUserWithGroups(ordinaryUser, []);

        beforeAll(async () => {
            await setItUp(testUserWithGroups);
        });

        describe(`when there is an audio item with the given ID`, () => {
            describe(`when the audio item is public`, () => {
                it(`should return the audio item`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(audioItemId),
                        seedInitialState: async () => {
                            await audioItemQueryRepository.create(
                                buildTestInstance(EventSourcedAudioItemViewModel, {
                                    id: audioItemId,
                                    name: buildMultilingualTextWithSingleItem(testAudioItemName),
                                    accessControlList: new AccessControlList(),
                                    isPublished: true,
                                })
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                        checkResponseBody: async (
                            result: IDetailQueryResult<EventSourcedAudioItemViewModel>
                        ) => {
                            /**
                             * We stick to a sanity check here. We test that
                             * the repo writes \ fetches the correct info in
                             * great detail in its test.
                             */
                            expect(result?.name?.items[0].text).toBe(testAudioItemName);
                        },
                    });
                });
            });

            describe(`when the audio item is not public`, () => {
                describe(`when the user is in the query ACL`, () => {
                    it(`should return the audio item`, async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(audioItemId),
                            seedInitialState: async () => {
                                await audioItemQueryRepository.create(
                                    buildTestInstance(EventSourcedAudioItemViewModel, {
                                        id: audioItemId,
                                        name: buildMultilingualTextWithSingleItem(
                                            testAudioItemName
                                        ),
                                        accessControlList: new AccessControlList().allowUser(
                                            testUserWithGroups.id
                                        ),
                                        isPublished: false,
                                    })
                                );
                            },
                            expectedStatus: HttpStatusCode.ok,
                            checkResponseBody: async (
                                result: IDetailQueryResult<EventSourcedAudioItemViewModel>
                            ) => {
                                /**
                                 * We stick to a sanity check here. We test that
                                 * the repo writes \ fetches the correct info in
                                 * great detail in its test.
                                 */
                                expect(result?.name?.items[0].text).toBe(testAudioItemName);
                            },
                        });
                    });
                });

                describe(`when the user is not in the query ACL`, () => {
                    it('should return not found', async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(audioItemId),
                            seedInitialState: async () => {
                                await audioItemQueryRepository.create(
                                    buildTestInstance(EventSourcedAudioItemViewModel, {
                                        id: audioItemId,
                                        isPublished: false,
                                        // empty
                                        accessControlList: new AccessControlList(),
                                    })
                                );
                            },
                            expectedStatus: HttpStatusCode.notFound,
                        });
                    });
                });
            });
        });

        describe(`when there is no audio item with the given ID`, () => {
            it(`should return not found`, async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(audioItemId),
                    seedInitialState: async () => {
                        // no terms were added
                        Promise.resolve();
                    },
                    expectedStatus: HttpStatusCode.notFound,
                });
            });
        });
    });

    describe(`when the user is a project admin`, () => {
        const projectAdminUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.projectAdmin],
        });

        const testUserWithGroups = new CoscradUserWithGroups(projectAdminUser, []);

        beforeAll(async () => {
            await setItUp(testUserWithGroups);
        });

        describe(`when there is an audio item with the given ID`, () => {
            describe(`when the audio item is public`, () => {
                it(`should return the audio item`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(audioItemId),
                        seedInitialState: async () => {
                            await audioItemQueryRepository.create(
                                buildTestInstance(EventSourcedAudioItemViewModel, {
                                    id: audioItemId,
                                    name: buildMultilingualTextWithSingleItem(testAudioItemName),
                                    accessControlList: new AccessControlList(),
                                    isPublished: true,
                                })
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                        checkResponseBody: async (
                            result: IDetailQueryResult<EventSourcedAudioItemViewModel>
                        ) => {
                            /**
                             * We stick to a sanity check here. We test that
                             * the repo writes \ fetches the correct info in
                             * great detail in its test.
                             */
                            expect(result?.name?.items[0].text).toBe(testAudioItemName);

                            /**
                             * We snapshot one and only one response here as a
                             * contract test. We do this in an admin test case
                             * so that command forms are captured on the
                             * response.
                             */
                            expect(result).toMatchSnapshot();
                        },
                    });
                });
            });

            describe(`when the audio item is not public`, () => {
                describe(`when the user is in the ACL`, () => {
                    it(`should return the audio item`, async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(audioItemId),
                            seedInitialState: async () => {
                                await audioItemQueryRepository.create(
                                    buildTestInstance(EventSourcedAudioItemViewModel, {
                                        id: audioItemId,
                                        name: buildMultilingualTextWithSingleItem(
                                            testAudioItemName
                                        ),
                                        accessControlList: new AccessControlList().allowUser(
                                            testUserWithGroups.id
                                        ),
                                        isPublished: false,
                                    })
                                );
                            },
                            expectedStatus: HttpStatusCode.ok,
                            checkResponseBody: async (
                                result: IDetailQueryResult<EventSourcedAudioItemViewModel>
                            ) => {
                                /**
                                 * We stick to a sanity check here. We test that
                                 * the repo writes \ fetches the correct info in
                                 * great detail in its test.
                                 */
                                expect(result?.name?.items[0].text).toBe(testAudioItemName);
                            },
                        });
                    });
                });

                describe(`when the user is not in the ACL`, () => {
                    it(`should still return the audio item (role based access)`, async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(audioItemId),
                            seedInitialState: async () => {
                                await audioItemQueryRepository.create(
                                    buildTestInstance(EventSourcedAudioItemViewModel, {
                                        id: audioItemId,
                                        name: buildMultilingualTextWithSingleItem(
                                            testAudioItemName
                                        ),
                                        // empty
                                        accessControlList: new AccessControlList(),
                                        isPublished: false,
                                    })
                                );
                            },
                            expectedStatus: HttpStatusCode.ok,
                            checkResponseBody: async (
                                result: IDetailQueryResult<EventSourcedAudioItemViewModel>
                            ) => {
                                /**
                                 * We stick to a sanity check here. We test that
                                 * the repo writes \ fetches the correct info in
                                 * great detail in its test.
                                 */
                                expect(result?.name?.items[0].text).toBe(testAudioItemName);
                            },
                        });
                    });
                });
            });
        });

        describe(`when there is no audio item with the given ID`, () => {
            it(`should return not found`, async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(audioItemId),
                    seedInitialState: async () => {
                        // no terms were added
                        Promise.resolve();
                    },
                    expectedStatus: HttpStatusCode.notFound,
                });
            });
        });
    });

    describe(`when the user is a COSCRAD admin`, () => {
        const projectAdminUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.superAdmin],
        });

        const testUserWithGroups = new CoscradUserWithGroups(projectAdminUser, []);

        beforeAll(async () => {
            await setItUp(testUserWithGroups);
        });

        describe(`when there is an audio item with the given ID`, () => {
            describe(`when the audio item is public`, () => {
                it(`should return the audio item`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(audioItemId),
                        seedInitialState: async () => {
                            await audioItemQueryRepository.create(
                                buildTestInstance(EventSourcedAudioItemViewModel, {
                                    id: audioItemId,
                                    name: buildMultilingualTextWithSingleItem(testAudioItemName),
                                    accessControlList: new AccessControlList(),
                                    isPublished: true,
                                })
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                        checkResponseBody: async (
                            result: IDetailQueryResult<EventSourcedAudioItemViewModel>
                        ) => {
                            /**
                             * We stick to a sanity check here. We test that
                             * the repo writes \ fetches the correct info in
                             * great detail in its test.
                             */
                            expect(result?.name?.items[0].text).toBe(testAudioItemName);

                            /**
                             * We snapshot one and only one response here as a
                             * contract test. We do this in an admin test case
                             * so that command forms are captured on the
                             * response.
                             */
                            expect(result).toMatchSnapshot();
                        },
                    });
                });
            });

            describe(`when the audio item is not public`, () => {
                describe(`when the user is in the ACL`, () => {
                    it(`should return the audio item`, async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(audioItemId),
                            seedInitialState: async () => {
                                await audioItemQueryRepository.create(
                                    buildTestInstance(EventSourcedAudioItemViewModel, {
                                        id: audioItemId,
                                        name: buildMultilingualTextWithSingleItem(
                                            testAudioItemName
                                        ),
                                        accessControlList: new AccessControlList().allowUser(
                                            testUserWithGroups.id
                                        ),
                                        isPublished: false,
                                    })
                                );
                            },
                            expectedStatus: HttpStatusCode.ok,
                            checkResponseBody: async (
                                result: IDetailQueryResult<EventSourcedAudioItemViewModel>
                            ) => {
                                /**
                                 * We stick to a sanity check here. We test that
                                 * the repo writes \ fetches the correct info in
                                 * great detail in its test.
                                 */
                                expect(result?.name?.items[0].text).toBe(testAudioItemName);
                            },
                        });
                    });
                });

                describe(`when the user is not in the ACL`, () => {
                    it(`should still return the audio item (role based access)`, async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(audioItemId),
                            seedInitialState: async () => {
                                await audioItemQueryRepository.create(
                                    buildTestInstance(EventSourcedAudioItemViewModel, {
                                        id: audioItemId,
                                        name: buildMultilingualTextWithSingleItem(
                                            testAudioItemName
                                        ),
                                        // empty
                                        accessControlList: new AccessControlList(),
                                        isPublished: false,
                                    })
                                );
                            },
                            expectedStatus: HttpStatusCode.ok,
                            checkResponseBody: async (
                                result: IDetailQueryResult<EventSourcedAudioItemViewModel>
                            ) => {
                                /**
                                 * We stick to a sanity check here. We test that
                                 * the repo writes \ fetches the correct info in
                                 * great detail in its test.
                                 */
                                expect(result?.name?.items[0].text).toBe(testAudioItemName);
                            },
                        });
                    });
                });
            });
        });

        describe(`when there is no audio item with the given ID`, () => {
            it(`should return not found`, async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(audioItemId),
                    seedInitialState: async () => {
                        // no terms were added
                        Promise.resolve();
                    },
                    expectedStatus: HttpStatusCode.notFound,
                });
            });
        });
    });
});
