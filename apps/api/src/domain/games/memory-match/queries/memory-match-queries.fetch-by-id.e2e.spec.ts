import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { IMemoryMatchRepository } from '../memory-match.repository.interface';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

describe(`when querying for a memory match: fetch by Id`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let memoryMatchRepository: IMemoryMatchRepository;

    let seedMemoryMatch: (rounds: MemoryMatchRound[]) => Promise<void>;

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await Test.createTestingModule({
                ARANGO_DATABASE_NAME: testDatabaseName,
            }));
        });
    });
});
