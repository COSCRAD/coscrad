import { CoscradUserRole, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes, { HttpStatusCode } from '../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import { buildMultilingualTextWithSingleItem } from '../../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    DigitalTextCreated,
    PageAddedToDigitalText,
} from '../../domain/models/digital-text/commands';
import { ResourceReadAccessGrantedToUser } from '../../domain/models/shared/common-commands';
import { ResourcePublished } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { TagCreated } from '../../domain/models/tag/commands/create-tag/tag-created.event';
import { ResourceOrNoteTagged } from '../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { AggregateId } from '../../domain/types/AggregateId';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../persistence/repositories/arango-event-repository';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events/test-event-stream';
import { DigitalTextViewModel } from './digital-text.view-model';

const indexEndpoint = `/resources/digitalTexts`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

const digitalTextTitle = 'A Day in the Life';

const languageCodeForDigitalTextTitle = LanguageCode.English;

const dummyQueryUserId = buildDummyUuid(4);

const digitalTextId = buildDummyUuid(900);

const privateWithUserAccessId = buildDummyUuid(101);

const publishedId = buildDummyUuid(102);

const privateWithNoUserAccessId = buildDummyUuid(103);

// We require an existing user for ACL tests
const { user: users, userGroup: userGroups } = buildTestDataInFlatFormat();

const dummyUser = (users as CoscradUser[])[0].clone({
    authProviderUserId: `auth0|${dummyQueryUserId}`,
    id: dummyQueryUserId,
    roles: [CoscradUserRole.viewer],
});

const dummyGroup = (userGroups as CoscradUserGroup[])[0].clone({ userIds: [dummyUser.id] });

const dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, [dummyGroup]);

const dummyPageIdentifier = `IX`;

const eventStreamForPublishedDigitalText = new TestEventStream()
    .andThen<DigitalTextCreated>({
        type: 'DIGITAL_TEXT_CREATED',
        payload: {
            title: digitalTextTitle,
            languageCodeForTitle: languageCodeForDigitalTextTitle,
        },
    })
    .andThen<PageAddedToDigitalText>({
        type: 'PAGE_ADDED_TO_DIGITAL_TEXT',
        payload: {
            identifier: dummyPageIdentifier,
        },
    })
    .andThen<ResourceReadAccessGrantedToUser>({
        type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
        payload: {
            userId: dummyQueryUserId,
        },
    })
    .andThen<ResourcePublished>({
        type: 'RESOURCE_PUBLISHED',
        payload: {},
    });

const eventStreamForPrivateDigitalText = new TestEventStream()
    .andThen<DigitalTextCreated>({
        type: 'DIGITAL_TEXT_CREATED',
        payload: {
            title: digitalTextTitle,
            languageCodeForTitle: languageCodeForDigitalTextTitle,
        },
    })
    .andThen<PageAddedToDigitalText>({
        type: 'PAGE_ADDED_TO_DIGITAL_TEXT',
        payload: {
            identifier: dummyPageIdentifier,
        },
    });

const eventStreamForUnpublishedDigitalTextQueryUserCanAccess = new TestEventStream()
    .andThen<DigitalTextCreated>({
        type: 'DIGITAL_TEXT_CREATED',
        payload: {
            title: digitalTextTitle,
            languageCodeForTitle: languageCodeForDigitalTextTitle,
        },
    })
    .andThen<PageAddedToDigitalText>({
        type: 'PAGE_ADDED_TO_DIGITAL_TEXT',
        payload: {
            identifier: dummyPageIdentifier,
        },
    })
    .andThen<ResourceReadAccessGrantedToUser>({
        type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
        payload: {
            userId: dummyQueryUserId,
        },
    });

const tagLabel = 'trees';

const tagId = buildDummyUuid(126);

const eventStreamForTaggingPublicDigitalText = new TestEventStream()
    .andThen<TagCreated>({
        type: 'TAG_CREATED',
        payload: {
            label: tagLabel,
        },
    })
    .andThen<ResourceOrNoteTagged>({
        type: 'RESOURCE_OR_NOTE_TAGGED',
        payload: {
            taggedMemberCompositeIdentifier: {
                type: ResourceType.digitalText,
                id: digitalTextId,
            },
        },
    });

const labelForTagForPrivateDigitalText = 'animals';

