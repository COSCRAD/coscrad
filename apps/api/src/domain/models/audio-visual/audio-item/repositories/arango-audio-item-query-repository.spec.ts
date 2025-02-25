import {
    AggregateType,
    IAudioItemViewModel,
    IDetailQueryResult,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/Environment';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AudioItemCreated } from '../commands/create-audio-item/audio-item-created.event';
import { EventSourcedAudioItemViewModel } from '../queries';
import { IAudioItemQueryRepository } from '../queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from './arango-audio-item-query-repository';

const audioItemId = buildDummyUuid(1);

const compositeIdForSingleTerm = {
    type: AggregateType.audioItem,
    id: audioItemId,
};

describe(`ArangoAudioItemQueryRepository`, () => {
    let testQueryRepository: IAudioItemQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

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

        testQueryRepository = new ArangoAudioItemQueryRepository(connectionProvider);
    });

    beforeEach(async () => {
        // is this preferred to `databaseProvider.clearViews()` ?
        await databaseProvider.getDatabaseForCollection('audioItem__VIEWS').clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    const mediaItemId = buildDummyUuid(123);

    const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
        type: 'AUDIO_ITEM_CREATED',
        payload: {
            mediaItemId,
        },
    });

    const [creationEvent] = audioItemCreated.as(compositeIdForSingleTerm) as [AudioItemCreated];

    const originalLanguageCode = LanguageCode.Chilcotin;

    const translationLanguageCode = LanguageCode.English;

    const additionalAudioItems = [101, 102, 103].map((sequenceNumber) => {
        const creationEvent = new TestEventStream()
            .andThen<AudioItemCreated>({
                type: 'AUDIO_ITEM_CREATED',
                payload: {
                    name: `audio item number: ${sequenceNumber}`,
                    languageCodeForName: originalLanguageCode,
                },
            })
            .as({
                type: AggregateType.audioItem,
                id: buildDummyUuid(sequenceNumber),
            })[0] as AudioItemCreated;

        return EventSourcedAudioItemViewModel.fromAudioItemCreated(creationEvent);
    });

    describe(`ArangoAudioItemQueryRepository.fetchById`, () => {
        describe(`when there is an audio item with the given ID`, () => {
            beforeEach(async () => {
                await testQueryRepository.create(
                    EventSourcedAudioItemViewModel.fromAudioItemCreated(creationEvent)
                );
            });

            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(audioItemId);

                expect(result).not.toBe(NotFound);

                const audioItemView = result as IAudioItemViewModel;

                const { mediaItemId } = audioItemView;

                expect(mediaItemId).toBe(mediaItemId);
            });
        });

        describe(`when there is no audio item with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('bogusID');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`ArangoAudioItemQueryRepository.fetchMany`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalAudioItems);
        });

        it(`should return the expected audio item views`, async () => {
            // act
            await testQueryRepository.fetchMany();

            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(additionalAudioItems.length);
        });
    });

    describe(`ArangoAudioItemQueryRepository.count`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalAudioItems);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(additionalAudioItems.length);
        });
    });

    describe(`ArangoAudioItemQueryRepository.create`, () => {
        it(`should create the expected audio item view`, async () => {
            const targetAudioItem = additionalAudioItems[0];

            await testQueryRepository.create(targetAudioItem);

            const searchResult = await testQueryRepository.fetchById(targetAudioItem.id);

            expect(searchResult).not.toBe(NotFound);

            const foundView = searchResult as EventSourcedAudioItemViewModel;

            const name = new MultilingualText(foundView.name);

            expect(name.getOriginalTextItem().text).toBe(`audio item number: 101`);
        });
    });

    describe(`ArangoAudioItemQueryRepository.delete`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalAudioItems);
        });

        it(`should delete the expected audio item`, async () => {
            const targetAudioItemId = additionalAudioItems[0].id;

            // act
            await testQueryRepository.delete(targetAudioItemId);

            const newCount = await testQueryRepository.count();

            expect(newCount).toBe(2);

            const searchResult = await testQueryRepository.fetchById(targetAudioItemId);

            expect(searchResult).toBe(NotFound);
        });
    });

    describe(`ArangoAudioItemQueryRepository.translateName`, () => {
        const targetAudioItem = additionalAudioItems[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should update the audio item's name`, async () => {
            const translationOfName = 'translation of audio item name';

            const role = MultilingualTextItemRole.freeTranslation;

            await testQueryRepository.translateName(targetAudioItem.id, {
                text: translationOfName,
                languageCode: translationLanguageCode,
                role,
            });

            const searchResult = await testQueryRepository.fetchById(targetAudioItem.id);

            expect(searchResult).not.toBe(NotFound);

            const updatedView = searchResult as IDetailQueryResult<IAudioItemViewModel>;

            const name = new MultilingualText(updatedView.name);

            const { role: foundTextRole, text: foundText } = name.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(foundTextRole).toBe(role);

            expect(foundText).toBe(translationOfName);
        });
    });

    describe(`publish`, () => {
        const targetAudioItem = additionalAudioItems[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should publish the audio item`, async () => {
            await testQueryRepository.publish(targetAudioItem.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });
});
