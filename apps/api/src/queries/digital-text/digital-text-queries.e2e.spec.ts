import { CoscradUserRole, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/Environment';
import httpStatusCodes, { HttpStatusCode } from '../../app/constants/httpStatusCodes';
import { AdminJwtGuard } from '../../app/controllers/command/command.controller';
import { DigitalTextModule } from '../../app/domain-modules/digital-text.module';
import { TagModule } from '../../app/domain-modules/tag.module';
import { UserManagementModule } from '../../app/domain-modules/user-management.module';
import { MockJwtAdminAuthGuard } from '../../authorization/mock-jwt-admin-auth-guard';
import { MockJwtAuthGuard } from '../../authorization/mock-jwt-auth-guard';
import { OptionalJwtAuthGuard } from '../../authorization/optional-jwt-auth-guard';
import { CoscradEventFactory, EventModule } from '../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../domain/common/build-multilingual-text-with-single-item';
import { EVENT_PUBLISHER_TOKEN } from '../../domain/common/events/constants';
import { ICoscradEvent, ICoscradEventPublisher } from '../../domain/common/events/interfaces';
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
import { PersistenceModule } from '../../persistence/persistence.module';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events/test-event-stream';
import { DynamicDataTypeFinderService } from '../../validation';
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
    // What good is this if the resource is published?
    // .andThen<ResourceReadAccessGrantedToUser>({
    //     type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
    //     payload: {
    //         userId: dummyQueryUserId,
    //     },
    // })
    .andThen<ResourcePublished>({
        type: 'RESOURCE_PUBLISHED',
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

const DEFAULT_DELAY = 500;

const TEST_TIMEOUT = DEFAULT_DELAY * 20;

const delay = (time: number = DEFAULT_DELAY) =>
    new Promise((resolve, _reject) => setTimeout(resolve, time));

/**
 * TODO Move this test to a higher level. Eventually, we may want to run the
 * API out of process and execute these queries against a local, live server.
 * This will optimize performance and solve some known memory leaks with
 * test libraries.
 *
 * TODO Write a separate test for `getAvailableCommands`.
 */
describe.only(`When querying for a digital text`, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let eventPublisher: ICoscradEventPublisher;

    const publishEvents = async (events: ICoscradEvent[]): Promise<void> => {
        for (const e of events) {
            eventPublisher.publish(e);

            /**
             * It's not ideal that we need to do this. When using an in-memory
             * event bus, there are technically race conditions. However, in practice
             * the user will have already seen the result of the previous command
             * take effect on the query layer before issuing a subsequent command.
             *
             * Keep in mind that we are just using this utility to set up the
             * desired initial state from an event stream. We may want a way to
             * apply event handlers sequentially in-memory for this taks.
             *
             * It does point out an interesting limitation of our design, though.
             * The event handlers are serving two purposes.:
             * 1. Calculate the delta for a given view document (note that sometimes a fetch is required to do this)
             * 2. Persist this delta
             *
             * It might be possible to separate out the logic for calculating
             * the delta, indepedent from the persistence.
             *
             * Alternatively, we could inject an in-memory query repository for
             * seeding tests and commit to the db only after all deltas have been applied.
             *
             * Do we need a separate test to ensure the event handlers indeed
             * persist the desired updates?
             */
            await delay();
        }
    };

    const setupTest = async (userWithGroups?: CoscradUserWithGroups): Promise<void> => {
        const mockConfigService = buildMockConfigService(
            {
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                GLOBAL_PREFIX: '',
            },
            buildConfigFilePath(Environment.test)
        );

        const testModuleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                EventModule,
                TagModule,
                UserManagementModule,
                DigitalTextModule,
                /**
                 * TODO We have imported generic events and handlers here.
                 * Let's consider having a `WebOfKnowledge` module at this point
                 * that includes any generic commands and events that could
                 * apply to all resources, categorizables, or aggregates.
                 */
                UserManagementModule,
            ],
            providers: [
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        })
            .overrideGuard(OptionalJwtAuthGuard)
            .useValue(new MockJwtAuthGuard(userWithGroups, true))
            .overrideGuard(AdminJwtGuard)
            .useValue(new MockJwtAdminAuthGuard(userWithGroups))
            .overrideProvider(ConfigService)
            .useValue(mockConfigService)
            .compile();

        app = testModuleRef.createNestApplication();

        databaseProvider = app.get(ArangoDatabaseProvider);

        testRepositoryProvider = new TestRepositoryProvider(
            databaseProvider,
            app.get(CoscradEventFactory),
            app.get(DynamicDataTypeFinderService)
        );

        await app.init();

        eventPublisher = app.get(EVENT_PUBLISHER_TOKEN);
    };

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
            await setupTest();
        });

        describe(`fetch single (by ID)`, () => {
            describe(`when the resource is published`, () => {
                it(
                    `should return the resource (consistent with the API contract)`,
                    async () => {
                        const eventHistoryForPublishedDigitalText =
                            eventStreamForPublishedDigitalText.as({
                                type: ResourceType.digitalText,
                                id: digitalTextId,
                            });

                        await publishEvents(eventHistoryForPublishedDigitalText);

                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(digitalTextId)
                        );

                        expect(res.status).toBe(HttpStatusCode.ok);
                    },
                    TEST_TIMEOUT
                );
            });

            describe(`when the resource is not published`, () => {
                it(
                    `should return not found`,
                    async () => {
                        const eventHistoryForUnpublishedDigitalText =
                            eventStreamForPrivateDigitalText.as({
                                id: digitalTextId,
                            });

                        await publishEvents(eventHistoryForUnpublishedDigitalText);

                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(digitalTextId)
                        );

                        expect(res.status).toBe(HttpStatusCode.notFound);
                    },
                    TEST_TIMEOUT
                );
            });
        });

        describe(`fetch many`, () => {
            it(
                `should only return published digital texts`,
                async () => {
                    await publishEvents(eventHistoryForMany);

                    const res = await request(app.getHttpServer()).get(indexEndpoint);

                    expect(res.status).toBe(httpStatusCodes.ok);
                },
                // TODO Do this for each test
                TEST_TIMEOUT
            );
        });
    });

    describe(`when the user is authenticated as a non-admin user`, () => {
        beforeAll(async () => {
            await setupTest(dummyUserWithGroups);
        });

        describe(`fetch single (by ID)`, () => {
            describe(`when there are no existing digital texts`, () => {
                // TODO Why does this one fail?
                it(
                    `should return not found`,
                    async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(buildDummyUuid(456))
                        );

                        expect(res.status).toBe(httpStatusCodes.notFound);
                    },
                    TEST_TIMEOUT
                );
            });

            describe(`when there is a digital text with the given ID`, () => {
                describe(`when the digital text is published`, () => {
                    it(
                        `should return the corresponding result`,
                        async () => {
                            const eventHistory = [
                                ...eventStreamForTaggingPublicDigitalText.as({
                                    id: tagId,
                                }),
                                ...eventStreamForPublishedDigitalText.as({
                                    id: digitalTextId,
                                }),
                            ];

                            await publishEvents(eventHistory);

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

                            const searchResult = result.tags.find(
                                ({ label }) => label === tagLabel
                            );

                            expect(searchResult.id).toBe(tagId);
                        },
                        TEST_TIMEOUT
                    );
                });

                describe(`when the digital text is not published`, () => {
                    describe(`when the user is authenticated`, () => {
                        describe(`when the user is not part of the digital text's ACL`, () => {
                            it(`should return not found`, async () => {
                                const eventHistoryForUnpublishedDigitalText =
                                    eventStreamForPrivateDigitalText.as({
                                        id: digitalTextId,
                                    });

                                await publishEvents(eventHistoryForUnpublishedDigitalText);

                                const res = await request(app.getHttpServer()).get(
                                    buildDetailEndpoint(digitalTextId)
                                );

                                expect(res.status).toBe(HttpStatusCode.notFound);
                            });
                        });

                        describe(`when the user is part of the digital text's ACL`, () => {
                            describe(`as a user`, () => {
                                it(
                                    `should succeed`,
                                    async () => {
                                        const eventHistoryForUnpublishedDigitalText =
                                            eventStreamForUnpublishedDigitalTextQueryUserCanAccess.as(
                                                {
                                                    id: digitalTextId,
                                                }
                                            );

                                        // Do we need to compile the app differently in this case? Where is the user injected?
                                        await publishEvents(eventHistoryForUnpublishedDigitalText);

                                        const res = await request(app.getHttpServer()).get(
                                            buildDetailEndpoint(digitalTextId)
                                        );

                                        expect(res.status).toBe(HttpStatusCode.ok);
                                    },
                                    TEST_TIMEOUT
                                );
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
                    it(
                        `should not return the unpublished digital text`,
                        async () => {
                            await publishEvents(eventHistoryForMany);

                            const res = await request(app.getHttpServer()).get(indexEndpoint);

                            expect(res.status).toBe(httpStatusCodes.ok);

                            /**
                             * + published
                             * + private, but user in ACL
                             * - private, user not in ACL
                             */
                            expect(res.body.entities).toHaveLength(2);
                        },
                        TEST_TIMEOUT
                    );
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
                await setupTest(
                    new CoscradUserWithGroups(
                        dummyUser.clone({
                            roles: [userRole],
                        }),
                        []
                    )
                );
            });

            describe(`detail queries (fetch by ID)`, () => {
                it(
                    `should allow the user to access the private resource`,
                    async () => {
                        await publishEvents(eventHistoryForMany);

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
                    },
                    TEST_TIMEOUT
                );
            });

            describe(`index queries (fetch many)`, () => {
                it(
                    `should allow the user to access private resources`,
                    async () => {
                        await publishEvents(eventHistoryForMany);

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
                    },
                    TEST_TIMEOUT
                );
            });
        });
    });
});
