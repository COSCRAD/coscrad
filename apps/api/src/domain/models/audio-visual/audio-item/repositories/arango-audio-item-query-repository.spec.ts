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
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
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
import { TranscriptItem } from '../../shared/entities/transcript-item.entity';
import { TranscriptParticipant } from '../../shared/entities/transcript-participant';
import { Transcript } from '../../shared/entities/transcript.entity';
import { TranscriptLineItemDto } from '../commands';
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

    describe(`allowUser`, () => {
        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            // empty to start
            accessControlList: new AccessControlList(),
        });

        const testUserId = buildDummyUuid(109);

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the user to the query ACL`, async () => {
            await testQueryRepository.allowUser(targetAudioItem.id, testUserId);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            expect(updatedView.accessControlList.canUser(testUserId)).toBe(true);
        });
    });

    describe(`create transcript`, () => {
        const targetAudioItem = additionalAudioItems[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should append an empty transcript to the existing audio item`, async () => {
            await testQueryRepository.createTranscript(targetAudioItem.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            expect(updatedView.transcript).toBeTruthy();
        });
    });

    describe(`add participant`, () => {
        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            transcript: Transcript.buildEmpty(),
        });

        const participant = buildTestInstance(TranscriptParticipant, {});

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the participant`, async () => {
            await testQueryRepository.addParticipant(targetAudioItem.id, participant);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            const { name } = updatedView.transcript.findParticipantByInitials(
                participant.initials
            ) as TranscriptParticipant;

            expect(name).toBe(participant.name);
        });
    });

    describe(`add line item`, () => {
        const participant = new TranscriptParticipant({
            initials: 'JB',
            name: 'Johnny Blaze',
        });

        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            transcript: new Transcript({
                participants: [participant],
                items: [],
            }),
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the line item to an existing transcript`, async () => {
            const inPointMs = 100;

            const outPointMs = inPointMs + 300;

            const text = 'this is what was said';

            const languageCode = LanguageCode.English;

            await testQueryRepository.addLineItem(targetAudioItem.id, {
                inPointMilliseconds: inPointMs,
                outPointMilliseconds: outPointMs,
                text,
                languageCode,
                speakerInitials: participant.initials,
            });

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            const numberOfItems = updatedView.transcript.countLineItems();

            expect(numberOfItems).toBe(1);
        });
    });

    describe(`import line items`, () => {
        const participant = new TranscriptParticipant({
            initials: 'WO',
            name: 'William Who',
        });

        const speakerInitials = participant.initials;

        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            transcript: Transcript.buildEmpty(),
        });

        const lineItems = [1, 2, 3, 4, 5].map((i) =>
            buildTestInstance(TranscriptLineItemDto, {
                inPointMilliseconds: 100 * i,
                outPointMilliseconds: 100 * i + 50,
                speakerInitials,
                text: `text for line item #${i}`,
            })
        );

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it('should have a test', async () => {
            await testQueryRepository.importLineItems(targetAudioItem.id, lineItems);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            const numberOfItems = updatedView.transcript.countLineItems();

            expect(numberOfItems).toBe(lineItems.length);

            const missingLineItems = lineItems.filter(
                ({ inPointMilliseconds, outPointMilliseconds }) =>
                    !updatedView.transcript.hasLineItem(inPointMilliseconds, outPointMilliseconds)
            );

            expect(missingLineItems).toEqual([]);
        });
    });

    describe(`translate line item`, () => {
        const originalLanguageCode = LanguageCode.Chilcotin;

        const translationLanguageCode = LanguageCode.English;

        const translationText = 'this is how to translate what was said to English';

        const inPointMilliseconds = 100;

        const outPointMilliseconds = 200;

        const participant = buildTestInstance(TranscriptParticipant);

        const targetLineItem = buildTestInstance(TranscriptItem, {
            inPointMilliseconds,
            outPointMilliseconds,
            speakerInitials: participant.initials,
            text: buildMultilingualTextWithSingleItem('original text', originalLanguageCode),
        });

        const existingTranscript = buildTestInstance(Transcript, {
            participants: [participant],
            items: [targetLineItem],
        });

        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            transcript: existingTranscript,
            lengthMilliseconds: outPointMilliseconds * 10,
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it('should translate the line item', async () => {
            await testQueryRepository.translateLineItem(targetAudioItem.id, {
                inPointMilliseconds,
                outPointMilliseconds,
                text: translationText,
                languageCode: translationLanguageCode,
            });

            const { transcript } = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            const lineItemSearchResult = transcript.getLineItem(
                inPointMilliseconds,
                outPointMilliseconds
            );

            expect(lineItemSearchResult).not.toBe(NotFound);

            const { text } = lineItemSearchResult as TranscriptItem;

            expect(text.hasTranslation()).toEqual(true);

            const { text: foundTranslationText, role } = text.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(foundTranslationText).toEqual(translationText);

            expect(role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });
});
