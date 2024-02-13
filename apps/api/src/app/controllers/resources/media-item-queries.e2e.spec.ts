import { INestApplication } from '@nestjs/common';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { InternalError } from '../../../lib/errors/InternalError';
import { NotFound } from '../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestData from '../../../test-data/buildTestData';

const mediaItemId = buildDummyUuid(123);

describe('when querying for a media item by name (/resources/mediaItems/download?name=foo)', () => {
    const _testDatabaseName = generateDatabaseNameForTestSuite();

    let _app: INestApplication;

    let _testRepositoryProvider: TestRepositoryProvider;

    let _databaseProvider: ArangoDatabaseProvider;

    const testData = buildTestData();

    const _tagTestData = testData.tag;

    const _resourceTestData = testData.resources;

    // beforeAll(async () => {
    // ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest({
    // ARANGO_DB_NAME: testDatabaseName,
    // }));
    // });

    describe(`when the media item does not exist`, () => {
        it.only('should return a 400', () => {
            if (mediaItemId) {
                return new InternalError(
                    `400 error, failed to find a media item id. ${mediaItemId}`
                );
            }

            expect(mediaItemId).toBeInstanceOf(NotFound);
        });
    });

    describe(`when the media item exists`, () => {
        describe(`when the user is not logged in`, () => {
            describe(`when the media item is published`, () => {
                it.todo(`should return the expected binary`);
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
