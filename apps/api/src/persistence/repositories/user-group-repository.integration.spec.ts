import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import { toDto } from '../../domain/models/shared/functional';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { IRepositoryForAggregate } from '../../domain/repositories/interfaces/repository-for-aggregate.interface';
import buildInMemorySnapshot from '../../domain/utilities/buildInMemorySnapshot';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { NotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import buildTestData from '../../test-data/buildTestData';
import { ArangoConnectionProvider } from '../database/arango-connection.provider';
import generateRandomTestDatabaseName from './__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';

describe('Arango Repository Provider > getUserGroupRepository', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    const testData = buildTestData();

    const numberOfGroups = 9;

    const validUser = testData.userGroup[0];

    const userGroups = Array(numberOfGroups)
        .fill(0)
        .map((_, index) =>
            validUser.clone({
                id: index.toString(),
                label: `user group ${index}`,
            })
        );

    const fullSnapshot = buildInMemorySnapshot({ userGroup: userGroups });

    let testRepositoryProvider: TestRepositoryProvider;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let app: INestApplication;

    let userGroupRepository: IRepositoryForAggregate<CoscradUserGroup>;

    beforeAll(async () => {
        ({ app, testRepositoryProvider, arangoConnectionProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));

        userGroupRepository = testRepositoryProvider.getUserGroupRepository();
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

    describe('getCount', () => {
        it('should return the correct number of groups', async () => {
            await testRepositoryProvider.addFullSnapshot(fullSnapshot);

            const result = await userGroupRepository.getCount();

            expect(result).toBe(numberOfGroups);
        });
    });

    describe('fetchMany', () => {
        it('should return all groups', async () => {
            await testRepositoryProvider.addFullSnapshot(fullSnapshot);

            const result = await userGroupRepository.fetchMany();

            expect(result).not.toBeInstanceOf(InternalError);

            expect(cloneToPlainObject(result)).toEqual(cloneToPlainObject(userGroups));
        });
    });

    describe('fetchById', () => {
        describe('when there is a group with the given id', () => {
            it('should find the group', async () => {
                await testRepositoryProvider.addFullSnapshot(fullSnapshot);

                const groupToFind = userGroups[0];

                const result = await userGroupRepository.fetchById(groupToFind.id);

                expect(result).not.toBeInstanceOf(InternalError);

                expect(result).not.toBe(NotFound);

                const foundGroup = result as CoscradUserGroup;

                expect(foundGroup.toDTO()).toEqual(groupToFind.toDTO());
            });
        });
    });

    describe('create', () => {
        it('should create the new user', async () => {
            const groupToCreate = userGroups[0];

            const searchResultBeforeCreatingGroup = await userGroupRepository.fetchById(
                groupToCreate.id
            );

            expect(searchResultBeforeCreatingGroup).toBe(NotFound);

            await userGroupRepository.create(groupToCreate);

            const searchResultAfterCreatingGroup = await userGroupRepository.fetchById(
                groupToCreate.id
            );

            expect(searchResultAfterCreatingGroup).not.toBeInstanceOf(InternalError);

            expect(searchResultAfterCreatingGroup).not.toBe(NotFound);

            const foundGroup = searchResultAfterCreatingGroup as CoscradUserGroup;

            expect(foundGroup.toDTO()).toEqual(groupToCreate.toDTO());
        });
    });

    describe('createMany', () => {
        it('should create the new groups', async () => {
            const searchResultBeforeCreatingGroups = await userGroupRepository.fetchMany();

            expect(searchResultBeforeCreatingGroups).toEqual([]);

            await userGroupRepository.createMany(userGroups);

            const searchResultAfterCreatingGroups = await userGroupRepository.fetchMany();

            const foundGroupDTOs = searchResultAfterCreatingGroups
                // TODO consider a helper that makes the following point-free
                .filter((result): result is CoscradUserGroup => !isInternalError(result))
                .map(toDto);

            const addedGroupDTOs = userGroups.map(toDto);

            expect(foundGroupDTOs).toEqual(addedGroupDTOs);
        });
    });
});
