import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories';
import { LiteralTranslationOfTermProvided } from './literal-translation-of-term-provided.event';
import { LiteralTranslationOfTermProvidedEventHandler } from './literal-translation-of-term-provided.event-handler';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const literalTranslation = 'by him softly spoken was it (literal translation for test term)';

const existingTermView = buildTestInstance(TermViewModel, {
    name: buildMultilingualTextWithSingleItem('Term in the language', originalLanguageCode),
});

const literalTranslationProvided =
    new TestEventStream().buildSingle<LiteralTranslationOfTermProvided>({
        type: 'LITERAL_TRANSLATION_OF_TERM_PROVIDED',
        payload: {
            aggregateCompositeIdentifier: {
                id: existingTermView.id,
            },
            translationItem: new MultilingualTextItem({
                text: literalTranslation,
                languageCode: translationLanguageCode,
                role: MultilingualTextItemRole.literalTranslation,
            }),
        },
    });

describe(`LiteralTranslationOfTermProvidedEventHandler`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let literalTranslationProvidedHandler: LiteralTranslationOfTermProvidedEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        literalTranslationProvidedHandler = new LiteralTranslationOfTermProvidedEventHandler(
            app.get(TERM_QUERY_REPOSITORY_TOKEN)
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingTermView);
    });

    describe(`when there is an existing term`, () => {
        it(`should add the literal translation`, async () => {
            await literalTranslationProvidedHandler.handle(literalTranslationProvided);

            const updatedView = (await testQueryRepository.fetchById(
                existingTermView.id
            )) as TermViewModel;

            expect(updatedView.name.has(translationLanguageCode));

            const { text: foundText, role: foundRole } = updatedView.name.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(foundText).toBe(literalTranslation);

            expect(foundRole).toBe(MultilingualTextItemRole.literalTranslation);
        });
    });
});
