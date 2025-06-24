import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/environment';
import { CommandInfoService } from '../../app/controllers/command/services/command-info-service';
import { TermCommandsModule } from '../../app/domain-modules/term.commands.module';
import { WebOfKnowledgeModule } from '../../app/domain-modules/web-of-knowledge/web-of-knowledge.module';
import { ConsoleCoscradCliLogger } from '../../coscrad-cli/logging';
import { buildMultilingualTextWithSingleItem } from '../../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { EventSourcedAudioItemViewModel } from '../../domain/models/audio-visual/audio-item/queries';
import { IAudioItemQueryRepository } from '../../domain/models/audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../domain/models/audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { AddAudioForTerm } from '../../domain/models/term/commands';
import { ITermQueryRepository } from '../../domain/models/term/queries';
import { ArangoTermQueryRepository } from '../../domain/models/term/repositories';
import { TermQueryService } from '../../domain/services/query-services/term-query.service';
import { CoscradNLPModule } from '../../lib/nlp';
import { ArangoConnectionProvider } from '../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import { PersistenceModule } from '../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../test-data/utilities';
import { TermViewModel } from '../buildViewModelForResource/viewModels/term.view-model';

const languageCodeForAudio = LanguageCode.English;

describe(`when querying terms`, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let termQueryRepository: ITermQueryRepository;

    let audioQueryRepository: IAudioItemQueryRepository;

    let termQueryService: TermQueryService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CommandInfoService, TermQueryService],
            imports: [
                PersistenceModule.forRootAsync(),
                CoscradNLPModule,
                CommandModule,
                TermCommandsModule,
                /**
                 * This is necessary for attributions to be picked up
                 * under our current approach.
                 *
                 * TODO Should we have a separate test for attribution
                 * that uses a scenario test approach?
                 */
                WebOfKnowledgeModule,
            ],
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

        await app.init();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        termQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            new ArangoAudioItemQueryRepository(connectionProvider),
            new ConsoleCoscradCliLogger()
        );

        audioQueryRepository = new ArangoAudioItemQueryRepository(connectionProvider);

        termQueryService = app.get(TermQueryService);
    });

    // let eventPublisher: ICoscradEventPublisher;
    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`to discover audio items for unmatched terms`, () => {
        describe(`when no terms have audio, but all have possible audio filenames`, () => {
            const audioItemSequentialIds = [1, 2, 3, 4, 5];

            const termSequentialIds = [11, 12, 13, 14, 15];

            const audioItems = audioItemSequentialIds.map((sequentialId) =>
                buildTestInstance(EventSourcedAudioItemViewModel, {
                    id: buildDummyUuid(sequentialId),
                    name: buildMultilingualTextWithSingleItem(`audio item #${sequentialId}`),
                })
            );

            const terms = termSequentialIds.map((sequentialId, index) =>
                buildTestInstance(TermViewModel, {
                    id: buildDummyUuid(sequentialId),
                    name: buildMultilingualTextWithSingleItem(`term #${sequentialId}`),
                    possibleAudioFilenames: [audioItems[index].name.getOriginalTextItem().text],
                })
            );

            beforeEach(async () => {
                await termQueryRepository.createMany(terms);

                await audioQueryRepository.createMany(audioItems);
            });

            it(`should return the expected result`, async () => {
                const result = await termQueryService.discoverAudio({
                    shouldPublishAudio: true,
                    languageCodeForAudio,
                });

                expect(result).toHaveLength(audioItems.length);

                result
                    .flatMap(({ importOptions }) => importOptions.map(({ action }) => action))
                    .forEach((commands, index) => {
                        expect(commands).toHaveLength(1);

                        const target = commands[0];

                        expect(target.type).toBe('ADD_AUDIO_FOR_TERM');

                        const {
                            languageCode: foundLanguageCode,
                            audioItemId: foundAudioItemId,
                            aggregateCompositeIdentifier: { id: foundTermId },
                        } = target.payload as AddAudioForTerm;

                        expect(foundLanguageCode).toBe(languageCodeForAudio);

                        expect(foundAudioItemId).toBe(audioItems[index].id);

                        expect(foundTermId).toBe(terms[index].id);
                    });
            });
        });

        describe(`when there are no terms without audio`, () => {
            it.todo(`should return the correct result`);
        });

        describe(`when some terms have audio`, () => {
            describe(`when audio publication is requested`, () => {
                it.todo(`should return the correct result`);

                describe(`when executing a resulting import command stream`, () => {
                    `the command should succeed`;
                });
            });

            describe(`when audio publication is not requested`, () => {
                it.todo(`should return the correct result`);

                describe(`when executing a resulting import command stream`, () => {
                    `the command should succeed`;
                });
            });
        });
    });
});
