import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import buildMockConfigService from '../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/environment';
import { CoscradEventFactory } from '../../domain/common';
import { DeluxeInMemoryStore } from '../../domain/types/DeluxeInMemoryStore';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { DatabaseCollectionSnapshot, InMemoryDatabaseSnapshot } from '../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../validation';
import { ArangoConnectionProvider } from '../database/arango-connection.provider';
import { ArangoEdgeCollectionId } from '../database/collection-references/ArangoEdgeCollectionId';
import { ArangoDatabaseProvider } from '../database/database.provider';
import { HasArangoDocumentDirectionAttributes } from '../database/types/HasArangoDocumentDirectionAttributes';
import { ArangoDocumentForAggregateRoot } from '../database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../persistence.module';
import generateDatabaseNameForTestSuite from './__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';
import { ArangoDataExporter } from './arango-data-exporter';
import path = require('path');

type HasRev = {
    _rev: string;
};

const removeRev = <T extends HasRev>(doc: T): Omit<T, '_rev'> => {
    delete doc._rev;

    return doc;
};

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

    const knownEdgeCollections = [...Object.values(ArangoEdgeCollectionId), testEdgeCollectionName];

    const originalEnv = process.env;

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

        process.env.DATA_MODE = 'import';
    });

    afterAll(() => {
        process.env = originalEnv;
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

    describe('dumpSnapshot', () => {
        it(`should write all documents for all collections`, async () => {
            await arangoDataExporter.dumpSnapshot(dir, filename, knownEdgeCollections);

            const readResult = JSON.parse(
                readFileSync(fullpath, { encoding: 'utf-8' })
            ) as InMemoryDatabaseSnapshot;

            const foundDocs = readResult.document[testDocumentCollectionName]['documents'];

            expect(foundDocs).toHaveLength(testDocs.length);

            // Note that we only snapshot the custom (unregistered collection) docs so to avoid snapshotting all test data
            expect(foundDocs.map(removeRev)).toMatchSnapshot();

            const foundEdges = readResult.edge[testEdgeCollectionName]['documents'];

            expect(foundEdges).toHaveLength(testEdges.length);

            expect(foundEdges.map(removeRev)).toMatchSnapshot();
        });
    });

    describe('restoreSnapshot', () => {
        let snapshot: InMemoryDatabaseSnapshot;

        beforeEach(async () => {
            snapshot = await arangoDataExporter.fetchSnapshot(knownEdgeCollections);
        });

        describe(`when restoring to an empty database`, () => {
            beforeEach(async () => {
                await arangoDatabaseProvider.clearAll();
            });

            describe(`when the checksums are valid`, () => {
                it(`should restore the snapshot`, async () => {
                    await arangoDataExporter.restoreFromSnapshot(snapshot);

                    const foundTestDocs = await arangoDatabaseProvider
                        .getDatabaseForCollection(testDocumentCollectionName)
                        .fetchMany();

                    expect(foundTestDocs).toHaveLength(testDocs.length);

                    const foundEdges = await arangoDatabaseProvider
                        .getDatabaseForCollection(testEdgeCollectionName)
                        .fetchMany();

                    expect(foundEdges).toHaveLength(testEdges.length);
                });
            });

            describe(`when the checksums are not valid (data has been changed)`, () => {
                it(`should reject`, async () => {
                    const { document } = snapshot;

                    // @ts-expect-error this is tough
                    const tamperedDoc = cloneToPlainObject(document['photographs']['documents'][0]);

                    // this would be no good, very bad!
                    delete tamperedDoc['queryAccessControlList'];

                    const tamperedPhotographs = (
                        document['photographs']['documents'] as unknown as { _key: string }[]
                    ).map((doc) =>
                        doc._key === tamperedDoc._key ? tamperedDoc : doc
                    ) as unknown as DatabaseCollectionSnapshot;

                    const tamperedSnapshot = cloneToPlainObject(snapshot);

                    delete tamperedSnapshot['document']['photographs']['documents'];

                    tamperedSnapshot['document']['photographs']['documents'] = tamperedPhotographs;

                    expect.assertions(1);

                    try {
                        await arangoDataExporter.restoreFromSnapshot(tamperedSnapshot);
                    } catch (error) {
                        expect(error).toBeInstanceOf(InternalError);
                    }
                });
            });
        });

        describe(`when attempting to restore to a non-empty database`, () => {
            it(`should throw`, async () => {
                expect(arangoDataExporter.restoreFromSnapshot(snapshot)).rejects;
            });
        });
    });
});
