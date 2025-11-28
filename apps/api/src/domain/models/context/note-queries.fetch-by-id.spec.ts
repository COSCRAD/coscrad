import { INestApplication } from '@nestjs/common';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { AggregateId } from '../../types/AggregateId';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { INoteQueryRepository } from './repositories/note-query-repository.interface';

const indexEndpoint = 'resources/notes';

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

const noteId = buildDummyUuid(2);

describe(`when querying for a note: fetch by Id`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let noteQueryRepository: INoteQueryRepository;

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when there is a note with the given ID`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();
        });
        it(`should find it`, () => {});
    });
});
