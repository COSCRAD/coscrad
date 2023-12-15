import { AggregateType, MIMEType, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { copyFileSync, existsSync } from 'fs';
import * as request from 'supertest';
import { CoscradEventFactory } from '../../../../src/domain/common';
import { ArangoDatabaseProvider } from '../../../../src/persistence/database/database.provider';
import { DynamicDataTypeFinderService } from '../../../../src/validation';
import { AuthorizationModule } from '../../../authorization/authorization.module';
import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { PersistenceModule } from '../../../persistence/persistence.module';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildMockConfigService from '../../config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import { HttpStatusCode } from '../../constants/httpStatusCodes';
import { MediaItemModule } from '../../domain-modules/media-item.module';

const baseUrl = `/resources/mediaItems/download`;

const dummyMediaItemId = `135`; //buildDummyUuid(135);

const testBinaryDataDirectoryPath = `__cli-command-test-inputs__/ingest-media-items/mediaItemsOnly`;

const testPngFilePath = `${testBinaryDataDirectoryPath}/autumn.png`;

const targetFilePath = `__static__/${dummyMediaItemId}.png`;

const existingMediaItem = getValidAggregateInstanceForTest(AggregateType.mediaItem).clone({
    id: dummyMediaItemId,
});

describe(`MediaItemController.fetchBinary`, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

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

        if (!existsSync(targetFilePath)) copyFileSync(testPngFilePath, targetFilePath);
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`when the asset is publicly available`, () => {
        beforeEach(async () => {
            await testRepositoryProvider.forResource(ResourceType.mediaItem).create(
                existingMediaItem.clone({
                    published: true,
                    title: dummyMediaItemId,
                    mimeType: MIMEType.png,
                })
            );
        });

        it(`should succeed`, async () => {
            const fullUrl = `${baseUrl}/${dummyMediaItemId}`;

            const res = await request(app.getHttpServer()).get(fullUrl);

            expect(res.status).toBe(HttpStatusCode.ok);
        });
    });
});
