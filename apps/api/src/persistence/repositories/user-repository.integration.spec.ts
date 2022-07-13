import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import { toDto } from '../../domain/models/shared/functional';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { IUserRepository } from '../../domain/repositories/interfaces/user-repository.interface';
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

    let userRepository: IUserRepository;

    beforeAll(async () => {
        ({ app, testRepositoryProvider, arangoConnectionProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));

        userRepository = testRepositoryProvider.getUserRepository();
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
            await testRepositoryProvider.addFullSnapshot(fullSnapshot);
            const fetchManyResult = await userRepository.fetchMany();

            expect(fetchManyResult).not.toBeInstanceOf(InternalError);

            expect(cloneToPlainObject(fetchManyResult)).toEqual(cloneToPlainObject(users));
        });
    });

    describe('getCount', () => {
        it('should return the correct number of users', async () => {
            await testRepositoryProvider.addFullSnapshot(fullSnapshot);

            const result = await userRepository.getCount();

            expect(result).toBe(numberOfUsers);
        });
    });

    describe('fetchById', () => {
        describe('when there is a user with the given id', () => {
            it('should find the user', async () => {
                await testRepositoryProvider.addFullSnapshot(fullSnapshot);

                const userToFind = users[0];

                const result = await userRepository.fetchById(userToFind.id);

                expect(result).not.toBeInstanceOf(InternalError);

                expect(result).not.toBe(NotFound);

                const foundUser = result as CoscradUser;

                expect(foundUser.toDTO()).toEqual(userToFind.toDTO());
            });
        });

        describe('when there is no user with the given id', () => {
            it('should return not found', async () => {
                await testRepositoryProvider.addFullSnapshot(fullSnapshot);

                const result = await userRepository.fetchById('BOGUS-USER-ID');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe('fetchByProviderId', () => {
        describe('when there is a user with the given auth provider userId', () => {
            it('should return the user', async () => {
                await testRepositoryProvider.addFullSnapshot(fullSnapshot);

                const userToFind = users[0];

                const result = await userRepository.fetchByProviderId(
                    userToFind.authProviderUserId
                );

                expect(result).not.toBeInstanceOf(InternalError);

                expect(result).not.toBe(NotFound);

                const foundUser = result as CoscradUser;

                expect(foundUser.toDTO()).toEqual(userToFind.toDTO());
            });
        });

        describe('when there is no user with thte given auth provider userId', () => {
            it('should return Not Found', async () => {
                await testRepositoryProvider.addFullSnapshot(fullSnapshot);

                const result = await userRepository.fetchByProviderId('NOWAY|1242332');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe('create', () => {
        it('should create the new user', async () => {
            const userToCreate = users[0];

            const searchResultBeforeCreatingUser = await userRepository.fetchById(userToCreate.id);

            expect(searchResultBeforeCreatingUser).toBe(NotFound);

            await userRepository.create(userToCreate);

            const searchResultAfterCreatingUser = await userRepository.fetchById(userToCreate.id);

            expect(searchResultAfterCreatingUser).not.toBeInstanceOf(InternalError);

            expect(searchResultAfterCreatingUser).not.toBe(NotFound);

            const foundUser = searchResultAfterCreatingUser as CoscradUser;

            expect(foundUser.toDTO()).toEqual(userToCreate.toDTO());
        });
    });

    describe('createMany', () => {
        it('should create the new users', async () => {
            const searchResultBeforeCreatingUsers = await userRepository.fetchMany();

            expect(searchResultBeforeCreatingUsers).toEqual([]);

            await userRepository.createMany(users);

            const searchResultAfterCreatingUsers = await userRepository.fetchMany();

            const foundUserDTOs = searchResultAfterCreatingUsers
                .filter((result): result is CoscradUser => !isInternalError(result))
                .map(toDto);

            const addedUserDTOs = users.map(toDto);

            expect(foundUserDTOs).toEqual(addedUserDTOs);
        });
    });
});
