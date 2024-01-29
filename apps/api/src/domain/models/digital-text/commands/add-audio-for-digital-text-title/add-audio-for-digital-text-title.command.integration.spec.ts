import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { DigitalText } from '../../entities';
import { DigitalTextCreated } from '../digital-text-created.event';
import { AddAudioForDigitalTextTitle } from './add-audio-for-digital-text-title.command';

const commandType = 'ADD_AUDIO_FOR_DIGITAL_TEXT_TITLE';

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<AddAudioForDigitalTextTitle>;

const languageCodeForTitle = LanguageCode.Chilcotin;

// const translationLanguageCodeForTitle = LanguageCode.Haida;

const audioItemId = buildDummyUuid(117);

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
    id: audioItemId,
});

const digitalTextId = dummyFsa.payload.aggregateCompositeIdentifier.id;

const aggregateCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: digitalTextId,
};

const commandFsaFactory = new DummyCommandFsaFactory<AddAudioForDigitalTextTitle>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier,
            languageCode: languageCodeForTitle,
            audioItemId,
        },
    })
);

describe(commandType, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }).catch((error) => {
                throw error;
            }));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    const eventStreamForDigitalTextWithNoAudioForTitleAndNoTranslation =
        new TestEventStream().andThen<DigitalTextCreated>({
            type: `DIGITAL_TEXT_CREATED`,
            payload: {
                languageCodeForTitle,
            },
        });

    // const eventStreamForDigitalTextWith

    describe(`when the command is valid`, () => {
        describe(`when the audio is for the original text title`, () => {
            it(`should succeed`, async () => {
                const eventHistory =
                    eventStreamForDigitalTextWithNoAudioForTitleAndNoTranslation.as({
                        id: digitalTextId,
                    });

                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.audioItem)
                            .create(existingAudioItem);
                        await app.get(ArangoEventRepository).appendEvents(eventHistory);
                    },
                    buildValidCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            aggregateCompositeIdentifier: {
                                id: digitalTextId,
                            },
                        }),
                    checkStateOnSuccess: async () => {
                        const digitalTextSearchResult = await testRepositoryProvider
                            .forResource(ResourceType.digitalText)
                            .fetchById(digitalTextId);

                        expect(digitalTextSearchResult).toBeInstanceOf(DigitalText);

                        const updatedDigitalText = digitalTextSearchResult as DigitalText;

                        const audioIdSearchResult =
                            updatedDigitalText.getAudioForTitleInLanguage(languageCodeForTitle);

                        expect(audioIdSearchResult).toBe(audioItemId);

                        assertEventRecordPersisted(
                            updatedDigitalText,
                            'AUDIO_ADDED_FOR_DIGITAL_TEXT_TITLE',
                            dummySystemUserId
                        );
                    },
                });
            });
        });
    });
});
