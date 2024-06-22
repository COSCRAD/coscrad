import { CoscradUserRole, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { ResourceReadAccessGrantedToUser } from '../../domain/models/shared/common-commands';
import { ResourcePublished } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { TagCreated } from '../../domain/models/tag/commands/create-tag/tag-created.event';
import { ResourceOrNoteTagged } from '../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event';
import { TermCreated, TermTranslated } from '../../domain/models/term/commands';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../persistence/repositories/arango-event-repository';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events';

const indexEndpoint = `/resources/terms`;

// We require an existing user for ACL tests
const dummyQueryUserId = buildDummyUuid(4);

const { user: users, userGroup: userGroups } = buildTestDataInFlatFormat();

const dummyUser = (users as CoscradUser[])[0].clone({
    authProviderUserId: `auth0|${dummyQueryUserId}`,
    id: dummyQueryUserId,
    roles: [CoscradUserRole.viewer],
});

const dummyGroup = (userGroups as CoscradUserGroup[])[0].clone({ userIds: [dummyUser.id] });

const dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, [dummyGroup]);

// Set up test data (use event sourcing to set up state)
const termText = `Term (in the language)`;

const originalLanguage = LanguageCode.Haida;

const termTranslation = `Term (in English)`;

const translationLanguage = LanguageCode.English;

const termId = buildDummyUuid(101);

const termIdUnpublishedNoUserAccessId = buildDummyUuid(102);

const termIdUnpublishedWithUserAccessId = buildDummyUuid(103);

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
    payload: {
        text: termText,
        languageCode: originalLanguage,
    },
});

const termTranslated = termCreated.andThen<TermTranslated>({
    type: 'TERM_TRANSLATED',
    payload: {
        translation: termTranslation,
        languageCode: translationLanguage,
    },
});

const termPrivateThatUserCanAccess = termTranslated.andThen<ResourceReadAccessGrantedToUser>({
    type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
    payload: {
        userId: dummyQueryUserId,
    },
});

const termPublished = termTranslated.andThen<ResourcePublished>({
    type: 'RESOURCE_PUBLISHED',
});

const labelForTagForPrivateTerm = 'animals';

const termPrivateForTagging = new TestEventStream()
    .andThen<TagCreated>({
        type: 'TAG_CREATED',
        payload: {
            label: labelForTagForPrivateTerm,
        },
    })
    .andThen<ResourceOrNoteTagged>({
        type: 'RESOURCE_OR_NOTE_TAGGED',
        payload: {
            taggedMemberCompositeIdentifier: {
                type: ResourceType.term,
                id: termIdUnpublishedWithUserAccessId,
            },
        },
    });

// const promptTermId = buildDummyUuid(2)

describe(`when querying for a term: fetch many`, () => {
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
        ...termPublished.as({ id: termId }),
        ...termTranslated.as({ id: termIdUnpublishedNoUserAccessId }),
        ...termPrivateThatUserCanAccess.as({
            id: termIdUnpublishedWithUserAccessId,
        }),
        ...termPrivateForTagging.as({ id: buildDummyUuid(555) }),
    ];

    eventHistoryForMany.forEach((event) => {
        const {
            payload: { aggregateCompositeIdentifier },
        } = event;

        console.log({ aggregateCompositeIdentifier });
    });

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

        it(`should only return published terms`, async () => {
            await app.get(ArangoEventRepository).appendEvents(eventHistoryForMany);

            const res = await request(app.getHttpServer()).get(indexEndpoint);

            expect(res.status).toBe(httpStatusCodes.ok);

            const { body } = res;

            console.log({ body });
        });
    });
});
