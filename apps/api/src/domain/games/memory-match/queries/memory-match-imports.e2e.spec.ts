import { CoscradUserRole, HttpStatusCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { AdminJwtGuard } from '../../../../app/controllers/command/command.controller';
import { MockJwtAdminAuthGuard } from '../../../../authorization/mock-jwt-admin-auth-guard';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../models/user-management/user/entities/user/coscrad-user.entity';
import { MemoryMatchModule } from '../memory-match.module';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchCardImportDto } from '../models/dtos/memory-match-card-import.dto';
import { MemoryMatchRoundImportDto } from '../models/dtos/memory-match-round-import.dto';
import supertest = require('supertest');

const endpointUnderTest = '/games/memory-match/import';

const validCardDtos = Array(12)
    .fill(null)
    .map((_, index) =>
        buildTestInstance(MemoryMatchCardImportDto, {
            text: `card #${index + 1}`,
        })
    );

const validDto = buildTestInstance(MemoryMatchRoundImportDto, {
    cards: validCardDtos,
});

describe(endpointUnderTest, () => {
    let app: INestApplication;

    let _memoryMatchRepository: IMemoryMatchRepository;

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

        _memoryMatchRepository = app.get(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN);
    };

    beforeEach(async () => {
        const databaseProvider = app.get(ArangoDatabaseProvider);

        await databaseProvider.getDatabaseForCollection('memory_match_rounds').clear();

        await databaseProvider.getDatabaseForCollection(ArangoCollectionId.media_items).clear();
    });

    describe(`when the user is a COSCRAD admin`, () => {
        beforeAll(async () => {
            const testUser = buildTestInstance(CoscradUser, {
                roles: [CoscradUserRole.superAdmin],
            });

            await setItUp(new CoscradUserWithGroups(testUser, []));
        });

        describe(`when the imported round is valid`, () => {
            it(`should return ok and persist the imported round`, async () => {
                // TODO add test for when a request body is not provided
                const res = await supertest(app.getHttpServer())
                    .post(endpointUnderTest)
                    .send(validDto);

                expect(res.status).toBe(HttpStatusCode.createdResource);
            });
        });
    });
});
