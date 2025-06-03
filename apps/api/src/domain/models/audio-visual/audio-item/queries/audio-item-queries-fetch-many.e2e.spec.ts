import { CoscradUserRole, IAudioItemViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import httpStatusCodes from '../../../../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { assertQueryResult } from '../../../__tests__';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from './audio-item-query-repository.interface';
import { EventSourcedAudioItemViewModel } from './audio-item.view-model.event-sourced';

const endpoint = `/resources/audioItems`;

const userId = buildDummyUuid(2);

const publicAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: buildDummyUuid(10),
    name: buildMultilingualTextWithSingleItem('public audio item'),
    isPublished: true,
    accessControlList: new AccessControlList(),
});

const privateAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: buildDummyUuid(11),

    name: buildMultilingualTextWithSingleItem('private audio item'),
    isPublished: false,
    accessControlList: new AccessControlList(),
});

const privateAudioItemWithUserAccess = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: buildDummyUuid(12),
    name: buildMultilingualTextWithSingleItem(`audio item for user ${userId}`),
    isPublished: false,
    accessControlList: new AccessControlList().allowUser(userId),
});

const allAudioItems = [publicAudioItem, privateAudioItem, privateAudioItemWithUserAccess];

describe(`audio item queries- fetch many`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let audioItemQueryRepository: IAudioItemQueryRepository;

    const setItUp = async (userWithGroups?: CoscradUserWithGroups) => {
        // TODO Can we avoid this here?
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
            {
                ARANGO_DB_NAME: testDatabaseName,
                BASE_URL: 'https://jaybam.com/home',
            },
            {
                testUserWithGroups: userWithGroups,
            }
        ));

        audioItemQueryRepository = app.get(AUDIO_QUERY_REPOSITORY_TOKEN);
    };

    const seedInitialState = async () => {
        await audioItemQueryRepository.createMany(allAudioItems);
    };

    // let eventPublisher: ICoscradEventPublisher;
    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is unauthenticated (public user)`, () => {
        beforeAll(async () => {
            // no mock user
            await setItUp();
        });

        it(`should return public audio items only`, async () => {
            await assertQueryResult({
                app,
                endpoint,
                seedInitialState,
                expectedStatus: httpStatusCodes.ok,
                checkResponseBody: async ({ entities }: IIndexQueryResult<IAudioItemViewModel>) => {
                    // only the public audio item should be available to the public user
                    expect(entities).toHaveLength(1);

                    const { name } = entities[0];

                    expect(new MultilingualText(name).toDTO()).toEqual(
                        publicAudioItem.name.toDTO()
                    );
                },
            });
        });
    });

    describe(`when the user is an ordinary user (viewer)`, () => {
        const userWithGroups = new CoscradUserWithGroups(
            buildTestInstance(CoscradUser, {
                id: userId,
                roles: [CoscradUserRole.viewer],
            }),
            []
        );

        beforeAll(async () => {
            await setItUp(userWithGroups);
        });

        it(`should return public audio items and the audio item the user has ACL based access to`, async () => {
            await assertQueryResult({
                app,
                endpoint,
                seedInitialState,
                expectedStatus: httpStatusCodes.ok,
                checkResponseBody: async ({ entities }: IIndexQueryResult<IAudioItemViewModel>) => {
                    /**
                     * + public audio item
                     * + audio item with user in ACL
                     * - private audio item
                     */
                    expect(entities).toHaveLength(2);

                    const searchResultForPrivateAudioItem = entities.find(
                        ({ id }) => id === privateAudioItem.id
                    );

                    expect(searchResultForPrivateAudioItem).toBeFalsy();
                },
            });
        });
    });

    describe(`when the user is a project admin`, () => {
        const userWithGroups = new CoscradUserWithGroups(
            buildTestInstance(CoscradUser, {
                id: userId,
                roles: [CoscradUserRole.projectAdmin],
            }),
            []
        );

        beforeAll(async () => {
            await setItUp(userWithGroups);
        });

        it(`should return public audio items only`, async () => {
            await assertQueryResult({
                app,
                endpoint,
                seedInitialState,
                expectedStatus: httpStatusCodes.ok,
                checkResponseBody: async ({ entities }: IIndexQueryResult<IAudioItemViewModel>) => {
                    // all resources should be available to a project admin
                    expect(entities).toHaveLength(3);
                },
            });
        });
    });

    describe(`when the user is a COSCRAD admin`, () => {
        const userWithGroups = new CoscradUserWithGroups(
            buildTestInstance(CoscradUser, {
                id: userId,
                roles: [CoscradUserRole.superAdmin],
            }),
            []
        );

        beforeAll(async () => {
            await setItUp(userWithGroups);
        });

        it(`should return public audio items only`, async () => {
            await assertQueryResult({
                app,
                endpoint,
                seedInitialState,
                expectedStatus: httpStatusCodes.ok,
                checkResponseBody: async ({ entities }: IIndexQueryResult<IAudioItemViewModel>) => {
                    // all resources should be available to a COSCRAD admin
                    expect(entities).toHaveLength(3);
                },
            });
        });
    });
});
