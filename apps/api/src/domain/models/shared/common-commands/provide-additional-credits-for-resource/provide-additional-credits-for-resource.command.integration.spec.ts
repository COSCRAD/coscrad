import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService, CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../../domain/types/AggregateCompositeIdentifier';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { IdGenerationModule } from '../../../../../lib/id-generation/id-generation.module';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { ArangoRepositoryForAggregate } from '../../../../../persistence/repositories/arango-repository-for-aggregate';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { Resource } from '../../../resource.entity';
import { ArangoContributorRepository, CoscradContributor } from '../../../user-management';
import { FullName } from '../../../user-management/user/entities/user/full-name.entity';
import CommandExecutionError from '../../common-command-errors/CommandExecutionError';
import InvalidExternalStateError from '../../common-command-errors/InvalidExternalStateError';
import { ProvideAdditionalCreditsForResource } from './provide-additional-credits-for-resource.command';
import { ProvideAdditionalCreditsForResourceCommandHandler } from './provide-additional-credits-for-resource.command-handler';

const WIDGET_TYPE = 'widget';

const WIDGET_COLLECTION_NAME = 'widgets';

class Widget extends Resource {
    readonly type = WIDGET_TYPE as ResourceType;

    readonly id: string;

    readonly name: string;

    constructor(dto: DTO<Widget>) {
        super(dto);

        const { name } = dto;

        this.name = name;
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        throw new Error('Method not implemented.');
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    getName(): MultilingualText {
        return buildMultilingualTextWithSingleItem(this.name);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }
}

const widgetId = buildDummyUuid(1);

const existingWidget = new Widget({
    type: WIDGET_TYPE as ResourceType,
    id: widgetId,
    name: 'My Test Widget',
    published: false,
});

const commandType = 'PROVIDE_ADDITIONAL_CREDITS_FOR_RESOURCE';

const dummyContributorIds = [50, 51, 52].map(buildDummyUuid);

const dummyContributors = dummyContributorIds.map((id, index) =>
    buildTestInstance(CoscradContributor, {
        id,
        fullName: new FullName({
            firstName: 'Contributor',
            lastName: `Number${index}`,
        }),
        // one of `shortBio` and `dateOfBirth` is required based on invariant validation rules for Contributors (to ensure the contributor is uniquely identifiable)
        shortBio: `I am test contributor #{${index}} for ${commandType}`,
    })
);

const validCommandPayload = buildTestInstance(ProvideAdditionalCreditsForResource, {
    contributorIds: dummyContributorIds,
    aggregateCompositeIdentifier: {
        id: widgetId,
        type: WIDGET_TYPE as AggregateType,
    },
});

const commandFsaFactory = new DummyCommandFsaFactory(() => ({
    type: commandType,
    payload: validCommandPayload,
}));

describe(commandType, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;
    let testRepositoryProvider: TestRepositoryProvider;
    let commandHandlerService: CommandHandlerService;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync(), IdGenerationModule, CommandModule],
            providers: [
                {
                    provide: ProvideAdditionalCreditsForResource,
                    useValue: ProvideAdditionalCreditsForResource,
                },
                {
                    provide: Widget,
                    useValue: Widget,
                },
                ProvideAdditionalCreditsForResourceCommandHandler,
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
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useFactory({
                factory: (databaseProvider: ArangoDatabaseProvider) => {
                    const repo = new ArangoRepositoryForAggregate(
                        databaseProvider,
                        WIDGET_COLLECTION_NAME as ArangoCollectionId,
                        (dto) => {
                            const builtWidget = new Widget(dto as DTO<Widget>);

                            return builtWidget;
                        },
                        mapDatabaseDocumentToAggregateDTO,
                        mapEntityDTOToDatabaseDocument
                    );

                    return {
                        getContributorRepository() {
                            return new ArangoContributorRepository(databaseProvider);
                        },
                        forResource(type: string) {
                            if (type !== WIDGET_TYPE) {
                                throw new Error(`unsupported resource type: ${type}`);
                            }

                            return repo;
                        },
                    };
                },
                inject: [ArangoDatabaseProvider],
            })
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        databaseProvider = app.get(ArangoDatabaseProvider);

        commandHandlerService = app.get(CommandHandlerService);

        testRepositoryProvider = app.get(REPOSITORY_PROVIDER_TOKEN);

        await app.get(ArangoConnectionProvider).createCollectionIfNotExists(WIDGET_COLLECTION_NAME);
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection(ArangoCollectionId.contributors).clear();

        await databaseProvider.getDatabaseForCollection(WIDGET_COLLECTION_NAME).clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            await assertCommandSuccess(
                { testRepositoryProvider, commandHandlerService },
                {
                    systemUserId: dummySystemUserId,
                    buildValidCommandFSA: () => ({
                        type: commandType,
                        payload: validCommandPayload,
                    }),
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(WIDGET_TYPE as ResourceType)
                            .create(existingWidget);

                        await databaseProvider
                            .getDatabaseForCollection(ArangoCollectionId.contributors)
                            .createMany(
                                dummyContributors.map((c) =>
                                    mapEntityDTOToDatabaseDocument(c.toDTO())
                                )
                            );
                    },
                    checkStateOnSuccess: async () => {
                        const result = (await testRepositoryProvider
                            .forResource(WIDGET_TYPE as ResourceType)
                            .fetchById(
                                validCommandPayload.aggregateCompositeIdentifier.id
                            )) as Widget;

                        expect(result.manualCredits).toHaveLength(dummyContributorIds.length);

                        const missingCredits = dummyContributorIds.filter(
                            (testContributorId) =>
                                !result.manualCredits.some(({ contributorIds }) =>
                                    contributorIds.includes(testContributorId)
                                )
                        );

                        expect(missingCredits).toEqual([]);
                    },
                }
            );
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when one of the contributors does not exist`, () => {
            const missingContributorId = dummyContributorIds[0];

            it(`should fail with the expected error`, async () => {
                await assertCommandError(
                    { testRepositoryProvider, commandHandlerService },
                    {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider
                                .forResource(WIDGET_TYPE as ResourceType)
                                .create(existingWidget);

                            await databaseProvider
                                .getDatabaseForCollection(ArangoCollectionId.contributors)
                                .createMany(
                                    dummyContributors
                                        .filter(({ id }) => id !== missingContributorId)
                                        .map((c) => mapEntityDTOToDatabaseDocument(c.toDTO()))
                                );
                        },
                        buildCommandFSA: () => commandFsaFactory.build(),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([new InvalidExternalStateError([])])
                            );

                            const missingMessages = [error.toString()].filter(
                                (message) => !message.includes(missingContributorId)
                            );

                            expect(missingMessages).toEqual([]);
                        },
                    }
                );
            });
        });

        describe(`when there is already a contribution of the given type`, () => {
            it(`should return the expected error`, async () => {
                await assertCommandError(
                    { testRepositoryProvider, commandHandlerService },
                    {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider
                                .forResource(WIDGET_TYPE as ResourceType)
                                .create(
                                    existingWidget.clone({
                                        manualCredits: [
                                            {
                                                contributorIds: validCommandPayload.contributorIds,
                                                type: validCommandPayload.contributionType,
                                            },
                                        ],
                                    })
                                );

                            await databaseProvider
                                .getDatabaseForCollection(ArangoCollectionId.contributors)
                                .createMany(
                                    dummyContributors.map((c) =>
                                        mapEntityDTOToDatabaseDocument(c.toDTO())
                                    )
                                );
                        },
                        buildCommandFSA: () => commandFsaFactory.build(),
                        checkError: (error) => {
                            assertErrorAsExpected(error, new CommandExecutionError([]));

                            // This pattern results in Jest showing us the message in case of failure
                            const invalidMessages = [error.toString()].filter(
                                (m) =>
                                    !m.includes(validCommandPayload.contributionType) ||
                                    !m.includes('duplicate')
                            );

                            expect(invalidMessages).toEqual([]);
                        },
                    }
                );
            });
        });

        describe(`when no contributor IDs have been specified`, () => {
            it.only(`should return the expected type error`, async () => {
                await assertCommandError(
                    { testRepositoryProvider, commandHandlerService },
                    {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            Promise.resolve();
                        },
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                contributorIds: [],
                            }),
                        checkError: (error) => {
                            // This pattern results in Jest showing us the message in case of failure
                            const invalidMessages = [error.toString()].filter(
                                (m) =>
                                    !m.includes('contributorIds') || !m.includes('Non-Empty Array')
                            );

                            expect(invalidMessages).toEqual([]);
                        },
                    }
                );
            });
        });
    });
});
