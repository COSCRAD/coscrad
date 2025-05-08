import {
    AggregateType,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../../../domain/common/build-multilingual-text-with-single-item';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../../../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { isNotFound } from '../../../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../../../test-data/utilities';
import { EventSourcedAudioItemViewModel } from '../../../../audio-item/queries';
import { TranslationLineItemDto } from '../../../../audio-item/queries/audio-item-query-repository.interface';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { Transcript } from '../../../entities/transcript.entity';
import { TranslationsImportedForTranscript } from './translations-imported-for-transcript.event';
import { TranslationsImportedForTranscsriptEventHandler } from './translations-imported-for-transcript.event-handler';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const lengthMilliseconds = 60000;

const translationItems: TranslationLineItemDto[] = (
    [
        [100, 200],
        [8000, 9389],
        [14500, 15443],
    ] as [number, number][]
).map(([inPointMilliseconds, outPointMilliseconds], index) => ({
    inPointMilliseconds,
    outPointMilliseconds,
    languageCode: translationLanguageCode,
    text: `translation for item #${index}`,
}));

const existingAudioItemView = buildTestInstance(EventSourcedAudioItemViewModel, {
    lengthMilliseconds,
    transcript: buildTestInstance(Transcript, {
        items: translationItems.map(({ inPointMilliseconds, outPointMilliseconds }, index) =>
            buildTestInstance(TranscriptItem, {
                inPointMilliseconds,
                outPointMilliseconds,
                text: buildMultilingualTextWithSingleItem(
                    `transcription line #${index}`,
                    originalLanguageCode
                ),
            })
        ),
    }),
});

const translationsImported = buildTestInstance(TranslationsImportedForTranscript, {
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: existingAudioItemView.id,
        },
        translationItems,
    },
});

describe(`TranslationsImportedForTranscsriptEventHandler.handle`, () => {
    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let testRepositoryProvider: IQueryRepositoryProvider;

    let translationsImportedForTranscsriptEventHandler: TranslationsImportedForTranscsriptEventHandler;

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

        testRepositoryProvider = app.get(QUERY_REPOSITORY_PROVIDER_TOKEN);

        translationsImportedForTranscsriptEventHandler =
            new TranslationsImportedForTranscsriptEventHandler(
                // @ts-expect-error We know that the handler is only going to call ``forResource(type)` with type satisfying `AudioVisualResourceType`, not a general `ResourceType`
                testRepositoryProvider
            );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    describe(`when handling events for an audio item`, () => {
        describe(`when there is an existing audio transcript without any translations for its items`, () => {
            beforeEach(async () => {
                await testRepositoryProvider
                    .forResource(ResourceType.audioItem)
                    .create(existingAudioItemView);
            });

            it(`should add translations`, async () => {
                await translationsImportedForTranscsriptEventHandler.handle(translationsImported);

                const { transcript } = (await testRepositoryProvider
                    .forResource(ResourceType.audioItem)
                    .fetchById(existingAudioItemView.id)) as EventSourcedAudioItemViewModel;

                const missingTranslations = translationItems.filter(
                    ({ inPointMilliseconds, outPointMilliseconds }) =>
                        !transcript.hasLineItem(inPointMilliseconds, outPointMilliseconds)
                );

                expect(missingTranslations).toEqual([]);

                const invalidTranslations = translationItems.filter(
                    ({ text, languageCode, inPointMilliseconds, outPointMilliseconds }) => {
                        const targetItem = transcript.getLineItem(
                            inPointMilliseconds,
                            outPointMilliseconds
                        ) as TranscriptItem;

                        const translationSearchResult =
                            targetItem.text.getTranslation(languageCode);

                        if (isNotFound(translationSearchResult)) return false;

                        const { text: foundTextForTranslation, role: foundTranslationRole } =
                            translationSearchResult;

                        if (foundTextForTranslation !== text) return false;

                        if (foundTranslationRole !== MultilingualTextItemRole.freeTranslation)
                            return false;

                        return true;
                    }
                );

                expect(invalidTranslations).toEqual([]);
            });
        });
    });

    describe(`when handling events for a video`, () => {
        it.todo(`should have a test`);
    });
});
