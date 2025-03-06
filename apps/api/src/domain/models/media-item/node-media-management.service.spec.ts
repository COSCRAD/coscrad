import { AggregateType, CoscradUserRole, MIMEType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import buildMockConfigService from '../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../app/config/buildConfigFilePath';
import { Environment } from '../../../app/config/constants/Environment';
import { JwtStrategy } from '../../../authorization/jwt.strategy';
import { MockJwtStrategy } from '../../../authorization/mock-jwt.strategy';
import { NotFound } from '../../../lib/types/not-found';
import { ArangoCollectionId } from '../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import getValidAggregateInstanceForTest from '../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IRepositoryForAggregate } from '../../repositories/interfaces/repository-for-aggregate.interface';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { CoscradUserWithGroups } from '../user-management/user/entities/user/coscrad-user-with-groups';
import { MediaItem } from './entities/media-item.entity';
import { MediaItemModule } from './media-item.module';
import { IMediaManager, MEDIA_MANGAER_INJECTION_TOKEN } from './media-manager.interface';

const testUser = getValidAggregateInstanceForTest(AggregateType.user).clone({
    roles: [CoscradUserRole.viewer],
});

// TODO Use new test data helper instead
const dummyMediaItem = getValidAggregateInstanceForTest(AggregateType.mediaItem);

const mediaItems = [1, 2, 3].map((sequentialId) =>
    dummyMediaItem.clone({
        id: buildDummyUuid(sequentialId),
        title: `test media item #${sequentialId}`,
        published: true,
    })
);

const testUserWithGroups = new CoscradUserWithGroups(testUser, []);

describe(`NodeMediaManagementService`, () => {
    let manager: IMediaManager;

    let app: INestApplication;

    beforeAll(async () => {
        const testModuleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync(), MediaItemModule],
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
            .overrideProvider(JwtStrategy)
            .useValue(new MockJwtStrategy())
            .compile();

        app = testModuleRef.createNestApplication();

        manager = app.get<IMediaManager>(MEDIA_MANGAER_INJECTION_TOKEN);
    });

    beforeEach(async () => {
        // TODO remove media items from `ArangoCollectionId`
        await app
            .get(ArangoDatabaseProvider)
            .getDatabaseForCollection(ArangoCollectionId.media_items)
            .clear();
    });

    describe(`exists`, () => {
        const targetMediaItem = mediaItems[0];

        beforeEach(async () => {
            await app
                .get<IRepositoryForAggregate<MediaItem>>(
                    'MEDIA_ITEM_COMMAND_REPOSITORY_INJECTION_TOKEN'
                )
                .create(targetMediaItem);
        });

        describe(`when the  media item exists`, () => {
            it('should return true', async () => {
                const result = await manager.exists(targetMediaItem.id);

                expect(result).toBe(true);
            });
        });

        describe(`when the media item does not exist`, () => {
            it(`should return false`, async () => {
                const result = await manager.exists(buildDummyUuid(950));

                expect(result).toBe(false);
            });
        });
    });

    describe(`fetchById`, () => {
        const targetMediaItem = mediaItems[0];

        describe(`when the media item exists`, () => {
            it(`should return the media item`, async () => {
                await app
                    .get<IRepositoryForAggregate<MediaItem>>(
                        'MEDIA_ITEM_COMMAND_REPOSITORY_INJECTION_TOKEN'
                    )
                    .create(targetMediaItem);

                const result = await manager.fetchById(targetMediaItem.id);

                expect(result).not.toBe(NotFound);

                expect((result as MediaItem).title).toBe('test media item #1');
            });
        });

        describe(`when the media item does not exist`, () => {
            it(`should return not found`, async () => {
                const result = await manager.fetchById(buildDummyUuid(850));

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        describe(`when there are no media items`, () => {
            it(`should return an empty array`, async () => {
                const result = await manager.fetchMany(testUserWithGroups);

                expect(result).toEqual([]);
            });
        });

        describe(`when there are some media items`, () => {
            beforeEach(async () => {
                await app
                    .get<IRepositoryForAggregate<MediaItem>>(
                        'MEDIA_ITEM_COMMAND_REPOSITORY_INJECTION_TOKEN'
                    )
                    .createMany(mediaItems);
            });

            it(`should return the media items`, async () => {
                const result = await manager.fetchMany(testUserWithGroups);

                // sanity check
                expect(result).toHaveLength(3);
            });
        });
    });

    describe(`discover`, () => {
        const staticAssetsDir = '__static__';

        const filename = 'desk-593327_640.jpg';

        const validSourceFilepath = `__cli-command-test-inputs__/ingest-media-items/mediaItemsOnly/${filename}`;

        const validDestinationFilepath = `${staticAssetsDir}/${filename}`;

        beforeEach(async () => {
            if (!existsSync(staticAssetsDir)) {
                mkdirSync(staticAssetsDir);
            }

            if (existsSync(validDestinationFilepath)) {
                unlinkSync(validDestinationFilepath);
            }
        });

        describe(`when the file exists`, () => {
            describe(`when the file is of a supported media item type`, () => {
                it(`should create the corresponding media item and copy the file`, async () => {
                    // Should we provide additional metadata here, such as the `title`?
                    await manager.discover(validSourceFilepath);

                    const allMediaItems = await manager.fetchMany(testUserWithGroups);

                    expect(allMediaItems).toHaveLength(1);

                    expect(allMediaItems[0].mimeType).toBe(MIMEType.jpg);

                    const wasFileCopiedToStatic = existsSync(
                        `${staticAssetsDir}/desk-593327_640.jpg`
                    );

                    expect(wasFileCopiedToStatic).toBe(true);
                });
            });

            /**
             * These are just sanity checks that the errors flow through properly.
             * We test the actual validation logic with a lower level unit test.
             */
            describe(`when the file is not a supported media item type`, () => {
                it.todo(`should fail`);
            });

            /**
             * These are just sanity checks that the errors flow through properly.
             * We test the actual validation logic with a lower level unit test.
             */
            describe(`when the mimeType is inconsistent with the extension`, () => {
                it.todo(`should return the expected error`);
            });
        });

        describe(`when the file does note exist`, () => {
            it.todo(`should have a test`);
        });
    });
});
