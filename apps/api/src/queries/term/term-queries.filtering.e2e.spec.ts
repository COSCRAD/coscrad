/**
 * Note that we do not test the interaction of filtering with user access.
 * As such, this test uses public resources throughout.
 */

import { HttpStatusCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { TermModule } from '../../app/domain-modules/term.module';
import { MockJwtAuthGuard } from '../../authorization/mock-jwt-auth-guard';
import { OptionalJwtAuthGuard } from '../../authorization/optional-jwt-auth-guard';
import { buildMultilingualTextWithSingleItem } from '../../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    ITermQueryRepository,
    TERM_QUERY_REPOSITORY_TOKEN,
} from '../../domain/models/term/queries';
import {
    CoscradBooleanOperator,
    CoscradConditionBlockType,
    CoscradSimpleCondition,
} from '../../lib/coscrad-query-language/models/coscrad-filter-condition';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import { PersistenceModule } from '../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../test-data/utilities';
import { TermViewModel } from '../buildViewModelForResource/viewModels/term.view-model';

const searchTermsWithNoSpecialChar = 'aba';

const termWhoseEnglishMatchesSearch = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(1),
    /**
     * The search term matches the english
     */
    name: buildMultilingualTextWithSingleItem(`b${searchTermsWithNoSpecialChar}`),
});

const termThatShouldMatchNoSearches = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(2),
    name: buildMultilingualTextWithSingleItem(`@#$%^`),
});

const testTerms = [termWhoseEnglishMatchesSearch, termThatShouldMatchNoSearches];

const indexEndpoint = `/resources/terms`;

describe(`term index queries`, () => {
    let app: INestApplication;

    let termRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(process.env.NODE_ENV),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                TermModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .overrideGuard(OptionalJwtAuthGuard)
            .useValue(new MockJwtAuthGuard(undefined, true))
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        termRepository = app.get(TERM_QUERY_REPOSITORY_TOKEN);

        databaseProvider = app.get(ArangoDatabaseProvider);

        databaseProvider.clearViews();

        /**
         * Note that queries don't write to the database, so if we share a
         * single set of terms, we don't need to clear the DB between each run.
         */
        await termRepository.createMany(testTerms);
    });

    afterAll(async () => {
        await app.close();

        await databaseProvider.clearViews();

        databaseProvider.close();
    });

    describe(`when no filters are provided`, () => {
        it.todo(`should return the expected result`);
    });

    describe(`when user-defined filters are provided`, () => {
        describe(`when searching the property: **name**`, () => {
            describe(`when one of the name's multilingual text items matches the search text`, () => {
                it.only(`should find the expected term`, async () => {
                    const userQueryCondition: CoscradSimpleCondition = {
                        type: CoscradConditionBlockType.SIMPLE,
                        operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                        field: 'name',
                        params: [searchTermsWithNoSpecialChar],
                    };

                    const res = await request(app.getHttpServer()).get(indexEndpoint).send({
                        filter: userQueryCondition,
                    });

                    expect(res.status).toBe(HttpStatusCode.ok);

                    const { entities } = res.body;

                    expect(entities).toHaveLength(1);
                });
            });
        });
    });
});
