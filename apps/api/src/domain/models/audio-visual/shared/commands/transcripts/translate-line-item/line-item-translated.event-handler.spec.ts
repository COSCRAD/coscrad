import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../../../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../../../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { ArangoConnectionProvider } from '../../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../../../test-data/utilities';
import { EventSourcedAudioItemViewModel } from '../../../../audio-item/queries';
import { EventSourcedVideoViewModel } from '../../../../video/queries';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { Transcript } from '../../../entities/transcript.entity';
import { LineItemTranslated } from './line-item-translated.event';
import { LineItemTranslatedEventHandler } from './line-item-translated.event-handler';

const resourceId = buildDummyUuid(60);

const translationLanguageCode = LanguageCode.English;

const originalLanguageCode = LanguageCode.Chilcotin;

const translationText = 'text of the translation';

const participant = buildTestInstance(TranscriptParticipant);

const inPoint = 1500;

const outPoint = 3600;

describe(`LineItemTranslatedEventHandler`, () => {
    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let testRepositoryProvider: IQueryRepositoryProvider;

    let lineItemTranslatedEventHandler: LineItemTranslatedEventHandler;

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

        lineItemTranslatedEventHandler = new LineItemTranslatedEventHandler(
            // @ts-expect-error We know that the provider will only ever be called with `provider.forResource(audioVisualResourceType)` not a general `ResourceType`
            testRepositoryProvider
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    describe(`when handling a LINE_ITEM_TRANSLATED`, () => {
        describe(`when the event is for an audio item`, () => {
            const lineItemTranslated = buildTestInstance(LineItemTranslated, {
                payload: {
                    aggregateCompositeIdentifier: {
                        id: resourceId,
                        type: AggregateType.audioItem,
                    },
                    translation: translationText,
                    languageCode: translationLanguageCode,
                    inPointMilliseconds: inPoint,
                    outPointMilliseconds: outPoint,
                },
            });

            const existingAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
                id: resourceId,
                transcript: buildTestInstance(Transcript, {
                    participants: [participant],
                    items: [
                        buildTestInstance(TranscriptItem, {
                            inPointMilliseconds: inPoint,
                            outPointMilliseconds: outPoint,
                            text: buildMultilingualTextWithSingleItem(
                                'existing transcript item text',
                                originalLanguageCode
                            ),
                        }),
                    ],
                }),
            });

            beforeEach(async () => {
                await testRepositoryProvider
                    .forResource(ResourceType.audioItem)
                    .create(existingAudioItem);
            });

            it(`should translate the line item`, async () => {
                await lineItemTranslatedEventHandler.handle(lineItemTranslated);

                const updatedView = (await testRepositoryProvider
                    .forResource(ResourceType.audioItem)
                    .fetchById(resourceId)) as EventSourcedAudioItemViewModel;

                const { text: foundMultilingualText } = updatedView.transcript.getLineItem(
                    inPoint,
                    outPoint
                ) as TranscriptItem;

                /**
                 * We only do a sanity check here because the Arango query
                 * repository is responsible for the full state update, which
                 * is tested comprehensively in its own test.
                 */
                expect(foundMultilingualText.hasTranslation()).toBe(true);
            });
        });

        describe(`when the event is for a video`, () => {
            const lineItemTranslated = buildTestInstance(LineItemTranslated, {
                payload: {
                    aggregateCompositeIdentifier: {
                        id: resourceId,
                        type: AggregateType.video,
                    },
                    translation: translationText,
                    languageCode: translationLanguageCode,
                    inPointMilliseconds: inPoint,
                    outPointMilliseconds: outPoint,
                },
            });

            const existingVideo = buildTestInstance(EventSourcedVideoViewModel, {
                id: resourceId,
                transcript: buildTestInstance(Transcript, {
                    participants: [participant],
                    items: [
                        buildTestInstance(TranscriptItem, {
                            inPointMilliseconds: inPoint,
                            outPointMilliseconds: outPoint,
                            text: buildMultilingualTextWithSingleItem(
                                'existing transcript item text',
                                originalLanguageCode
                            ),
                        }),
                    ],
                }),
            });

            beforeEach(async () => {
                await testRepositoryProvider.forResource(ResourceType.video).create(existingVideo);
            });

            it(`should translate the line item`, async () => {
                await lineItemTranslatedEventHandler.handle(lineItemTranslated);

                const updatedView = (await testRepositoryProvider
                    .forResource(ResourceType.video)
                    .fetchById(resourceId)) as EventSourcedVideoViewModel;

                const { text: foundMultilingualText } = updatedView.transcript.getLineItem(
                    inPoint,
                    outPoint
                ) as TranscriptItem;

                /**
                 * We only do a sanity check here because the Arango query
                 * repository is responsible for the full state update, which
                 * is tested comprehensively in its own test.
                 */
                expect(foundMultilingualText.hasTranslation()).toBe(true);
            });
        });
    });
});
