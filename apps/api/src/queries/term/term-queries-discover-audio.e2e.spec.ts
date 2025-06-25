import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
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

                expect(result.byTerm).toHaveLength(audioItems.length);

                result.byTerm
                    .flatMap(({ importOptions }) => importOptions.map(({ actions }) => actions))
                    .forEach((commands, index) => {
                        // add audio for term, publish audio
                        expect(commands).toHaveLength(2);

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

                expect(result.bulkCommandStream).toHaveLength(2 * terms.length);
            });
        });

        describe(`when there are no terms without audio`, () => {
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
                    // the term already has audio
                    mediaItemId: buildDummyUuid(200 + index),
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

                expect(result.byTerm).toHaveLength(0);

                expect(result.bulkCommandStream).toBeFalsy();
            });
        });

        describe(`when some terms already have audio, some have no possible audio file names, and others have possible audio filename candidates`, () => {
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
                    mediaItemId: index === 0 ? buildDummyUuid(300) : null,
                    /**
                     * Term 0 has existing audio so `possibleAudioFilenames` is omitted
                     * Term 1 has no existing audio but no `possibleAudioFilenames`
                     */
                    possibleAudioFilenames: [0, 1].includes(index)
                        ? null
                        : // the match is by string-contains
                          [audioItems[index].name.getOriginalTextItem().text.slice(2)],
                })
            );

            // Term 0 and Term 1 do not have a possible audio result
            const expectedNumberOfResults = terms.length - 2;

            beforeEach(async () => {
                await termQueryRepository.createMany(terms);

                await audioQueryRepository.createMany(audioItems);
            });

            describe(`when audio publication is requested`, () => {
                it(`should include RESOURCE_PUBLISHED commands in the import actions`, async () => {
                    const result = await termQueryService.discoverAudio({
                        shouldPublishAudio: true,
                        languageCodeForAudio,
                    });

                    expect(result.byTerm).toHaveLength(expectedNumberOfResults);

                    const allImportOptions = result.byTerm.map(({ importOptions }) =>
                        importOptions.map(({ actions }) => actions)
                    );

                    allImportOptions.forEach((importOptions) => {
                        expect(importOptions).toHaveLength(1);

                        const fsas = importOptions[0];

                        expect(fsas).toHaveLength(2);

                        expect(fsas[0].type).toBe('ADD_AUDIO_FOR_TERM');

                        const {
                            type,
                            payload: { aggregateCompositeIdentifier },
                        } = fsas[1];

                        expect(type).toBe('PUBLISH_RESOURCE');

                        expect(aggregateCompositeIdentifier.type).toEqual(AggregateType.audioItem);
                    });

                    /**
                     * ADD_AUDIO_TO_TERM
                     * PUBLISH_RESOURCE
                     * for each applicable term
                     */
                    expect(result.bulkCommandStream).toHaveLength(2 * expectedNumberOfResults);
                });
            });

            describe(`when audio publication is not requested`, () => {
                it(`should not include RESOURCE_PUBLISHED commands in the import actions`, async () => {
                    const result = await termQueryService.discoverAudio({
                        // do not request audio publication
                        shouldPublishAudio: false,
                        languageCodeForAudio,
                    });

                    expect(result.byTerm).toHaveLength(expectedNumberOfResults);

                    const allImportOptions = result.byTerm.map(({ importOptions }) =>
                        importOptions.map(({ actions }) => actions)
                    );

                    allImportOptions.forEach((importOptions) => {
                        expect(importOptions).toHaveLength(1);

                        const fsas = importOptions[0];

                        expect(fsas).toHaveLength(1);

                        const { type: commandType } = fsas[0];

                        expect(commandType).toBe('ADD_AUDIO_FOR_TERM');
                    });

                    /**
                     * ADD_AUDIO_TO_TERM
                     * for each applicable term
                     */
                    expect(result.bulkCommandStream).toHaveLength(expectedNumberOfResults);
                });
            });
        });
    });
});
