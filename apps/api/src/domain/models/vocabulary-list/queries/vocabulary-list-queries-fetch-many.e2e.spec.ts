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
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { VocabularyListViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { buildTestInstance } from '../../../../test-data/utilities';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextFromBilingualText } from '../../../common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../__tests__/utilities/dummySystemUserId';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { ArangoVocabularyListQueryRepository } from '../repositories';
import { IVocabularyListQueryRepository } from './vocabulary-list-query-repository.interface';

const vocabularyListName = 'to swim';

const languageCodeForVocabularyListName = LanguageCode.English;

const termOriginalText = 'I swim (public term)';

const termOriginalLanguageCode = LanguageCode.Chilcotin;

const termTranslation = 'I swim (English)';

const termTranslationLanguageCode = LanguageCode.English;

const indexEndpoint = `/resources/vocabularyLists`;

/**
 * Note that:
 * 1. users are persisted using state-based persistence (and this probably won't change to event sourcing soon)
 * 2. we should use `buildTestInstance` in the future.
 */
const ordinaryUser = getValidAggregateInstanceForTest(AggregateType.user).clone({
    id: dummySystemUserId,
});

const publishedTerm: TermViewModel = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(101),
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
    contributions: [
        {
            id: buildDummyUuid(374),
            fullName: 'Term Contributor',
        },
    ],
});

const privateTerm = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(102),
    isPublished: false,
    accessControlList: new AccessControlList().toDTO(),
    name: buildMultilingualTextWithSingleItem('private term', LanguageCode.Chilcotin),
});

const unpublishedTermOrdinaryUserCanAccess = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(103),
    isPublished: false,
    name: buildMultilingualTextWithSingleItem(
        'private term, but with ACL access for user',
        LanguageCode.Chilcotin
    ),
    accessControlList: new AccessControlList().allowUser(dummySystemUserId).toDTO(),
});

const publishedVocabularyList = buildTestInstance(VocabularyListViewModel, {
    id: buildDummyUuid(1),
    isPublished: true,
    accessControlList: new AccessControlList().toDTO(),
    name: buildMultilingualTextFromBilingualText(
        { text: vocabularyListName, languageCode: languageCodeForVocabularyListName },
        // we check that this comes through in the snapshot
        {
            text: `${vocabularyListName} (translation)`,
            languageCode: LanguageCode.Chilcotin,
        }
    ),
    contributions: [
        {
            id: buildDummyUuid(374),
            fullName: 'Test McContributor',
        },
    ],
});

const privateVocabularyList = buildTestInstance(VocabularyListViewModel, {
    id: buildDummyUuid(2),
    isPublished: false,
    accessControlList: new AccessControlList().toDTO(),
});

const unpublishedVocabularyListOrdinaryUserCanAccess = buildTestInstance(VocabularyListViewModel, {
    id: buildDummyUuid(3),
    isPublished: false,
    accessControlList: new AccessControlList().allowUser(dummySystemUserId).toDTO(),
});

const buildEntryForTerm = (term: TermViewModel) => ({
    term,
    variableValues: {},
});

// TODO check that contributors are joined in
// const existingContributor = getValidAggregateInstanceForTest(AggregateType.contributor)

describe(`when querying for a vocabulary list: fetch many`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let connectionProvider: ArangoConnectionProvider;

    let vocabularyListQueryRepository: IVocabularyListQueryRepository;

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        // TODO remove all such calls across all tests
        // await databaseProvider.getDatabaseForCollection('term__VIEWS').clear();

        // await databaseProvider.getDatabaseForCollection('vocabularyList__VIEWS').clear();
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
        });

        describe(`when there is a vocabulary list with the given ID`, () => {
            describe(`when the vocabulary list is published`, () => {
                describe(`when each vocabulary list has one entry for a published term`, () => {
                    beforeEach(async () => {
                        await vocabularyListQueryRepository.createMany([
                            // available to public user
                            publishedVocabularyList.clone({
                                entries: [buildEntryForTerm(publishedTerm)],
                            }),
                            // not available
                            privateVocabularyList.clone({
                                entries: [buildEntryForTerm(publishedTerm)],
                            }),
                            // not available
                            unpublishedVocabularyListOrdinaryUserCanAccess.clone({
                                entries: [buildEntryForTerm(publishedTerm)],
                            }),
                        ]);
                    });

                    it(`should return the correct vocabulary list view`, async () => {
                        const res = await request(app.getHttpServer()).get(indexEndpoint);

                        expect(res.status).toBe(HttpStatusCode.ok);

                        const body = res.body as IIndexQueryResult<IVocabularyListViewModel>;

                        const { entities } = body;

                        expect(entities).toHaveLength(1);

                        /**
                         * Here we make more detailed assertions on just one of the vocabulary lists.
                         */
                        const { name: namedto, entries } = entities[0];

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

                        /**
                         * We snapshot one and only one query response here in
                         * the happy path. This serves as a contract test. If
                         * this snapshot changes, it indicates that the client
                         * may require corresponding updates.
                         */
                        expect(body).toMatchSnapshot();
                    });
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
