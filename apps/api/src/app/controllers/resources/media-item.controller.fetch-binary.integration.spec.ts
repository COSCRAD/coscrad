import { AggregateType, CoscradUserRole, MIMEType, ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import * as request from 'supertest';
import { AuthorizationModule } from '../../../authorization/authorization.module';
import { MockJwtAdminAuthGuard } from '../../../authorization/mock-jwt-admin-auth-guard';
import { MockJwtAuthGuard } from '../../../authorization/mock-jwt-auth-guard';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { CoscradEventFactory } from '../../../domain/common';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { getExtensionForMimeType } from '../../../domain/models/media-item/entities/get-extension-for-mime-type';
import { MediaItem } from '../../../domain/models/media-item/entities/media-item.entity';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { DeluxeInMemoryStore } from '../../../domain/types/DeluxeInMemoryStore';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../persistence/persistence.module';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DynamicDataTypeFinderService } from '../../../validation';
import buildMockConfigService from '../../config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import { HttpStatusCode } from '../../constants/httpStatusCodes';
import { MediaItemModule } from '../../domain-modules/media-item.module';
import { AdminJwtGuard } from '../command/command.controller';

const baseUrl = `/resources/mediaItems/download`;

const dummyMediaItemId = buildDummyUuid(135);

const testBinaryDataDirectoryPath = `__cli-command-test-inputs__/ingest-media-items/mediaItemsOnly`;

const testPngFilePath = `${testBinaryDataDirectoryPath}/station.png`;

// TODO make this directory name configurable
const staticAssetsDir = `__static__`;

const targetFilePath = `${staticAssetsDir}/${dummyMediaItemId}.png`;

const dummyUserId = buildDummyUuid(1);

const existingMediaItem = getValidAggregateInstanceForTest(AggregateType.mediaItem).clone({
    id: dummyMediaItemId,
});

describe(`MediaItemController.fetchBinary`, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    const dummyUser = getValidAggregateInstanceForTest(AggregateType.user).clone({
        id: dummyUserId,
        authProviderUserId: `autho|${dummyUserId}`,
    });

    type TestCase = {
        user: CoscradUser;
        userDescription: string;
        mediaItem: MediaItem;
        mediaItemDescription: string;
        assertExpectedResponse: (response: any, mediaItem: MediaItem) => void;
    };

    const publicUser = undefined;

    const nonAdminUser = dummyUser.clone({
        roles: [CoscradUserRole.viewer],
    });

    const projectAdmin = dummyUser.clone({
        roles: [CoscradUserRole.projectAdmin],
    });

    const coscradAdmin = dummyUser.clone({
        roles: [CoscradUserRole.superAdmin],
    });

    const usersAndDescriptions = [
        [publicUser, 'publicUser'],
        [nonAdminUser, 'authenticated, non-admin'],
        [projectAdmin, 'authenticated, project admin'],
        [coscradAdmin, 'authenticated, COSCRAD'],
    ] as const;

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

    const assertResponseWithMediaItem = (res, mediaItem: MediaItem) => {
        expect(res.status).toBe(HttpStatusCode.ok);

        const disposition = res.header['content-disposition'];

        expect(disposition).toBe(
            // TODO just specify this on the test case manually- we're copying implementation logic here
            /**
             * The linter is confused because this escape character applies at
             * the level of HTTP responses to be interpreted by the browser. A pair of
             * `\"`s are is necessary in the result.
             */
            // eslint-disable-next-line no-useless-escape
            `attachment; filename=\"${
                mediaItem.getName().getOriginalTextItem().text
                // eslint-disable-next-line no-useless-escape
            }.${getExtensionForMimeType(mediaItem.mimeType)}\"`
        );
    };

    const assertNotFoundResponse = (res) => {
        expect(res.status).toBe(HttpStatusCode.notFound);
    };

    const publicTestCases: TestCase[] = usersAndDescriptions.map(([user, userDescription]) => ({
        user,
        userDescription,
        mediaItem: publicMediaItem,
        mediaItemDescription: 'public media item',
        assertExpectedResponse: assertResponseWithMediaItem,
    }));

    const privilegedAccessTestCases: TestCase[] = [
        {
            user: projectAdmin,
            // TODO make this the username
            userDescription: 'project admin',
            mediaItem: privateMediaItem,
            mediaItemDescription: 'private media item',
            assertExpectedResponse: assertResponseWithMediaItem,
        },
        {
            user: coscradAdmin,
            // TODO make this the username
            userDescription: 'coscrad admin',
            mediaItem: privateMediaItem,
            mediaItemDescription: 'private media item',
            assertExpectedResponse: assertResponseWithMediaItem,
        },
        {
            user: nonAdminUser,
            userDescription: 'non-admin user',
            mediaItem: privateMediaItem.clone({
                queryAccessControlList: {
                    allowedUserIds: [nonAdminUser.id],
                    allowedGroupIds: [],
                },
            }),
            mediaItemDescription: 'private media item with user in the ACL',
            assertExpectedResponse: assertResponseWithMediaItem,
        },
    ];

    const forbiddenTestCases: TestCase[] = [
        {
            user: publicUser,
            userDescription: 'unauthenticated user',
            mediaItem: privateMediaItem,
            mediaItemDescription: 'private media item',
            // we return a not found in this case for obscurity
            assertExpectedResponse: assertNotFoundResponse,
        },
        {
            user: nonAdminUser,
            userDescription: 'authenticated non-admin user',
            mediaItem: privateMediaItem,
            mediaItemDescription: 'private media item (user not in ACL)',
            // we return a not found in this case for obscurity
            assertExpectedResponse: assertNotFoundResponse,
        },
    ];

    [...publicTestCases, ...privilegedAccessTestCases, ...forbiddenTestCases].forEach(
        ({ user, userDescription, mediaItem, mediaItemDescription, assertExpectedResponse }) => {
            const testUserWithGroups = user && new CoscradUserWithGroups(user, []);

            describe(`when the user is a: ${userDescription}`, () => {
                beforeAll(async () => {
                    const mockConfigService = buildMockConfigService(
                        {
                            ARANGO_DB_NAME: 'testingdb_ap', // generateDatabaseNameForTestSuite(),
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

                    if (!existsSync(targetFilePath)) copyFileSync(testPngFilePath, targetFilePath);
                });

                describe(`when the media item is: ${mediaItemDescription}`, () => {
                    beforeEach(async () => {
                        await testRepositoryProvider.testTeardown();

                        await testRepositoryProvider
                            .forResource(ResourceType.mediaItem)
                            .create(mediaItem);

                        if (!isNullOrUndefined(user))
                            await testRepositoryProvider.addFullSnapshot(
                                new DeluxeInMemoryStore({
                                    [AggregateType.user]: [user],
                                }).fetchFullSnapshotInLegacyFormat()
                            );
                    });

                    it(`should succeed`, async () => {
                        const fullUrl = `${baseUrl}/${dummyMediaItemId}`;

                        const res = await request(app.getHttpServer()).get(fullUrl);

                        assertExpectedResponse(res, mediaItem);
                    });
                });
            });
        }
    );
});
