import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import { CoscradUser } from '../../domain/models/user-management/user/entities/coscrad-user.entity';
import buildInMemorySnapshot from '../../domain/utilities/buildInMemorySnapshot';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { NotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import buildTestData from '../../test-data/buildTestData';
import { ArangoConnectionProvider } from '../database/arango-connection.provider';
import generateRandomTestDatabaseName from './__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';

describe('Arango Repository Provider > getUserRepository', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    const testData = buildTestData();

    const numberOfUsers = 12;

    const validUser = testData.users[0];

    const users = Array(numberOfUsers)
        .fill(0)
        .map((_, index) =>
            validUser.clone({
                id: index.toString(),
                username: `username-${index}`,
            })
        );

    const fullSnapshot = buildInMemorySnapshot({ users });

    let testRepositoryProvider: TestRepositoryProvider;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let app: INestApplication;

    beforeAll(async () => {
        ({ app, testRepositoryProvider, arangoConnectionProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();

        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('fetchMany', () => {
        it('should return all users', async () => {
            // We only need to add the users
            await testRepositoryProvider.addFullSnapshot(fullSnapshot);
            const fetchManyResult = await testRepositoryProvider.getUserRepository().fetchMany();

            expect(fetchManyResult).not.toBeInstanceOf(InternalError);

            expect(cloneToPlainObject(fetchManyResult)).toEqual(cloneToPlainObject(users));
        });
    });

    describe('getCount', () => {
        it('should return the correct number of edge connections', async () => {
            await testRepositoryProvider.addFullSnapshot(fullSnapshot);

            const result = await testRepositoryProvider.getUserRepository().getCount();

            expect(result).toBe(numberOfUsers);
        });
    });

    describe('fetchById', () => {
        describe('when there is a user with the given id', () => {
            it('should find the user', async () => {
                await testRepositoryProvider.addFullSnapshot(fullSnapshot);

                const userToFind = users[0];

                const result = await testRepositoryProvider
                    .getUserRepository()
                    .fetchById(userToFind.id);

                expect(result).not.toBeInstanceOf(InternalError);

                expect(result).not.toBe(NotFound);

                const foundUser = result as CoscradUser;

                expect(foundUser.toDTO()).toEqual(userToFind.toDTO());
            });
        });
    });

    describe('create', () => {
        it('should create the new user', async () => {
            const userToCreate = users[0];

            // We could do this in the before all!
            const userRepository = testRepositoryProvider.getUserRepository();

            const searchResultBeforeCreatingUser = await userRepository.fetchById(userToCreate.id);

            expect(searchResultBeforeCreatingUser).toBe(NotFound);

            await userRepository.create(userToCreate);

            const searchResultAfterCreatingUser = await userRepository.fetchById(userToCreate.id);

            expect(searchResultAfterCreatingUser).not.toBeInstanceOf(InternalError);

            expect(searchResultAfterCreatingUser).not.toBe(NotFound);

            const foundUser = searchResultAfterCreatingUser as CoscradUser;

            expect(foundUser.toDTO()).toEqual(userToCreate.toDTO());

            // This could never happen anyway, though
            expect(foundUser).not.toBe(userToCreate);
        });
    });

    describe('createMany', () => {
        it('should create the new users', async () => {
            // We could do this in the before all!
            const userRepository = testRepositoryProvider.getUserRepository();

            const searchResultBeforeCreatingUsers = await userRepository.fetchMany();

            expect(searchResultBeforeCreatingUsers).toEqual([]);

            await userRepository.createMany(users);

            const searchResultAfterCreatingUsers = await userRepository.fetchMany();

            const foundUserDTOs = searchResultAfterCreatingUsers
                .filter((result): result is CoscradUser => !isInternalError(result))
                .map((user) => user.toDTO());

            const addedUserDTOs = users.map((user) => user.toDTO());

            expect(foundUserDTOs).toEqual(addedUserDTOs);
        });
    });
});
