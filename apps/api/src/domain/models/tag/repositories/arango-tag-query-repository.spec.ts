import { ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { buildTestInstance } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { ArangoTagQueryRepository } from './arango-tag-query-repository';
import { ITagQueryRepository } from './tag-query-repository.interface';

const widgetCollectionName = 'widget__VIEWS';

const tagIds = [1, 2, 3].map(buildDummyUuid);

class Widget {
    id: string;

    name: string;

    tags: EventSourcedTagViewModel[];

    constructor(id: string, name: string) {
        this.id = id;

        this.name = name;

        this.tags = [];
    }

    static fromDto({ id, name, tags }: DTO<Widget>) {
        const widget = new Widget(id, name);

        widget.addTags(tags.map((t) => EventSourcedTagViewModel.fromDto(t)));

        return widget;
    }

    addTags(tags: EventSourcedTagViewModel[]) {
        this.tags.push(...tags);

        return this;
    }
}

const widgetSequenceNumbers = [22, 23, 24];

const widgetIds = widgetSequenceNumbers.map(buildDummyUuid);

const targetTag = buildTestInstance(EventSourcedTagViewModel, {
    label: 'old label',
});

const widgets = widgetIds.map((id) =>
    new Widget(id, `Widget #${widgetSequenceNumbers} `).addTags([targetTag])
);

targetTag.members.push(
    ...widgets.map(({ id }) => ({
        type: 'widget' as ResourceType,
        id,
    }))
);

describe(`ArangoTagQueryRepository`, () => {
    let testQueryRepository: ITagQueryRepository;

    let connectionProvider: ArangoConnectionProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let widgetDatabase: ArangoDatabaseForCollection<Widget>;

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

        connectionProvider.createCollectionIfNotExists(widgetCollectionName);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoTagQueryRepository(connectionProvider);

        widgetDatabase = new ArangoDatabaseForCollection<Widget>(
            new ArangoDatabase(connectionProvider.getConnection()),
            widgetCollectionName
        );
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        const existingMember = {
            type: 'widget' as ResourceType,
            id: buildDummyUuid(5),
        };

        const existingTag = buildTestInstance(EventSourcedTagViewModel, {
            id: tagIds[0],
            label: 'birds',
            members: [existingMember],
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(existingTag);
        });

        describe(`when the tag exists`, () => {
            it(`should return the tag`, async () => {
                const result = await testQueryRepository.fetchById(existingTag.id);

                expect(result).not.toBe(NotFound);

                const { label } = result as EventSourcedTagViewModel;

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
            buildTestInstance(EventSourcedTagViewModel, {
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
        const existingTags = tagIds.map((tagId, index) =>
            buildTestInstance(EventSourcedTagViewModel, {
                id: tagId,
                label: `tag number ${index}`,
            })
        );

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(existingTags);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(existingTags.length);
        });
    });

    describe(`tagResourceOrNote`, () => {
        const targetResourceCompositeIdentifier = {
            type: 'widget' as ResourceType,
            id: buildDummyUuid(666),
        };

        const existingTags = tagIds.map((tagId) =>
            buildTestInstance(EventSourcedTagViewModel, {
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
            )) as EventSourcedTagViewModel;

            expect(result.members).toHaveLength(1);

            expect(result.members[0]).toEqual(targetResourceCompositeIdentifier);
        });
    });

    describe(`relabel`, () => {
        const newLabel = 'new label';

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await widgetDatabase.clear();

            await testQueryRepository.createMany([targetTag]);

            await widgetDatabase.createMany(widgets.map(mapEntityDTOToDatabaseDocument));

            await testQueryRepository.relabel(targetTag.id, newLabel);
        });

        it(`should update the tag label`, async () => {
            const result = (await testQueryRepository.fetchById(
                targetTag.id
            )) as EventSourcedTagViewModel;

            expect(result.label).toEqual(newLabel);
        });

        it(`should cascade updates to resources`, async () => {
            const updatedWidgets = await widgetDatabase.fetchMany();

            updatedWidgets.forEach(({ tags }) => {
                expect(tags).toHaveLength(1);

                const { label } = tags[0];

                expect(label).toBe(newLabel);
            });
        });
    });
});
