import {
    AggregateType,
    IDetailQueryResult,
    IVideoViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
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
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../shared/access-control/access-control-list.entity';
import { VideoCreated } from '../commands';
import { EventSourcedVideoViewModel, IVideoQueryRepository } from '../queries';
import { ArangoVideoQueryRepository } from './arango-video-query-repository';

const targetVideo = buildTestInstance(EventSourcedVideoViewModel, {});

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

describe(`ArangoVideoQueryRepository`, () => {
    let testQueryRepository: IVideoQueryRepository;

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

        testQueryRepository = new ArangoVideoQueryRepository(connectionProvider);
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection('video__VIEWS').clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    const additionalVideos = [10, 11, 12].map((sequenceNumber) => {
        const creationEvent = new TestEventStream()
            .andThen<VideoCreated>({
                type: 'VIDEO_CREATED',
                payload: {
                    name: `video name: ${sequenceNumber}`,
                    languageCodeForName: originalLanguageCode,
                },
            })
            .as({
                type: AggregateType.mediaItem,
                id: buildDummyUuid(sequenceNumber),
            })[0] as VideoCreated;

        return EventSourcedVideoViewModel.fromVideoCreated(creationEvent);
    });

    describe(`fetchById`, () => {
        describe(`when the video exists`, () => {
            beforeEach(async () => {
                await testQueryRepository.create(targetVideo);
            });

            it(`should return the video`, async () => {
                const searchResult = await testQueryRepository.fetchById(targetVideo.id);

                expect(searchResult).not.toBe(NotFound);
                // TODO add more assertions
            });
        });

        describe(`when the video does not exist`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('bogusID');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`publish`, () => {
        const targetAudioItem = additionalVideos[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should publish the video`, async () => {
            await testQueryRepository.publish(targetAudioItem.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedVideoViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`allowuser`, () => {
        const targetAudioItem = buildTestInstance(EventSourcedVideoViewModel, {
            accessControlList: new AccessControlList(),
        });

        const testUserId = buildDummyUuid(209);

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the user the the query ACL`, async () => {
            await testQueryRepository.allowUser(targetAudioItem.id, testUserId);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedVideoViewModel;

            expect(updatedView.accessControlList.canUser(testUserId)).toBe(true);
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalVideos);
        });
        it('should return the expected video views', async () => {
            await testQueryRepository.fetchMany();

            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(additionalVideos.length);
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalVideos);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(additionalVideos.length);
        });
    });

    describe(`delete`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalVideos);
        });

        it(`should delete the expected video`, async () => {
            const targetAudioItemId = additionalVideos[0].id;

            await testQueryRepository.delete(targetAudioItemId);

            const newCount = await testQueryRepository.count();

            expect(newCount).toBe(2);

            const searchResult = await testQueryRepository.fetchById(targetAudioItemId);

            expect(searchResult).toBe(NotFound);
        });
    });

    describe(`translateName`, () => {
        const targetAudioItem = additionalVideos[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should update the video's name`, async () => {
            const translationOfName = 'translation of video name';

            const role = MultilingualTextItemRole.freeTranslation;

            await testQueryRepository.translateName(targetAudioItem.id, {
                text: translationOfName,
                languageCode: translationLanguageCode,
                role,
            });

            const searchResult = await testQueryRepository.fetchById(targetAudioItem.id);

            expect(searchResult).not.toBe(NotFound);

            const updatedView = searchResult as unknown as IDetailQueryResult<IVideoViewModel>;

            const name = new MultilingualText(updatedView.name);

            const { role: foundTextRole, text: foundText } = name.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(foundTextRole).toBe(role);

            expect(foundText).toBe(translationOfName);
        });
    });
});
