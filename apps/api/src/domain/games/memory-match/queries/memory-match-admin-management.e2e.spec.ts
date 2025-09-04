import { CoscradUserRole, HttpStatusCode, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { AdminJwtGuard } from '../../../../app/controllers/command/command.controller';
import { MockJwtAdminAuthGuard } from '../../../../authorization/mock-jwt-admin-auth-guard';
import { NotFound } from '../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { MediaItem } from '../../../models/media-item/entities/media-item.entity';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../models/user-management/user/entities/user/coscrad-user.entity';
import { MemoryMatchModule } from '../memory-match.module';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchRoundCreationDto } from '../models/dtos/memory-match-round-creation.dto';

const endpointUnderTest = '/games/memory-match';

const testMediaItemId = buildDummyUuid(123);

const testMediaItem = buildTestInstance(MediaItem, {
    id: testMediaItemId,
    mimeType: MIMEType.png,
});

const validCreationDto = buildTestInstance(MemoryMatchRoundCreationDto, {
    cardBackImageId: testMediaItemId,
});

describe(`when using the REST API to create a memory match round`, () => {
    let app: INestApplication;

    let memoryMatchRepository: IMemoryMatchRepository;

    const setItUp = async (user?: CoscradUserWithGroups) => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                MemoryMatchModule,
            ],
        })
            .overrideGuard(AdminJwtGuard)
            .useValue(new MockJwtAdminAuthGuard(user))
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    // is this necessary?
                    BASE_URL: 'http://localhost',
                    NODE_PORT: 1234,
                    GLOBAL_PREFIX: 'awesome-api',
                })
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        memoryMatchRepository = app.get(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN);
    };

    beforeEach(async () => {
        const databaseProvider = app.get(ArangoDatabaseProvider);

        await databaseProvider.getDatabaseForCollection('memory_match_rounds').clear();

        await databaseProvider.getDatabaseForCollection(ArangoCollectionId.media_items).clear();

        await databaseProvider
            .getDatabaseForCollection(ArangoCollectionId.media_items)
            .create(mapEntityDTOToDatabaseDocument(testMediaItem.toDTO()));
    });

    describe(`when the user is a COSCRAD admin`, () => {
        const coscradAdminUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.superAdmin],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(coscradAdminUser, []));
        });

        describe(`when creating a memory match round`, () => {
            describe(`when the memory round is valid`, () => {
                // TODO test all allowed MIME Types
                describe(`when a card back image is provided`, () => {
                    it(`should create the round`, async () => {
                        const res = await request(app.getHttpServer())
                            .post(endpointUnderTest)
                            .send(validCreationDto);

                        expect(res.status).toBe(HttpStatusCode.createdResource);

                        const { id } = res.body;

                        // TODO test like this once we support privileged admin queries
                        // const updatedMemoryRound = (
                        //     await request(app.getHttpServer()).get(`${endpointUnderTest}/${id}`)
                        // ).body;

                        const updatedMemoryRound = memoryMatchRepository.fetchById(id);

                        expect(updatedMemoryRound).not.toBe(NotFound);
                    });
                });

                describe(`when a card back image is omitted`, () => {
                    it(`should create the round`, async () => {
                        const res = await request(app.getHttpServer())
                            .post(endpointUnderTest)
                            .send(
                                clonePlainObjectWithOverrides(validCreationDto, {
                                    cardBackImageId: undefined,
                                })
                            );

                        expect(res.status).toBe(HttpStatusCode.createdResource);

                        const { id } = res.body;

                        // TODO test like this once we support privileged admin queries
                        // const updatedMemoryRound = (
                        //     await request(app.getHttpServer()).get(`${endpointUnderTest}/${id}`)
                        // ).body;

                        const updatedMemoryRound = memoryMatchRepository.fetchById(id);

                        expect(updatedMemoryRound).not.toBe(NotFound);
                    });
                });
            });

            describe(`when the memory round is invalid`, () => {
                describe(`when there is already a memory round with the same name`, () => {
                    const repeatedName = 'Trite Round';

                    it(`should fail with the expected error`, async () => {
                        await request(app.getHttpServer())
                            .post(endpointUnderTest)
                            .send(
                                buildTestInstance(MemoryMatchRoundCreationDto, {
                                    name: repeatedName,
                                    cardBackImageId: undefined,
                                })
                            );

                        const res = await request(app.getHttpServer())
                            .post(endpointUnderTest)
                            .send(
                                buildTestInstance(MemoryMatchRoundCreationDto, {
                                    name: repeatedName,
                                    cardBackImageId: undefined,
                                })
                            );

                        expect(res.status).toBe(HttpStatusCode.badRequest);

                        const { message } = res.body;

                        expect(message).toContain(
                            `Duplicate names for memory match rounds are not permitted`
                        );

                        expect(message).toContain(repeatedName);
                    });
                });

                describe(`when the memory match round is ill-formed`, () => {
                    describe(`when the name is an empty string`, () => {
                        it(`should return the expected error`, async () => {
                            const invalidDto = buildTestInstance(MemoryMatchRoundCreationDto, {
                                name: '',
                            });

                            const res = await request(app.getHttpServer())
                                .post(endpointUnderTest)
                                .send(invalidDto);

                            expect(res.status).toBe(HttpStatusCode.badRequest);

                            const { message } = res.body;

                            // TODO make the error messages more human readable
                            expect(message).toContain('Property name has failed');
                        });
                    });

                    describe(`when the language code for the name is invalid`, () => {
                        it(`should return the expected error`, async () => {
                            const invalidDto = buildTestInstance(MemoryMatchRoundCreationDto, {
                                languageCodeForName: 'EnGLIZH' as LanguageCode,
                            });

                            const res = await request(app.getHttpServer())
                                .post(endpointUnderTest)
                                .send(invalidDto);

                            expect(res.status).toBe(HttpStatusCode.badRequest);

                            const { message } = res.body;

                            expect(message).toContain('Property languageCode');
                        });
                    });

                    describe(`when the description is an empty string`, () => {
                        it(`should return the expected error`, async () => {
                            const invalidDto = buildTestInstance(MemoryMatchRoundCreationDto, {
                                description: '',
                            });

                            const res = await request(app.getHttpServer())
                                .post(endpointUnderTest)
                                .send(invalidDto);

                            expect(res.status).toBe(HttpStatusCode.badRequest);

                            const { message } = res.body;

                            // TODO make the error messages more human readable
                            expect(message).toContain('Property description has failed');
                        });
                    });

                    describe(`when the language code for the description is invalid`, () => {
                        it(`should return the expected error`, async () => {
                            const invalidDto = buildTestInstance(MemoryMatchRoundCreationDto, {
                                languageCodeForDescription: 'EnGLIZH' as LanguageCode,
                            });

                            const res = await request(app.getHttpServer())
                                .post(endpointUnderTest)
                                .send(invalidDto);

                            expect(res.status).toBe(HttpStatusCode.badRequest);

                            const { message } = res.body;

                            expect(message).toContain('Property languageCode');
                        });
                    });

                    describe(`fuzz test`, () => {
                        // TODO Fuzz test
                        it.todo(`should have a test`);
                    });
                });

                describe(`when the media item for the card back image does not exist`, () => {
                    const bogusMediaItemId = buildDummyUuid(404);

                    it(`should return the expected error`, async () => {
                        const res = await request(app.getHttpServer())
                            .post(endpointUnderTest)
                            .send(
                                buildTestInstance(MemoryMatchRoundCreationDto, {
                                    cardBackImageId: bogusMediaItemId,
                                })
                            );

                        expect(res.status).toBe(HttpStatusCode.badRequest);

                        const { message } = res.body;

                        expect(message).toContain(`mediaItem/${bogusMediaItemId}`);
                    });
                });

                describe(`when the media item for the card back image has the wrong MIME type`, () => {
                    const audioMediaItemId = buildDummyUuid(272);

                    const invalidMediaItem = buildTestInstance(MediaItem, {
                        id: audioMediaItemId,
                        mimeType: MIMEType.wav,
                    });

                    beforeEach(async () => {
                        await app
                            .get(ArangoDatabaseProvider)
                            .getDatabaseForCollection(ArangoCollectionId.media_items)
                            .create(mapEntityDTOToDatabaseDocument(invalidMediaItem.toDTO()));
                    });

                    it(`should return the expected error`, async () => {
                        const res = await request(app.getHttpServer())
                            .post(endpointUnderTest)
                            .send(
                                buildTestInstance(MemoryMatchRoundCreationDto, {
                                    cardBackImageId: invalidMediaItem.id,
                                })
                            );

                        expect(res.status).toBe(HttpStatusCode.badRequest);

                        const { message } = res.body;

                        expect(message).toContain(invalidMediaItem.mimeType);

                        expect(message).toContain('must be an image');
                    });
                });
            });
        });
    });

    describe(`when the user is a project admin`, () => {
        const projectAdminUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.projectAdmin],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(projectAdminUser, []));
        });

        describe(`when the request is valid`, () => {
            it(`should succeed`, async () => {
                const res = await request(app.getHttpServer())
                    .post(endpointUnderTest)
                    .send(validCreationDto);

                expect(res.status).toBe(HttpStatusCode.createdResource);
            });
        });
    });

    describe(`when the user is unauthenticated (public)`, () => {
        beforeAll(async () => {
            // no user here
            await setItUp();
        });

        describe(`POST ${endpointUnderTest}`, () => {
            it(`should return forbidden`, async () => {
                const res = await request(app.getHttpServer())
                    .post(endpointUnderTest)
                    .send(validCreationDto);

                expect(res.status).toBe(HttpStatusCode.forbidden);
            });
        });
    });

    describe(`when the user is an ordinary user (non-admin)`, () => {
        const ordinaryUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.viewer],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(ordinaryUser, []));
        });

        describe(`POST ${endpointUnderTest}`, () => {
            it(`should return forbidden`, async () => {
                const res = await request(app.getHttpServer())
                    .post(endpointUnderTest)
                    .send(validCreationDto);

                expect(res.status).toBe(HttpStatusCode.forbidden);
            });
        });
    });
});
