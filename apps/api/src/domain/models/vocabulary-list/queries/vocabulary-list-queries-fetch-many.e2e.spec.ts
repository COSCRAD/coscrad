import {
    AggregateType,
    IIndexQueryResult,
    IMultilingualTextItem,
    IVocabularyListViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes, { HttpStatusCode } from '../../../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { ConsoleCoscradCliLogger } from '../../../../coscrad-cli/logging';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../test-data/events';
import { getCoscradEventConsumerMeta, ICoscradEvent } from '../../../common';
import { buildMultilingualTextFromBilingualText } from '../../../common/build-multilingual-text-from-bilingual-text';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { SyncInMemoryEventPublisher } from '../../../common/events/sync-in-memory-event-publisher';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { IAudioItemQueryRepository } from '../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { ResourcePublished } from '../../shared/common-commands/publish-resource/resource-published.event';
import { ResourcePublishedEventHandler } from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { ITermQueryRepository } from '../../term/queries';
import { ArangoTermQueryRepository } from '../../term/repositories';
import { ArangoQueryRepositoryProvider } from '../../term/repositories/arango-query-repository-provider';
import {
    TermAddedToVocabularyList,
    TermInVocabularyListAnalyzed,
    VocabularyListCreated,
    VocabularyListCreatedEventHandler,
    VocabularyListFilterPropertyRegistered,
} from '../commands';
import { TermAddedToVocabularyListEventHandler } from '../commands/add-term-to-vocabulary-list/term-added-to-vocabulary-list.event-handler';
import { TermInVocabularyListAnalyzedEventHandler } from '../commands/analyze-term-in-vocabulary-list/term-in-vocabulary-list-analyzed.event-handler';
import { VocabularyListFilterPropertyRegisteredEventHandler } from '../commands/register-vocabulary-list-filter-property/vocabulary-list-filter-property-registered.event-handler';
import { VocabularyListNameTranslated } from '../commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event';
import { VocabularyListNameTranslatedEventHandler } from '../commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event-handler';
import { ArangoVocabularyListQueryRepository } from '../repositories';
import { IVocabularyListQueryRepository } from './vocabulary-list-query-repository.interface';

const vocabularyListId = buildDummyUuid(4);

const vocabularyListName = 'to swim';

const languageCodeForVocabularyListName = LanguageCode.English;

const termId = buildDummyUuid(5);

const termOriginalText = 'I swim';

const termOriginalLanguageCode = LanguageCode.Chilcotin;

const termTranslation = 'I am swimming (English)';

const termTranslationLanguageCode = LanguageCode.English;

const indexEndpoint = `/resources/vocabularyLists`;

/**
 * TODO We may want to event source our test setup to give us a very high
 * level of confidence that our back-end is working from event handler
 * to query endpoint. Eagerly joining in terms, tags, notes, etc. into vocabulary
 * lists, for example, is a big risk.
 */
const existingTerm: TermViewModel = TermViewModel.fromDto({
    id: termId,
    isPublished: true,
    accessControlList: new AccessControlList().toDTO(),
    actions: [],
    name: buildMultilingualTextFromBilingualText(
        {
            text: termOriginalText,
            languageCode: termOriginalLanguageCode,
        },
        {
            text: termTranslation,
            languageCode: termTranslationLanguageCode,
        }
    ),
    contributions: [],
});

const vocabularyListEventStream = new TestEventStream()
    .andThen<VocabularyListCreated>({
        type: 'VOCABULARY_LIST_CREATED',
        payload: {
            name: vocabularyListName,
            languageCodeForName: languageCodeForVocabularyListName,
        },
    })
    .andThen<VocabularyListNameTranslated>({
        type: 'VOCABULARY_LIST_NAME_TRANSLATED',
    })
    .andThen<VocabularyListFilterPropertyRegistered>({
        type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
    })
    .andThen<TermAddedToVocabularyList>({
        type: 'TERM_ADDED_TO_VOCABULARY_LIST',
        payload: {
            termId,
        },
    })
    .andThen<TermInVocabularyListAnalyzed>({
        type: 'TERM_IN_VOCABULARY_LIST_ANALYZED',
    })
    .andThen<ResourcePublished>({
        type: 'RESOURCE_PUBLISHED',
    });

// TODO check that contributors are joined in
// const existingContributor = getValidAggregateInstanceForTest(AggregateType.contributor)

const eventPublisher = new SyncInMemoryEventPublisher(new ConsoleCoscradCliLogger());

const registerEventHandlers = (
    vocabularyListQueryRepository: IVocabularyListQueryRepository,
    termQueryRepository: ITermQueryRepository,
    audioItemQueryRepository: IAudioItemQueryRepository
): void => {
    const specificCtors = [
        VocabularyListCreatedEventHandler,
        VocabularyListNameTranslatedEventHandler,
        VocabularyListFilterPropertyRegisteredEventHandler,
        TermAddedToVocabularyListEventHandler,
        TermInVocabularyListAnalyzedEventHandler,
    ];

    const genericCtors = [ResourcePublishedEventHandler];

    const handlers = [];

    /**
     * We should use the test module to set this up.
     *
     * We are trying very hard to avoid introducing the handlers into
     * `setUpIntegrationTest` \ `createTestModule`, which already have been
     * identified as an anti-pattern that hurts extesnibility.
     */
    specificCtors.forEach((Ctor) => {
        const meta = getCoscradEventConsumerMeta(Ctor);

        if (isNotFound(meta)) {
            return;
        }

        const { type: eventType } = meta;

        const handler = new Ctor(vocabularyListQueryRepository);

        eventPublisher.register(eventType, handler);

        handlers.push(handler);
    });

    genericCtors.forEach((Ctor) => {
        const meta = getCoscradEventConsumerMeta(Ctor);

        if (isNotFound(meta)) {
            return;
        }

        const { type: eventType } = meta;

        const handler = new Ctor(
            new ArangoQueryRepositoryProvider(
                termQueryRepository,
                audioItemQueryRepository,
                vocabularyListQueryRepository
            )
        );

        eventPublisher.register(eventType, handler);

        handlers.push(handler);
    });
};

/**
 * TODO[test-coverage]: include test case with import history
 *
 * THIS TEST IS BEING REWRITTEN ON ANOTHER BRANCH. OPT BACK IN IMMEDIATELY WHEN REBASING.
 *
 * **
 */

describe.skip(`when querying for a vocabulary list: fetch many`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let connectionProvider: ArangoConnectionProvider;

    let vocabularyListQueryRepository: IVocabularyListQueryRepository;

    let seedVocabularyLists: (eventHistory: ICoscradEvent[]) => Promise<void>;

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await databaseProvider.getDatabaseForCollection('term__VIEWS').clear();

        await databaseProvider.getDatabaseForCollection('vocabularyList__VIEWS').clear();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
            // TODO avoid using `setUpIntegrationTest` here
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                }
                // no authenticated user
            ));

            connectionProvider = app.get(ArangoConnectionProvider);

            vocabularyListQueryRepository = new ArangoVocabularyListQueryRepository(
                connectionProvider,
                new ConsoleCoscradCliLogger()
            );

            connectionProvider = app.get(ArangoConnectionProvider);

            const audioItemRepo = new ArangoAudioItemQueryRepository(connectionProvider);

            registerEventHandlers(
                vocabularyListQueryRepository,
                new ArangoTermQueryRepository(
                    connectionProvider,
                    audioItemRepo,
                    new ConsoleCoscradCliLogger()
                ),
                audioItemRepo
            );

            seedVocabularyLists = async (events: ICoscradEvent[]) => {
                for (const e of events) {
                    await eventPublisher.publish(e);
                }
            };
        });

        describe(`when there is a vocabulary list with the given ID`, () => {
            describe(`when the vocabulary list is published`, () => {
                beforeEach(async () => {
                    const eventHistory = vocabularyListEventStream.as({
                        type: AggregateType.vocabularyList,
                        id: vocabularyListId,
                    });

                    await new ArangoTermQueryRepository(
                        connectionProvider,
                        new ArangoAudioItemQueryRepository(connectionProvider),
                        new ConsoleCoscradCliLogger()
                    ).create(existingTerm);

                    await seedVocabularyLists(eventHistory);
                });

                it(`should return the correct vocabulary list view`, async () => {
                    const res = await request(app.getHttpServer()).get(indexEndpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    const body = res.body as IIndexQueryResult<IVocabularyListViewModel>;

                    const { entities: foundEntities } = body;

                    expect(foundEntities).toHaveLength(1);

                    const { name: namedto, entries } = foundEntities[0];

                    const foundName = new MultilingualText(namedto);

                    const { text: foundText, languageCode: foundLanguageCode } =
                        foundName.getOriginalTextItem();

                    expect(foundText).toBe(vocabularyListName);

                    expect(foundLanguageCode).toBe(languageCodeForVocabularyListName);

                    // here we check that the term comes through
                    expect(entries).toHaveLength(1);

                    const { term: foundTerm } = entries[0];

                    const { name: termNameDto } = foundTerm;

                    const termName = new MultilingualText(termNameDto);

                    const { text: foundTermText, languageCode: foundTermLanguageCode } =
                        termName.getOriginalTextItem();

                    expect(foundTermText).toBe(termOriginalText);

                    expect(foundTermLanguageCode).toBe(termOriginalLanguageCode);

                    const {
                        text: foundTermTranslationText,
                        languageCode: foundTermTranslationLanguageCode,
                    } = termName.getTranslation(
                        termTranslationLanguageCode
                    ) as IMultilingualTextItem;

                    expect(foundTermTranslationText).toBe(termTranslation);

                    expect(foundTermTranslationLanguageCode).toBe(termTranslationLanguageCode);
                    // TODO check additional state
                });
            });
        });

        describe(`when there are no vocabulary lists`, () => {
            it(`should return an empty list of entities`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(httpStatusCodes.ok);

                expect(res.body.entities).toHaveLength(0);
            });
        });

        describe(`when one of the entries is missing a corresponding term in the database`, () => {
            it.todo(`should fail gracefully`);
        });
    });

    /**
     * Currently, we are pushing to get public assets live in production. When
     * we are ready to start using the system as an admin, we should complete this
     * test coverage.
     */
    describe(`when the user is a COSCRAD admin`, () => {
        it.todo(`should have a test`);
    });

    describe(`when the user is a project admin`, () => {
        it.todo(`should have a test`);
    });

    describe(`when the user is authenticated as an ordinary user`, () => {
        it.todo(`should have a test`);
    });
});
