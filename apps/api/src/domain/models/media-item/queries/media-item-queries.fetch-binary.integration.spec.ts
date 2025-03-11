import { AggregateType, CoscradUserRole, MIMEType, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { HttpStatusCode } from '../../../../app/constants/httpStatusCodes';
import { AdminJwtGuard } from '../../../../app/controllers/command/command.controller';
import { AuthorizationModule } from '../../../../authorization/authorization.module';
import { MockJwtAdminAuthGuard } from '../../../../authorization/mock-jwt-admin-auth-guard';
import { MockJwtAuthGuard } from '../../../../authorization/mock-jwt-auth-guard';
import { OptionalJwtAuthGuard } from '../../../../authorization/optional-jwt-auth-guard';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DynamicDataTypeFinderService } from '../../../../validation';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { CoscradEventFactory } from '../../../common';
import { AggregateId } from '../../../types/AggregateId';
import { assertQueryResult } from '../../__tests__';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { MediaItemModule } from '../media-item.module';

// Be careful to include /download in query service responses!
const baseUrl = `/resources/mediaItems/download`;

const buildDetailEndpoint = (id: AggregateId) => `${baseUrl}/${id}`;

const dummyMediaItemId = buildDummyUuid(135);

const testBinaryDataDirectoryPath = `__cli-command-test-inputs__/ingest-media-items/mediaItemsOnly`;

const testPngFilePath = `${testBinaryDataDirectoryPath}/station.png`;

// TODO make this directory name configurable
const staticAssetsDir = `__static__`;

const dummyUserId = buildDummyUuid(1);

const existingMediaItem = getValidAggregateInstanceForTest(AggregateType.mediaItem).clone({
    id: dummyMediaItemId,
});

