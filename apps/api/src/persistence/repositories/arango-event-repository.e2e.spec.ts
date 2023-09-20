import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigServiceSpec from '../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/Environment';
import { SongModule } from '../../app/domain-modules/song.module';
import { CoscradEventUnion, EventModule } from '../../domain/common';
import { CoscradEventFactory } from '../../domain/common/events/coscrad-event-factory';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { buildFakeTimersConfig } from '../../domain/models/__tests__/utilities/buildFakeTimersConfig';
import { dummySystemUserId } from '../../domain/models/__tests__/utilities/dummySystemUserId';
import { SongCreated } from '../../domain/models/song/commands/song-created.event';
import { AggregateType } from '../../domain/types/AggregateType';
import { InternalError } from '../../lib/errors/InternalError';
import { buildTestCommandFsaMap } from '../../test-data/commands';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../validation';
import { ArangoDatabaseProvider } from '../database/database.provider';
import { PersistenceModule } from '../persistence.module';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from './__tests__/generateDatabaseNameForTestSuite';
import { IEventRepository } from './arango-command-repository-for-aggregate';
import { ArangoEventRepository } from './arango-event-repository';

const fakeTimersConfig = buildFakeTimersConfig();

const databaseName = generateDatabaseNameForTestSuite();

describe(`Arango Event Repository`, () => {
    let arangoDatabaseProvider: ArangoDatabaseProvider;

    let arangoEventRepository: IEventRepository;

    let coscradEventFactory: CoscradEventFactory;

    beforeAll(async () => {
        const testingModule = await Test.createTestingModule({
            imports: [
                SongModule,
                EventModule,
                PersistenceModule.forRootAsync(),
                DynamicDataTypeModule,
            ],
            providers: [
                {
                    provide: CoscradEventUnion,
                    useValue: CoscradEventUnion,
                },
                ConfigService,
                ArangoEventRepository,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigServiceSpec(
                    { ARANGO_DB_NAME: databaseName },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile()
            .catch((e) => {
                throw new InternalError(`Failed to initialize test module: ${e}`);
            });

        await testingModule.init();

        arangoEventRepository = testingModule.get(ArangoEventRepository);

        arangoDatabaseProvider = testingModule.get(ArangoDatabaseProvider);

        await testingModule.get(DynamicDataTypeFinderService).bootstrapDynamicTypes();

        jest.useFakeTimers(fakeTimersConfig);
    });

    beforeEach(async () => {
        await new TestRepositoryProvider(arangoDatabaseProvider, coscradEventFactory).testSetup();
    });

    describe(`appendEvent`, () => {
        const songId = buildDummyUuid(1);
        it(`should append the event`, async () => {
            const { payload: commandPayload } = buildTestCommandFsaMap().get(`CREATE_SONG`);

            const songCreated = new SongCreated(commandPayload, songId, dummySystemUserId);

            await arangoEventRepository.appendEvent(songCreated);

            const searchResult = await arangoEventRepository.fetchEvents({
                type: AggregateType.song,
                id: songId,
            });

            expect(Array.isArray(searchResult)).toBe(true);

            expect(searchResult).not.toEqual([]);

            expect(searchResult).toHaveLength(1);

            const event = searchResult[0];

            // TODO We need an event factory to ensure that the event repository returns a proper instance with no superfluous database document props
            // expect(event).toEqual(songCreated);

            expect(event.id).toEqual(songCreated.id);

            expect(event.payload).toEqual(songCreated.payload);

            expect(event.meta).toEqual(songCreated.meta);
        });
    });
});
