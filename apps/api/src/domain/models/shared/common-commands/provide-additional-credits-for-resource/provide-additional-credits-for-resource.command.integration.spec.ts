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
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { Resource } from '../../../resource.entity';
import { CoscradContributor } from '../../../user-management';
import { FullName } from '../../../user-management/user/entities/user/full-name.entity';
import { ProvideAdditionalCreditsForResource } from './provide-additional-credits-for-resource.command';
import { ProvideAdditionalCreditsForResourceCommandHandler } from './provide-additional-credits-for-resource.command-handler';

/**
 * Ideally, we would use any old string here. But for now, because the command
 * schema uses the `ResourceType` to build payload type constraitns, we have to use
 * a known resource type.
 */
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
    })
);

const validCommand = buildTestInstance(ProvideAdditionalCreditsForResource, {
    contributorIds: dummyContributorIds,
    aggregateCompositeIdentifier: {
        id: widgetId,
        type: WIDGET_TYPE as AggregateType,
    },
});

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
                        payload: validCommand,
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
                }
            );
        });
    });

    describe(`when the command is invalid`, () => {
        it.todo(`should have a test`);
    });
});