describe(`MediaItemController.fetchBinary`, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    const setItUp = async (testUserWithGroups: CoscradUserWithGroups, testFilePath: string) => {
        const mockConfigService = buildMockConfigService(
            {
                // TODO can we fix this?
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                GLOBAL_PREFIX: '',
            },
            buildConfigFilePath(Environment.test)
        );

        const testModuleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(process.env.NODE_ENV),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                AuthorizationModule,
                MediaItemModule,
            ],
        })
            .overrideGuard(OptionalJwtAuthGuard)
            .useValue(new MockJwtAuthGuard(testUserWithGroups, true))
            .overrideGuard(AdminJwtGuard)
            .useValue(new MockJwtAdminAuthGuard(testUserWithGroups))
            .overrideProvider(ConfigService)
            .useValue(mockConfigService)
            .compile();

        app = testModuleRef.createNestApplication();

        await app.init();

        testRepositoryProvider = new TestRepositoryProvider(
            app.get(ArangoDatabaseProvider),
            app.get(CoscradEventFactory),
            app.get(DynamicDataTypeFinderService)
        );

        if (!existsSync(staticAssetsDir)) mkdirSync(staticAssetsDir);

        const targetFilePath = `${staticAssetsDir}/${dummyMediaItemId}.png`;

        if (!existsSync(targetFilePath)) copyFileSync(testFilePath, targetFilePath);
    };

    const dummyUser = getValidAggregateInstanceForTest(AggregateType.user).clone({
        id: dummyUserId,
        authProviderUserId: `autho|${dummyUserId}`,
    });

    const nonAdminUser = dummyUser.clone({
        roles: [CoscradUserRole.viewer],
    });

    const projectAdmin = dummyUser.clone({
        roles: [CoscradUserRole.projectAdmin],
    });

    const coscradAdmin = dummyUser.clone({
        roles: [CoscradUserRole.superAdmin],
    });

    const publicMediaItem = existingMediaItem.clone({
        published: true,
        title: dummyMediaItemId,
        mimeType: MIMEType.png,
        lengthMilliseconds: undefined,
        queryAccessControlList: {
            allowedGroupIds: [],
            allowedUserIds: [],
        },
    });

    const privateMediaItem = publicMediaItem.clone({
        published: false,
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    describe(`when the user is not-authenticated (public queries)`, () => {
        beforeAll(async () => {
            await setItUp(undefined, testPngFilePath);
        });

        describe(`when the media item is public`, () => {
            it(`should return the correct result`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.mediaItem)
                            .create(publicMediaItem);

                        // no user is created here
                    },
                    endpoint: buildDetailEndpoint(publicMediaItem.id),
                    expectedStatus: HttpStatusCode.ok,
                    // checkHeaders TODO check content disposition
                    checkResponseBody: async (body) => {
                        expect(body).toMatchSnapshot();
                    },
                });
            });
        });

        describe(`when the media item is not public`, () => {
            it(`should return not found`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.mediaItem)
                            .create(privateMediaItem);

                        // no user is created here as this is a public request
                    },
                    endpoint: buildDetailEndpoint(privateMediaItem.id),
                    expectedStatus: HttpStatusCode.notFound,
                });
            });
        });
    });

    describe(`when the user is authenticated as a viewer`, () => {
        beforeAll(async () => {
            // TODO test support for user groups

            await setItUp(new CoscradUserWithGroups(nonAdminUser, []), testPngFilePath);
        });

        describe(`when the media item is public`, () => {
            it(`should return the correct result`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.mediaItem)
                            .create(publicMediaItem);

                        await testRepositoryProvider.getUserRepository().create(nonAdminUser);
                    },
                    endpoint: buildDetailEndpoint(publicMediaItem.id),
                    expectedStatus: HttpStatusCode.ok,
                    // checkResponseBody:
                });
            });
        });

        describe(`when the media item is not published`, () => {
            describe(`when the user does not have query ACL read permissions`, () => {
                it(`should return not found`, async () => {
                    await assertQueryResult({
                        app,
                        seedInitialState: async () => {
                            await testRepositoryProvider
                                .forResource(ResourceType.mediaItem)
                                .create(privateMediaItem);

                            await testRepositoryProvider.getUserRepository().create(nonAdminUser);
                        },
                        endpoint: buildDetailEndpoint(privateMediaItem.id),
                        expectedStatus: HttpStatusCode.notFound,
                        // checkResponseBody:
                    });
                });
            });

            describe(`when the user has query ACL read permissions`, () => {
                it(`should return the expected result`, async () => {
                    const privateMediaItemUserCanAccess = privateMediaItem.clone({
                        queryAccessControlList: new AccessControlList().allowUser(nonAdminUser.id),
                    });

                    await assertQueryResult({
                        app,
                        seedInitialState: async () => {
                            await testRepositoryProvider
                                .forResource(ResourceType.mediaItem)
                                .create(privateMediaItemUserCanAccess);

                            await testRepositoryProvider.getUserRepository().create(nonAdminUser);
                        },
                        endpoint: buildDetailEndpoint(privateMediaItemUserCanAccess.id),
                        expectedStatus: HttpStatusCode.ok,
                    });
                });
            });
        });
    });

    describe(`when the user is authenticated as a coscrad admin`, () => {
        beforeAll(async () => {
            // TODO test support for user groups

            await setItUp(new CoscradUserWithGroups(coscradAdmin, []), testPngFilePath);
        });
        describe(`when the media item is public`, () => {
            it(`should return the expected result`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.mediaItem)
                            .create(publicMediaItem);

                        await testRepositoryProvider.getUserRepository().create(coscradAdmin);
                    },
                    endpoint: buildDetailEndpoint(publicMediaItem.id),
                    expectedStatus: HttpStatusCode.ok,
                });
            });
        });

        describe(`when the media item is not published`, () => {
            it(`should still return the media item (admin have full access)`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.mediaItem)
                            .create(privateMediaItem);

                        await testRepositoryProvider.getUserRepository().create(coscradAdmin);
                    },
                    endpoint: buildDetailEndpoint(publicMediaItem.id),
                    expectedStatus: HttpStatusCode.ok,
                });
            });
        });
    });

    describe(`when the user is authenticated as a project admin`, () => {
        beforeAll(async () => {
            // TODO test support for user groups

            await setItUp(new CoscradUserWithGroups(projectAdmin, []), testPngFilePath);
        });
        describe(`when the media item is public`, () => {
            it(`should return the expected result`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.mediaItem)
                            .create(publicMediaItem);

                        await testRepositoryProvider.getUserRepository().create(projectAdmin);
                    },
                    endpoint: buildDetailEndpoint(publicMediaItem.id),
                    expectedStatus: HttpStatusCode.ok,
                });
            });
        });

        describe(`when the media item is not published`, () => {
            it(`should still return the media item (admin have full access)`, async () => {
                await assertQueryResult({
                    app,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.mediaItem)
                            .create(privateMediaItem);

                        await testRepositoryProvider.getUserRepository().create(coscradAdmin);
                    },
                    endpoint: buildDetailEndpoint(publicMediaItem.id),
                    expectedStatus: HttpStatusCode.ok,
                });
            });
        });
    });

    describe(`when the media item is an audio or video item`, () => {
        it.todo(`should return a content-disposition of inline`);
    });
});
