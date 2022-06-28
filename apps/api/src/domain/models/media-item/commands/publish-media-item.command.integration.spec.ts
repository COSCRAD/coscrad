import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../types/DTO';
import getValidResourceInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidResourceInstanceForTest';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { assertCommandSuccess } from '../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { MediaItem } from '../entities/media-item.entity';
import { PublishMediaItem } from './publish-media-item.command';
import { PublishMediaItemCommandHandler } from './publish-media-item.command-handler';

const commandType = 'PUBLISH_MEDIA_ITEM';

const dummyUUID = buildDummyUuid();

const buildValidCommandFSA = (): FluxStandardAction<DTO<PublishMediaItem>> => ({
    type: commandType,
    payload: { id: dummyUUID },
});

const unpublishedMediaItem = getValidResourceInstanceForTest(ResourceType.mediaItem).clone({
    published: false,
    id: dummyUUID,
});

const buildFullSnapshot = (preExistingMediaItem: MediaItem) =>
    buildInMemorySnapshot({
        resources: {
            mediaItem: [preExistingMediaItem],
        },
    });

describe('PublishMediaItem', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, arangoConnectionProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateRandomTestDatabaseName(),
            }));

        commandHandlerService.registerHandler(
            commandType,
            new PublishMediaItemCommandHandler(testRepositoryProvider, idManager, ResourceType.song)
        );

        assertionHelperDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                buildValidCommandFSA,
                initialState: buildFullSnapshot(unpublishedMediaItem),
            });
        });
    });
});
