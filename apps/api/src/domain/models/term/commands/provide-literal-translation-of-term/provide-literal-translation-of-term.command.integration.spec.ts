import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { TermModule } from '../../../../../app/domain-modules/term.module';
import { CoscradEventFactory } from '../../../../../domain/common';
import { ID_MANAGER_TOKEN } from '../../../../../domain/interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../../domain/repositories/interfaces/repository-for-aggregate.interface';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../../../validation';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Term } from '../../entities/term.entity';
import { TermCreated } from '../create-term';
import { ProvideLiteralTranslationOfTerm } from './provide-literal-translation-of-term.command';

const commandType = 'PROVIDE_LITERAL_TRANSLATION_OF_TERM';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationText = 'how said it is this, literally';

const termId = buildDummyUuid(1);

const existingTerm = Term.fromEventHistory(
    new TestEventStream()
        .andThen<TermCreated>({
            type: 'TERM_CREATED',
            payload: {
                text: 'original term text',
                languageCode: originalLanguageCode,
            },
        })
        .as({
            type: AggregateType.term,
            id: termId,
        }),
    termId
) as Term;

const validCommandFsa = {
    type: commandType,
    payload: buildTestInstance(ProvideLiteralTranslationOfTerm, {
        aggregateCompositeIdentifier: existingTerm.getCompositeIdentifier(),
        translationLanguageCode,
        literalTranslation: translationText,
    }),
};

describe(commandType, () => {
    let testAssertionDependencies: CommandAssertionDependencies;

    let termRepository: IRepositoryForAggregate<Term>;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync(), DynamicDataTypeModule, TermModule],
            providers: [
                {
                    provide: TestRepositoryProvider,
                    useFactory: (
                        databaseProvider: ArangoDatabaseProvider,
                        dynamicDataTypeFinderService: DynamicDataTypeFinderService
                    ) =>
                        new TestRepositoryProvider(
                            databaseProvider,
                            new CoscradEventFactory(dynamicDataTypeFinderService),
                            dynamicDataTypeFinderService
                        ),
                    inject: [ArangoDatabaseProvider, DynamicDataTypeFinderService],
                },
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    // can't we make this default?
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        testAssertionDependencies = {
            testRepositoryProvider: app.get(TestRepositoryProvider),
            commandHandlerService: app.get(CommandHandlerService),
            idManager: app.get(ID_MANAGER_TOKEN),
        };

        termRepository = testAssertionDependencies.testRepositoryProvider.forResource(
            ResourceType.term
        );

        databaseProvider = app.get(ArangoDatabaseProvider);
    });

    beforeEach(async () => {
        await testAssertionDependencies.testRepositoryProvider.testSetup();

        // TODO close db connection
    });

    afterAll(async () => {
        await app.close();

        await databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should add the literal translation to the term's text`, async () => {
            await assertCommandSuccess(testAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await termRepository.create(existingTerm);
                },
                buildValidCommandFSA: () => validCommandFsa,
                checkStateOnSuccess: async () => {
                    const updatedTerm = (await termRepository.fetchById(termId)) as Term;

                    expect(updatedTerm.text.has(translationLanguageCode));
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the term does not exist`, () => {
            it(`should return the expected error`, async () => {
                await assertCommandError(testAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        Promise.resolve();
                    },
                    buildCommandFSA: () => validCommandFsa,
                    checkError: (e) => {
                        assertErrorAsExpected(
                            e,
                            new CommandExecutionError([
                                new AggregateNotFoundError(
                                    validCommandFsa.payload.aggregateCompositeIdentifier
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the translation language code and the original langauge code are the same`, () => {
            it(`should fail`, async () => {
                await assertCommandError(testAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await termRepository.create(existingTerm);
                    },
                    buildCommandFSA: () =>
                        clonePlainObjectWithOverrides(validCommandFsa, {
                            payload: {
                                translationLanguageCode:
                                    existingTerm.text.getOriginalTextItem().languageCode,
                            },
                        }),
                });
            });
        });

        describe(`when there is already a literal translation into the translation language`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(testAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        /**
                         * We execute the command here to set up the state
                         * where there is already a literal translation.
                         */
                        await assertCommandSuccess(testAssertionDependencies, {
                            systemUserId: dummySystemUserId,
                            seedInitialState: async () => {
                                await termRepository.create(existingTerm);
                            },
                            buildValidCommandFSA: () => validCommandFsa,
                        });
                    },
                    buildCommandFSA: () => validCommandFsa,
                });
            });
        });
    });
});
