import { ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { EventSourcedTagRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { buildTestInstance } from '../../../../test-data/utilities';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { ArangoTagQueryRepository } from './arango-tag-query-repository';
import { ITagQueryRepository } from './tag-query-repository.interface';

const tagIds = [1, 2, 3].map(buildDummyUuid);

describe(`ArangoTagQueryRepository`, () => {
    let testQueryRepository: ITagQueryRepository;

    let connectionProvider: ArangoConnectionProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
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
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoTagQueryRepository(connectionProvider);
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        const existingTag = buildTestInstance(EventSourcedTagRecordForResourceViewModel, {
            id: tagIds[0],
            label: 'birds',
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(existingTag);
        });

        describe(`when the tag exists`, () => {
            it(`should return the tag`, async () => {
                const result = await testQueryRepository.fetchById(existingTag.id);

                expect(result).not.toBe(NotFound);

                const { label } = result as EventSourcedTagRecordForResourceViewModel;

                // TODO check members
                expect(label).toBe(existingTag.label);
            });
        });

        describe(`when there is no tag with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById(buildDummyUuid(123));

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        const existingTags = tagIds.map((tagId, index) =>
            buildTestInstance(EventSourcedTagRecordForResourceViewModel, {
                id: tagId,
                label: `tag number: ${index}`,
            })
        );

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(existingTags);
        });

        it(`should return the tags`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result).toHaveLength(existingTags.length);
        });
    });

    describe(`count`, () => {
        const existingTag = tagIds.map((tagId, index) =>
            buildTestInstance(EventSourcedTagRecordForResourceViewModel, {
                id: tagId,
                label: `tag number ${index}`,
            })
        );

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(existingTag);
        });

        it(`should return them`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(existingTag.length);
        });
    });

    describe(`tagResourceOrNote`, () => {
        const targetResourceCompositeIdentifier = {
            type: 'widget' as ResourceType,
            id: buildDummyUuid(666),
        };

        const existingTags = tagIds.map((tagId) =>
            buildTestInstance(EventSourcedTagRecordForResourceViewModel, {
                id: tagId,
            })
        );

        const targetTag = existingTags[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(existingTags);
        });

        it(`should add the resource as a tag member`, async () => {
            await testQueryRepository.tagResourceOrNote(
                targetTag.id,
                targetResourceCompositeIdentifier
            );

            const result = (await testQueryRepository.fetchById(
                targetTag.id
            )) as EventSourcedTagRecordForResourceViewModel;

            expect(result.members).toHaveLength(1);

            expect(result.members[0]).toEqual(targetResourceCompositeIdentifier);
        });
    });

    describe(`relabel`, () => {
        const targetTag = buildTestInstance(EventSourcedTagRecordForResourceViewModel, {
            label: 'old label',
        });

        const newLabel = 'new label';

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany([targetTag]);
        });

        it(`should update the tag label`, async () => {
            await testQueryRepository.relabel(targetTag.id, newLabel);

            const result = (await testQueryRepository.fetchById(
                targetTag.id
            )) as EventSourcedTagRecordForResourceViewModel;

            expect(result.label).toEqual(newLabel);
        });
    });
});