const eventStreamForTaggingPrivateDigitalText = new TestEventStream()
    .andThen<TagCreated>({
        type: 'TAG_CREATED',
        payload: {
            label: labelForTagForPrivateDigitalText,
        },
    })
    .andThen<ResourceOrNoteTagged>({
        type: 'RESOURCE_OR_NOTE_TAGGED',
        payload: {
            taggedMemberCompositeIdentifier: {
                type: ResourceType.digitalText,
                id: privateWithUserAccessId,
            },
        },
    });

/**
 * TODO Move this test to a higher level. Eventually, we may want to run the
 * API out of process and execute these queries against a local, live server.
 * This will optimize performance and solve some known memory leaks with
 * test libraries.
 *
 * TODO Write a separate test for `getAvailableCommands`.
 */
describe(`When querying for a digital text`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    const eventHistoryForMany = [
        ...eventStreamForPublishedDigitalText.as({ id: publishedId }),
        ...eventStreamForPrivateDigitalText.as({ id: privateWithNoUserAccessId }),
        ...eventStreamForUnpublishedDigitalTextQueryUserCanAccess.as({
            id: privateWithUserAccessId,
        }),
        ...eventStreamForTaggingPrivateDigitalText.as({ id: buildDummyUuid(555) }),
    ];

    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                }
                // no authenticated user
            ));

            await app.init();
        });

        describe(`fetch single (by ID)`, () => {
            describe(`when the resource is published`, () => {
                it(`should return the resource (consistent with the API contract)`, async () => {
                    const eventHistoryForPublishedDigitalText =
                        eventStreamForPublishedDigitalText.as({
                            id: digitalTextId,
                        });

                    await app
                        .get(ArangoEventRepository)
                        .appendEvents(eventHistoryForPublishedDigitalText);

                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(digitalTextId)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);
                });
            });

            describe(`when the resource is not published`, () => {
                it(`should return not found`, async () => {
                    const eventHistoryForUnpublishedDigitalText =
                        eventStreamForPrivateDigitalText.as({
                            id: digitalTextId,
                        });

                    await app
                        .get(ArangoEventRepository)
                        .appendEvents(eventHistoryForUnpublishedDigitalText);

                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(digitalTextId)
                    );

                    expect(res.status).toBe(HttpStatusCode.notFound);
                });
            });
        });

        describe(`fetch many`, () => {
            it(`should only return published digital texts`, async () => {
                await app.get(ArangoEventRepository).appendEvents(eventHistoryForMany);

                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(httpStatusCodes.ok);
            });
        });
    });

    describe(`when the user is authenticated as a non-admin user`, () => {
        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                },
                {
                    testUserWithGroups: dummyUserWithGroups,
                }
            ));
        });

        describe(`fetch single (by ID)`, () => {
            describe(`when there are no existing digital texts`, () => {
                it(`should return not found`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(buildDummyUuid(456))
                    );

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });

            describe(`when there is a digital text with the given ID`, () => {
                describe(`when the digital text is published`, () => {
                    it(`should return the corresponding result`, async () => {
                        const eventHistory = [
                            ...eventStreamForTaggingPublicDigitalText.as({
                                id: tagId,
                            }),
                            ...eventStreamForPublishedDigitalText.as({
                                id: digitalTextId,
                            }),
                        ];

                        await app.get(ArangoEventRepository).appendEvents(eventHistory);

                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(digitalTextId)
                        );

                        expect(res.status).toBe(HttpStatusCode.ok);

                        const { body } = res;

                        const result = body as DigitalTextViewModel;

                        expect(result.id).toBe(digitalTextId);

                        const expectedTitle = buildMultilingualTextWithSingleItem(
                            digitalTextTitle,
                            languageCodeForDigitalTextTitle
                        ).toDTO();

                        expect(result.title).toEqual(expectedTitle);

                        const searchResult = result.tags.find(({ label }) => label === tagLabel);

                        expect(searchResult.id).toBe(tagId);
                    });
                });

                describe(`when the digital text is not published`, () => {
                    describe(`when the user is authenticated`, () => {
                        describe(`when the user is not part of the digital text's ACL`, () => {
                            it(`should return not found`, async () => {
                                const eventHistoryForUnpublishedDigitalText =
                                    eventStreamForPrivateDigitalText.as({
                                        id: digitalTextId,
                                    });

                                await app
                                    .get(ArangoEventRepository)
                                    .appendEvents(eventHistoryForUnpublishedDigitalText);

                                const res = await request(app.getHttpServer()).get(
                                    buildDetailEndpoint(digitalTextId)
                                );

                                expect(res.status).toBe(HttpStatusCode.notFound);
                            });
                        });

                        describe(`when the user is part of the digital text's ACL`, () => {
                            describe(`as a user`, () => {
                                it(`should succeed`, async () => {
                                    const eventHistoryForUnpublishedDigitalText =
                                        eventStreamForUnpublishedDigitalTextQueryUserCanAccess.as({
                                            id: digitalTextId,
                                        });

                                    // Do we need to compile the app differently in this case? Where is the user injected?
                                    await app
                                        .get(ArangoEventRepository)
                                        .appendEvents(eventHistoryForUnpublishedDigitalText);

                                    const res = await request(app.getHttpServer()).get(
                                        buildDetailEndpoint(digitalTextId)
                                    );

                                    expect(res.status).toBe(HttpStatusCode.ok);
                                });
                            });

                            describe(`as the member of a group`, () => {
                                // TODO Add `GRANT_RESOURCE_READ_ACCESS_TO_GROUP`
                                it.todo(`should succeed`);
                            });
                        });
                    });
                });
            });
        });

        describe(`fetch many`, () => {
            describe(`when the digital text is not published`, () => {
                describe(`when the user does not have read access`, () => {
                    it(`should not return the unpublished digital text`, async () => {
                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForMany);

                        const res = await request(app.getHttpServer()).get(indexEndpoint);

                        expect(res.status).toBe(httpStatusCodes.ok);

                        /**
                         * + published
                         * + private, but user in ACL
                         * - private, user not in ACL
                         */
                        expect(res.body.entities).toHaveLength(2);
                    });
                });
            });
        });
    });

    (
        [
            [CoscradUserRole.superAdmin, 'when the user is a COSCRAD admin'],
            [CoscradUserRole.projectAdmin, 'when the user is a project admin'],
        ] as const
    ).forEach(([userRole, description]) => {
        describe(description, () => {
            beforeAll(async () => {
                ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: testDatabaseName,
                    },
                    {
                        testUserWithGroups: new CoscradUserWithGroups(
                            dummyUser.clone({
                                roles: [userRole],
                            }),
                            []
                        ),
                    }
                ));
            });

            describe(`detail queries (fetch by ID)`, () => {
                it(`should allow the user to access the private resource`, async () => {
                    await app.get(ArangoEventRepository).appendEvents(eventHistoryForMany);

                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(privateWithNoUserAccessId)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);

                    /**
                     * This if statement is effectively a filter for our test
                     * case builder pattern. We only want to snapshot the response
                     * once for one specific class of user. We want this to be
                     * an admin user, because admin users have access to all
                     * data, including command info (available actions).
                     * Finally, we do this for the project admin, as queries
                     * for this user are by far more common than for coscrad admin
                     * in practice.
                     */
                    if (userRole === CoscradUserRole.projectAdmin) {
                        /**
                         * Whenever this snapshot changes, it means the API contract
                         * with the client has changed. At a practical level, this means
                         * we have introduced potentially breaking changes or at least
                         * enhancements that now must be supported on the front-end.
                         *
                         * Snapshotting forces us to be intentional about making
                         * such changes in a controlled manner.
                         */
                        expect(res.body).toMatchSnapshot();
                    }
                });
            });

            describe(`index queries (fetch many)`, () => {
                it(`should allow the user to access private resources`, async () => {
                    await app.get(ArangoEventRepository).appendEvents(eventHistoryForMany);

                    const res = await request(app.getHttpServer()).get(indexEndpoint);

                    const numberOfDigitalTextsIncludingPrivateTexts = 3;

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body.entities).toHaveLength(
                        numberOfDigitalTextsIncludingPrivateTexts
                    );

                    /**
                     * This if statement is effectively a filter for our test
                     * case builder pattern. We only want to snapshot the response
                     * once for one specific class of user. We want this to be
                     * an admin user, because admin users have access to all
                     * data, including command info (available actions).
                     * Finally, we do this for the project admin, as queries
                     * for this user are by far more common than for coscrad admin
                     * in practice.
                     */
                    if (userRole === CoscradUserRole.projectAdmin) {
                        /**
                         * This is to catch breaking changes in the API contract with
                         * the client. See the above comment for the corresponding detail
                         * endpoint test case.
                         */
                        expect(res.body).toMatchSnapshot();
                    }
                });
            });
        });
    });
});
