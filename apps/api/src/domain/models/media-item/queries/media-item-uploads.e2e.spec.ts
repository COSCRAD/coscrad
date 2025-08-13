import { AggregateType, CoscradUserRole } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { existsSync, mkdirSync } from 'fs';
import * as request from 'supertest';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { HttpStatusCode } from '../../../../app/constants/httpStatusCodes';
import { AdminJwtGuard } from '../../../../app/controllers/command/command.controller';
import { MockJwtAdminAuthGuard } from '../../../../authorization/mock-jwt-admin-auth-guard';
import { MockJwtAuthGuard } from '../../../../authorization/mock-jwt-auth-guard';
import { OptionalJwtAuthGuard } from '../../../../authorization/optional-jwt-auth-guard';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DynamicDataTypeModule } from '../../../../validation';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CoscradUserGroup } from '../../user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import { MediaItemModule } from '../media-item.module';

const mediaItemUploadEndpoint = `/resources/mediaItems/upload`;

const inputDir = `__cli-command-test-inputs__/ingest-media-items/mediaItemsOnly`;

const testFileName = `station`;

const extension = 'png';

const mimeType = 'image/png';

const validPngFilePath = `${inputDir}/${testFileName}.${extension}`;
('/node_modules/(?!(foo|bar)/)');
const largeTestFile = 'trees-reflect-into-the-lake.mp4'; // roughly 5 MB in size

const testMaxFileUploadSizeMb = 4;

const testMaxNumberOfFileAttachments = 10;

const largeTestFilePath = `${inputDir}/${largeTestFile}`;

const pngFileWithWavExtension = 'i-am-actually-a-png.wav';

// TODO add a case with an invalid extension `.xxx`

const pngWithWavExtensionFilepath = `${inputDir}/${pngFileWithWavExtension}`;

const pngWithXxxExtensionFilepath = `${inputDir}/i-am-actually-a-png.xxx`;

const staticAssetDestinationDirectory = '__static__';

const userId = buildDummyUuid(117);

const groupId = buildDummyUuid(118);

const dummyUser = new CoscradUser({
    type: AggregateType.user,
    id: userId,
    username: 'Blake',
    authProviderUserId: `auth0|${userId}`,
    roles: [CoscradUserRole.viewer],
});

const userGroup = new CoscradUserGroup({
    type: AggregateType.userGroup,
    id: groupId,
    userIds: [userId],
    label: 'developers',
    description: 'this group is for software developers',
});

