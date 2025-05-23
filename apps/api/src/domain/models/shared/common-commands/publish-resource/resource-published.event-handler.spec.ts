import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoAudioItemQueryRepository } from '../../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { TermCreated } from '../../../term/commands';
import { ITermQueryRepository } from '../../../term/queries';
import { ArangoTermQueryRepository } from '../../../term/repositories/arango-term-query-repository';
import { ResourcePublished } from './resource-published.event';
import { ResourcePublishedEventHandler } from './resource-published.event-handler';

const termId = buildDummyUuid(1);

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

const resourcePublished = termCreated.andThen<ResourcePublished>({
    type: 'RESOURCE_PUBLISHED',
});

const eventHistory = resourcePublished.as(compositeId);

const [creationEvent, publicationEvent] = eventHistory as [TermCreated, ResourcePublished];

describe(`ResourcePublished.eventHandler`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let resourcePublishedEventHandler: ResourcePublishedEventHandler;

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

        testQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            new ArangoAudioItemQueryRepository(connectionProvider),
            new ConsoleCoscradCliLogger()
        );

        resourcePublishedEventHandler = new ResourcePublishedEventHandler({
            // @ts-expect-error todo fix this
            forResource: (resourceType) => {
                if (resourceType !== ResourceType.term) {
                    throw new InternalError(
                        `publication not yet supported for ${resourceType} (we need to register a query repository provider)`
                    );
                }

                return testQueryRepository;
            },
        });
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
        await testQueryRepository.create(existingView);
    });

    it(`should publish the resource`, async () => {
        await resourcePublishedEventHandler.handle(publicationEvent);

        const searchResult = await testQueryRepository.fetchById(termId);

        expect(searchResult).not.toBe(NotFound);

        const foundTerm = searchResult as TermViewModel;

        expect(foundTerm.isPublished).toBe(true);

        expect(foundTerm.actions).not.toContain('PUBLISH_RESOURCE');
    });
});
