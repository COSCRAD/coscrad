import { AggregateType, HttpStatusCode, MIMEType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import * as request from 'supertest';
import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { DeluxeInMemoryStore } from '../../../domain/types/DeluxeInMemoryStore';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import setUpIntegrationTest from '../__tests__/setUpIntegrationTest';

const mediaItemBaseEndpoint = `/resources/mediaItems`;

const buildFindByNameQueryUrl = (name: string) => `${mediaItemBaseEndpoint}/download?name=${name}`;

const staticAssetDestinationDirectory = '__static__';

const mediaItemName = 'biodynamic-theme-song-forever';

const extension = 'mp3';

const mediaItemPath = `${staticAssetDestinationDirectory}/${mediaItemName}.${extension}`;

const testFilePath = `__cli-command-test-inputs__/ingest-media-items/mediaItemsOnly/biodynamic-theme-song-forever.mp3`;

const mediaItemToFind = getValidAggregateInstanceForTest(AggregateType.mediaItem).clone({
    title: mediaItemName,
    published: true,
    // this lines up with the file name, which exists in __static__
    mimeType: MIMEType.mp3,
});

describe('when querying for a media item by name (/resources/mediaItems/download?name=foo)', () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        }));

        if (!existsSync(staticAssetDestinationDirectory)) {
            mkdirSync(staticAssetDestinationDirectory);
        }

        if (!existsSync(mediaItemPath)) {
            copyFileSync(testFilePath, mediaItemPath);
        }
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();

        databaseProvider.close();
    });

    describe(`when there is no media item with the given name`, () => {
        const bogusName = 'I do not exist';

        it('should return a 404', () => {
            request(app.getHttpServer())
                .get(buildFindByNameQueryUrl(bogusName))
                .expect(HttpStatusCode.notFound);
        });
    });

    describe(`when the media item exists`, () => {
        describe(`when the user is not logged in`, () => {
            describe(`when the media item is published`, () => {
                beforeEach(async () => {
                    await testRepositoryProvider.addFullSnapshot(
                        new DeluxeInMemoryStore({
                            [AggregateType.mediaItem]: [mediaItemToFind],
                        }).fetchFullSnapshotInLegacyFormat()
                    );
                });

                it.only(`should return the expected binary`, async () => {
                    const endpoint = buildFindByNameQueryUrl(mediaItemName);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    // TODO verify that the appropriate binary is there
                });
            });

            describe(`when the media item is not published`, () => {
                it.todo(`should return not found`);
            });

            describe(`when the name parameter is invalidly formatted`, () => {
                it.todo(`should return a 400 (user error)`);
            });
        });

        describe(`when the user is authenticated as....`, () => {
            it.todo(`similar test cases, please`);
        });
    });
});
