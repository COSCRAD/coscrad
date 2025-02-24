import {
    AggregateType,
    CoscradUserRole,
    IDetailQueryResult,
    IMultilingualTextItem,
    IVocabularyListViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes, { HttpStatusCode } from '../../../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextFromBilingualText } from '../../../common/build-multilingual-text-from-bilingual-text';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { buildTestVocabularyListView } from './__tests__';
import {
    IVocabularyListQueryRepository,
    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN,
} from './vocabulary-list-query-repository.interface';

const vocabularyListId = buildDummyUuid(4);

const termId = buildDummyUuid(5);

const termOriginalText = 'I swim';

const termOriginalLanguageCode = LanguageCode.Chilcotin;

const termTranslation = 'I am swimming (English)';

const termTranslationLanguageCode = LanguageCode.English;

const indexEndpoint = `/resources/vocabularyLists`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

/**
 * TODO We may want to event source our test setup to give us a very high
 * level of confidence that our back-end is working from event handler
 * to query endpoint. Eagerly joining in terms, tags, notes, etc. into vocabulary
 * lists, for example, is a big risk.
 */
const publishedTerm: TermViewModel = TermViewModel.fromDto({
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

// TODO check that contributors are joined in- let's do this now
// const existingContributor = getValidAggregateInstanceForTest(AggregateType.contributor)

const publishedVocabularyList = buildTestVocabularyListView({
    id: vocabularyListId,
    isPublished: true,
    entries: [
        {
            term: publishedTerm,
            variableValues: {},
        },
    ],
});

const publishedVocabularyListWithUnpublishedTerm = publishedVocabularyList.clone({
    isPublished: true,
    entries: [
        {
            term: publishedTerm.clone({
                isPublished: false,
            }),
            variableValues: {},
        },
    ],
});

/**
 * TODO[test-coverage]: include test case with import history
 *
 * This test is being reworked on a separate branch. Opt back in when rebasing.
 */

const testUserId = buildDummyUuid(55);

const testUserGroupId = buildDummyUuid(56);

const testUser = getValidAggregateInstanceForTest(AggregateType.user).clone({
    id: testUserId,
    roles: [CoscradUserRole.viewer],
});

const testUserGroup = getValidAggregateInstanceForTest(AggregateType.userGroup).clone({
    id: testUserGroupId,
    userIds: [testUserId, buildDummyUuid(876)],
});

const nonAdminUserWithGroups = new CoscradUserWithGroups(testUser, [testUserGroup]);

const _privateVocabularyListWithUserPermissions = publishedVocabularyList.clone({
    accessControlList: new AccessControlList({
        allowedUserIds: [nonAdminUserWithGroups.id, buildDummyUuid(908)],
        allowedGroupIds: [nonAdminUserWithGroups.groups[0].id, buildDummyUuid(909)],
    }),
});

interface AssertQueryResultParams<TResponseBody = unknown> {
    app: INestApplication;
    seedInitialState: () => Promise<void>;
    endpoint: string;
    expectedStatus: HttpStatusCode;
    checkResponseBody?: (body: TResponseBody) => Promise<void>;
}

const assertQueryResult = async ({
    app,
    seedInitialState,
    endpoint,
    expectedStatus,
    checkResponseBody,
}: AssertQueryResultParams) => {
    await seedInitialState();

    const res = await request(app.getHttpServer()).get(endpoint);

    expect(res.status).toBe(expectedStatus);

    if (typeof checkResponseBody === 'function') {
        await checkResponseBody(res.body);
    }
};

describe(`when querying for a vocabulary list: fetch by ID`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

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
        });

        describe(`when there is a vocabulary list with the given ID`, () => {
            describe(`when the vocabulary list is published`, () => {
                describe(`when the term which appears as an entry is published`, () => {
                    beforeEach(async () => {
                        // TODO remove all manual calls to clear views from other tests as it is now part of `testSetup`
                        await testRepositoryProvider.testSetup();
                    });

                    it(`should return the correct vocabulary list view`, async () => {
                        await assertQueryResult({
                            app,
                            seedInitialState: async () => {
                                await app
                                    .get<IVocabularyListQueryRepository>(
                                        VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN
                                    )
                                    .create(publishedVocabularyList);
                            },
                            endpoint: buildDetailEndpoint(vocabularyListId),
                            expectedStatus: HttpStatusCode.ok,
                            checkResponseBody: async ({
                                name: namedto,
                                entries,
                            }: IDetailQueryResult<IVocabularyListViewModel>) => {
                                const foundName = new MultilingualText(namedto);

                                const { text: foundText, languageCode: foundLanguageCode } =
                                    foundName.getOriginalTextItem();

                                expect(foundText).toBe(publishedVocabularyList.name.items[0].text);

                                expect(foundLanguageCode).toBe(
                                    publishedVocabularyList.name.items[0].languageCode
                                );

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

                                expect(foundTermTranslationLanguageCode).toBe(
                                    termTranslationLanguageCode
                                );
                                // TODO check additional state
                            },
                        });
                    });
                });

                describe(`when the term which appears as an entry is **not** published`, () => {
                    beforeEach(async () => {
                        await testRepositoryProvider.testSetup();
                    });

                    it(`should return the correct vocabulary list view`, async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(vocabularyListId),
                            expectedStatus: HttpStatusCode.ok,
                            seedInitialState: async () => {
                                await app
                                    .get<IVocabularyListQueryRepository>(
                                        VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN
                                    )
                                    .create(publishedVocabularyListWithUnpublishedTerm);
                            },
                            checkResponseBody: async (
                                body: IDetailQueryResult<IVocabularyListViewModel>
                            ) => {
                                const { name: namedto, entries } = body;

                                const foundName = new MultilingualText(namedto);

                                const { text: foundText, languageCode: foundLanguageCode } =
                                    foundName.getOriginalTextItem();

                                expect(foundText).toBe(publishedVocabularyList.name.items[0].text);

                                expect(foundLanguageCode).toBe(
                                    publishedVocabularyList.name.items[0].languageCode
                                );

                                /**
                                 * Note that the following is crucial. Because the
                                 * term is not published, it should not be returned
                                 * from the query.
                                 */
                                expect(entries).toHaveLength(0);
                            },
                        });
                    });
                });
            });

            describe(`when the vocabulary list is not published`, () => {
                beforeEach(async () => {
                    await testRepositoryProvider.testSetup();
                });

                it(`should return not found`, async () => {
                    await assertQueryResult({
                        app,
                        seedInitialState: async () => {
                            await app
                                .get<IVocabularyListQueryRepository>(
                                    VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN
                                )
                                .create(
                                    publishedVocabularyList.clone({
                                        isPublished: false,
                                    })
                                );
                        },
                        endpoint: buildDetailEndpoint(vocabularyListId),
                        expectedStatus: HttpStatusCode.notFound,
                    });
                });
            });
        });

        describe(`when there is no vocabulary list with the given ID`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(buildDummyUuid(456))
                );

                expect(res.status).toBe(httpStatusCodes.notFound);
            });
        });
    });

    describe(`when the user is authenticated as an ordinary user`, () => {
        beforeEach(async () => {
            // TODO avoid using `setUpIntegrationTest` here
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                },
                {
                    testUserWithGroups: nonAdminUserWithGroups,
                }
            ));
        });

        beforeEach(async () => {
            await testRepositoryProvider.testSetup();
        });

        describe(`when the term that the is subject of an entry is published`, () => {
            it('should return the given term', async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(vocabularyListId),
                    expectedStatus: HttpStatusCode.ok,
                    seedInitialState: async () => {
                        await app
                            .get<IVocabularyListQueryRepository>(
                                VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN
                            )
                            .create(publishedVocabularyList);
                    },
                    checkResponseBody: async ({
                        entries,
                    }: IDetailQueryResult<IVocabularyListViewModel>) => {
                        expect(entries).toHaveLength(1);

                        expect(entries[0].term.id).toBe(publishedTerm.id);
                    },
                });
            });
        });

        describe(`when the term that is subject of an entry is not published (and the user has no query ACL level permissions)`, () => {
            beforeEach(async () => {
                await testRepositoryProvider.testSetup();
            });

            it(`should not return the given term`, async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(vocabularyListId),
                    expectedStatus: HttpStatusCode.ok,
                    seedInitialState: async () => {
                        const publishedVocabularyListWithUnpublishedTerm =
                            publishedVocabularyList.clone({
                                entries: [
                                    {
                                        term: publishedTerm.clone({
                                            isPublished: false,
                                            // empty
                                            accessControlList: new AccessControlList().toDTO(),
                                        }),
                                    },
                                ],
                            });

                        await app
                            .get<IVocabularyListQueryRepository>(
                                VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN
                            )
                            .create(publishedVocabularyListWithUnpublishedTerm);
                    },
                    checkResponseBody: async ({
                        entries,
                    }: IDetailQueryResult<IVocabularyListViewModel>) => {
                        expect(entries).toHaveLength(0);
                    },
                });
            });
        });

        describe(`when the term that is subject of an entry is not published, but the user has priviliged read access via a query ACL`, () => {
            it.todo(`should return the term as one of the entries`);
        });
    });

    describe(`when the user is a COSCRAD admin`, () => {
        it.todo(`should have a test`);
    });

    describe(`when the user is a project admin`, () => {
        it.todo(`should have a test`);
    });

    describe(`when the user is authenticated as an ordinary user`, () => {
        it.todo(`should have a test`);

        it.todo(`should respect the ACLs of terms contained as entries`);
    });
});
