import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import buildMockConfigService from '../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/Environment';
import { CoscradEventFactory } from '../../domain/common';
import { DeluxeInMemoryStore } from '../../domain/types/DeluxeInMemoryStore';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { DynamicDataTypeFinderService } from '../../validation';
import { ArangoConnectionProvider } from '../database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../database/database.provider';
import { HasArangoDocumentDirectionAttributes } from '../database/types/HasArangoDocumentDirectionAttributes';
import { ArangoDocumentForAggregateRoot } from '../database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../persistence.module';
import generateDatabaseNameForTestSuite from './__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';
import { ArangoDataExporter } from './arango-data-exporter';
import path = require('path');

const testData = new DeluxeInMemoryStore(buildTestDataInFlatFormat());

const testDocs = [
    {
        _key: '123',
        name: 'bobby',
    },
    {
        _key: '124',
        name: 'billy',
    },
    {
        _key: '125',
        // ensure unicode chars come through
        name: 'ŵŝẑʔɨ’',
    },
];

const testEdges: HasArangoDocumentDirectionAttributes<
    ArangoDocumentForAggregateRoot<HasAggregateId>
>[] = [
    {
        _key: '333',
        _to: 'docs/123',
        _from: 'docs/124',
    },
    {
        _key: '334',
        _to: 'docs/123',
        _from: 'docs/123',
    },
];

const dir = `__cli-command-test-files__`;

const filename = 'data-dump__dump-file__.data.json';

const fullpath = path.join(dir, filename);

describe(`ArangoDataExporter`, () => {
    let app: INestApplication;

    let arangoDataExporter: ArangoDataExporter;

    let arangoDatabaseProvider: ArangoDatabaseProvider;

    const testEdgeCollectionName = 'edges';

    const testDocumentCollectionName = 'docs';

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [ConfigModule, PersistenceModule.forRootAsync()],
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

        app = testModule.createNestApplication();

        await app.init();

        arangoDatabaseProvider = app.get(ArangoDatabaseProvider);

        arangoDataExporter = app.get(ArangoDataExporter);
    });

    beforeEach(async () => {
        await app
            .get(ArangoConnectionProvider)
            .createCollectionIfNotExists(testDocumentCollectionName);

        await arangoDatabaseProvider.getDatabaseForCollection(testDocumentCollectionName).clear();

        await arangoDatabaseProvider
            .getDatabaseForCollection(testDocumentCollectionName)
            .createMany(testDocs);

        await app.get(ArangoConnectionProvider).createCollectionIfNotExists(testEdgeCollectionName);

        await arangoDatabaseProvider.getDatabaseForCollection(testEdgeCollectionName).clear();

        await arangoDatabaseProvider
            .getDatabaseForCollection(testEdgeCollectionName)
            .createMany(testEdges);

        if (existsSync(fullpath)) {
            unlinkSync(fullpath);
        }

        const testRepositoryProvider = new TestRepositoryProvider(
            arangoDatabaseProvider,
            app.get(CoscradEventFactory),
            app.get(DynamicDataTypeFinderService)
        );

        await testRepositoryProvider.testSetup();

        // TODO add some views
        await testRepositoryProvider.addFullSnapshot(testData.fetchFullSnapshotInLegacyFormat());
    });

    it(`should write all documents for all collections`, async () => {
        await arangoDataExporter.dumpSnapshot(dir, filename, [testEdgeCollectionName]);

        const readResult = JSON.parse(readFileSync(fullpath, { encoding: 'utf-8' }));

        const foundDocs = readResult['document'][testDocumentCollectionName];

        expect(foundDocs).toHaveLength(testDocs.length);

        const foundEdges = readResult['edge'][testEdgeCollectionName];

        expect(foundEdges).toHaveLength(testEdges.length);

        expect(readResult).toMatchSnapshot();
    });
});
