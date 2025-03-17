import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { TermCreated } from '../../../term/commands';
import { ITermQueryRepository } from '../../../term/queries';
import { AccessControlList } from '../../access-control/access-control-list.entity';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../publish-resource/resource-published.event-handler';
import { ResourceReadAccessGrantedToUser } from './resource-read-access-granted-to-user.event';
import { ResourceReadAccessGrantedToUserEventHandler } from './resource-read-access-granted-to-user.event-handler';

const termId = buildDummyUuid(1);

const userId = buildDummyUuid(2);

const compositeId = {
    type: AggregateType.term,
    id: termId,
};

const originalLanguageCode = LanguageCode.Chilcotin;

const originalText = 'the term in the language';

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
    payload: {
        text: originalText,
        languageCode: originalLanguageCode,
    },
});

const readAccessGranted = termCreated.andThen<ResourceReadAccessGrantedToUser>({
    type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
    payload: {
        userId,
    },
});

const eventHistory = readAccessGranted.as(compositeId);

const [creationEvent, readAccessEvent] = eventHistory as [
    TermCreated,
    ResourceReadAccessGrantedToUser
];

describe(`ResourceReadAccessGrantedToUserEventHandler.handle`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let readAccessEventHandler: ResourceReadAccessGrantedToUserEventHandler;

    let repositoryProvider: IQueryRepositoryProvider;

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

        repositoryProvider = app.get<IQueryRepositoryProvider>(QUERY_REPOSITORY_PROVIDER_TOKEN);

        testQueryRepository = repositoryProvider.forResource<ITermQueryRepository>(
            ResourceType.term
        );

        readAccessEventHandler = new ResourceReadAccessGrantedToUserEventHandler(
            repositoryProvider
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        const existingView = TermViewModel.fromTermCreated(creationEvent as TermCreated);

        /**
         * We attempted to use "handle" on a creation event for the test
         * setup, but it failed due to an apparent race condition.
         *
         * We should investigate this further.
         */
        await repositoryProvider.forResource(ResourceType.term).create(existingView);
    });

    it(`should allow access to the given user`, async () => {
        await readAccessEventHandler.handle(readAccessEvent);

        const updatedView = (await testQueryRepository.fetchById(termId)) as TermViewModel;

        const updatedAcl = new AccessControlList(updatedView.accessControlList);

        expect(updatedAcl.canUser(userId)).toBe(true);
    });
});
