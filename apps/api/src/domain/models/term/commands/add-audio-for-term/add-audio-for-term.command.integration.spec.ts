import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { Term } from '../../entities/term.entity';
import { TermCreated } from '../create-term';
import { AddAudioForTerm } from './add-audio-for-term.command';

const commandType = `ADD_AUDIO_FOR_TERM`;

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

const existingTermEvents = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
});

const termCompositeIdentifier = {
    type: AggregateType.term,
    id: buildDummyUuid(22),
};

const existingTerm = Term.fromEventHistory(
    existingTermEvents.as(termCompositeIdentifier),
    termCompositeIdentifier.id
) as Term;

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<AddAudioForTerm>;

const validPayload: AddAudioForTerm = clonePlainObjectWithOverrides(dummyFsa.payload, {
    aggregateCompositeIdentifier: termCompositeIdentifier,
    audioItemId: existingAudioItem.id,
});

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

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

    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA: () => validCommandFSA,
                seedInitialState: async () => {
                    await testRepositoryProvider.addFullSnapshot(
                        new DeluxeInMemoryStore({
                            [AggregateType.audioItem]: [existingAudioItem],
                            [AggregateType.term]: [existingTerm],
                        }).fetchFullSnapshotInLegacyFormat()
                    );
                },
            });
        });
    });
});