describe(`File Upload (/upload)`, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();

        // TODO be sure any created media files are removed
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when the user is authenticated`, () => {
        describe(`when the user is a COSCRAD admin`, () => {
            beforeAll(async () => {
                const testUserWithGroups = new CoscradUserWithGroups(dummyUser, [userGroup]);

                const mockConfigService = buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    MAX_FILE_UPLOAD_SIZE_MB: testMaxFileUploadSizeMb,
                    MAX_FILE_UPLOAD_COUNT: testMaxNumberOfFileAttachments,
                });

                const testModule = await Test.createTestingModule({
                    imports: [
                        ConfigModule.forRoot({
                            isGlobal: true,
                            envFilePath: buildConfigFilePath(Environment.test),
                            cache: false,
                        }),
                        MediaItemModule,
                        DynamicDataTypeModule,
                    ],
                    providers: [TestRepositoryProvider],
                })
                    .overrideProvider(ConfigService)
                    .useValue(mockConfigService)
                    .overrideGuard(OptionalJwtAuthGuard)
                    .useValue(new MockJwtAuthGuard(testUserWithGroups, true))
                    .overrideGuard(AdminJwtGuard)
                    .useValue(new MockJwtAdminAuthGuard(testUserWithGroups))
                    .compile();

                if (!existsSync(staticAssetDestinationDirectory)) {
                    mkdirSync(staticAssetDestinationDirectory);
                }

                app = testModule.createNestApplication();

                await app.init();

                databaseProvider = app.get(ArangoDatabaseProvider);

                testRepositoryProvider = app.get(TestRepositoryProvider);
            });

            describe(`when the uploaded file is valid`, () => {
                describe(`when uploading a single file`, () => {
                    // TODO one test case for each allowed MIME Type
                    describe(`when the uploaded file is a png`, () => {
                        it(`should return the expected response and status code (201)`, async () => {
                            if (!existsSync(validPngFilePath)) {
                                throw new InternalError(`Test media file not present in fixtures`);
                            }

                            const res = await request(app.getHttpServer())
                                .post(mediaItemUploadEndpoint)
                                .attach(testFileName, validPngFilePath);

                            expect(res.status).toBe(HttpStatusCode.createdResource);

                            const uploadedFileInfo = res.body.uploadedMediaFiles[0];

                            expect(uploadedFileInfo.uploadedFilename).toEqual(testFileName);

                            expect(uploadedFileInfo.mimeType).toEqual(mimeType);

                            const fileUploadedInSystem = `${staticAssetDestinationDirectory}/${uploadedFileInfo.systemFilename}`;

                            const result = existsSync(fileUploadedInSystem);

                            /**
                             * TODO We should upload the file to its destination.
                             * For now, we are not persisting the file. The goal
                             * is to solidify the contract with the client first.
                             */
                            expect(result).toBe(false);
                        });
                    });
                });

                describe(`when uploading multiple files`, () => {
                    it(`should upload all files`, async () => {
                        if (!existsSync(validPngFilePath)) {
                            throw new InternalError(`Test media file not present in fixtures`);
                        }

                        const res = await request(app.getHttpServer())
                            .post(mediaItemUploadEndpoint)
                            .attach(testFileName, validPngFilePath)
                            .attach('anotherFileValuedFieldOnMultipartForm', validPngFilePath);

                        expect(res.status).toBe(HttpStatusCode.createdResource);

                        expect(res.body.uploadedMediaFiles).toHaveLength(2);
                    });
                });
            });

            describe(`when one of the uploaded file(s) is invalid`, () => {
                describe(`when too many files are uploaded at once`, () => {
                    it(`should send the expected error response`, async () => {
                        // The max number of allowed attachments is configured as 10 above
                        // TODO can we attach many or attach these in a loop?
                        const res = await request(app.getHttpServer())
                            .post(mediaItemUploadEndpoint)
                            .attach('f1', validPngFilePath)
                            .attach('f2', validPngFilePath)
                            .attach('f3', validPngFilePath)
                            .attach('f4', validPngFilePath)
                            .attach('f5', validPngFilePath)
                            .attach('f6', validPngFilePath)
                            .attach('f7', validPngFilePath)
                            .attach('f8', validPngFilePath)
                            .attach('f9', validPngFilePath)
                            .attach('f10', validPngFilePath)
                            .attach('f11', validPngFilePath);

                        expect(res.status).toBe(HttpStatusCode.badRequest);

                        expect(res.body.message).toContain('Too many files');
                    });
                });

                describe(`when a file exceeds the upload size limit`, () => {
                    it(`should return a 400 and the upload should fail`, async () => {
                        if (!existsSync(largeTestFilePath)) {
                            throw new InternalError(`Test file not present in fixtures`);
                        }

                        const res = await request(app.getHttpServer())
                            .post(mediaItemUploadEndpoint)
                            .attach(largeTestFile, largeTestFilePath);

                        expect(res.status).toBe(HttpStatusCode.contentTooLarge);

                        // TODO ensure the file is not persisted
                    });
                });

                describe(`when the MIME Type is inconsistent with the extension`, () => {
                    // TODO use `file-type` to validate the content from the magic numbers

                    it.skip(`should return the expected error response without persisting the file`, async () => {
                        if (!existsSync(pngWithWavExtensionFilepath)) {
                            throw new InternalError(
                                `Test media file: ${pngWithWavExtensionFilepath} not present in fixtures`
                            );
                        }

                        const res = await request(app.getHttpServer())
                            .post(mediaItemUploadEndpoint)
                            .attach(pngFileWithWavExtension, pngWithWavExtensionFilepath);

                        expect(res.status).toBe(HttpStatusCode.badRequest);

                        // TODO ensure the file is not persisted
                    });
                });

                describe(`when the extension is not valid`, () => {
                    it(`should return the expected error response without persisting the file`, async () => {
                        if (!existsSync(pngWithXxxExtensionFilepath)) {
                            throw new InternalError(
                                `Test media file: ${pngWithXxxExtensionFilepath} not present in fixtures`
                            );
                        }

                        const res = await request(app.getHttpServer())
                            .post(mediaItemUploadEndpoint)
                            .attach('bad-file', pngWithXxxExtensionFilepath);

                        expect(res.status).toBe(HttpStatusCode.badRequest);

                        // TODO ensure the file is not persisted
                    });
                });

                describe(`when the MIME Type is not supported by COSCRAD`, () => {
                    it(`should return the expected error response`, async () => {
                        const res = await request(app.getHttpServer())
                            .post(mediaItemUploadEndpoint)
                            .attach('readme', 'README.md');

                        expect(res.status).toBe(HttpStatusCode.badRequest);

                        expect(res.body.message).toContain(' MIME Type is not allowed');
                    });
                });
            });
        });
    });
});
