import createTestModule from '../../../app/controllers/__tests__/createTestModule';
import { Photograph } from '../../../domain/models/photograph/entities/photograph.entity';
import { Term } from '../../../domain/models/term/entities/term.entity';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { ResourceType } from '../../../domain/types/ResourceType';
import { InternalError } from '../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { ArangoConnectionProvider } from '../../database/arango-connection.provider';
import { ArangoQueryRunner } from '../../database/arango-query-runner';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../database/database.provider';
import { DatabaseDocument, DatabaseDTO } from '../../database/utilities/mapEntityDTOToDatabaseDTO';
import generateDatabaseNameForTestSuite from '../../repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../repositories/__tests__/TestRepositoryProvider';
import { RemoveBaseDigitalAssetUrl } from './remove-base-digital-asset-url.migration';

describe(`RemoveBaseDigitalAssetUrl`, () => {
    let testDatabaseProvider: ArangoDatabaseProvider;

    let testQueryRunner: ArangoQueryRunner;

    let testRepositoryProvider: TestRepositoryProvider;

    beforeAll(async () => {
        const testModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        const arangoConnectionProvider = testModule.get(ArangoConnectionProvider);

        testDatabaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        /**
         * It's a bit awkward that we need this because we are not working at
         * the repositories level of abstraction. However, we have added test
         * setup and teardown logic at this level for the purpose of commadn and
         * query integration tests. So instead of rewriting this logic on a
         * `TestDatabaseProvider`, we will just leverage this existing logic for
         * test teardown.
         */
        testRepositoryProvider = new TestRepositoryProvider(testDatabaseProvider);

        testQueryRunner = new ArangoQueryRunner(testDatabaseProvider);
    });

    const baseDigitalAssetUrl = `https://www.mymedia.org/downloads/`;

    const buildId = (resourceType: ResourceType, index: number): string => {
        if (resourceType === ResourceType.term) return buildDummyUuid(index);

        if (resourceType === ResourceType.photograph) return buildDummyUuid(100 + index);

        throw new InternalError(
            `resource type: ${resourceType} is not supported in this ID generation scheme`
        );
    };

    describe(`when there are documents (terms, vocabularyLists, and photographs) that should be updated`, () => {
        // TERMS
        const dtoForTermToCheckManually: Omit<DatabaseDocument<DTO<Term>>, '_key'> = {
            term: `so bogus`,
            termEnglish: `so bogus (English)`,
            audioFilename: `bogus.wav`,
            type: ResourceType.term,
            published: true,
            contributorId: '55',
        };

        const originalTermDocumentsWithoutKeys: Omit<DatabaseDocument<DTO<Term>>, '_key'>[] = [
            dtoForTermToCheckManually,
        ];

        const originalTermDocuments = originalTermDocumentsWithoutKeys.map((partialDto, index) => ({
            ...partialDto,
            _key: buildId(ResourceType.term, index),
        }));

        // PHOTOGRAPHS
        const dtoForPhotographToCheckManually: Omit<DatabaseDocument<DTO<Photograph>>, '_key'> = {
            type: ResourceType.photograph,
            imageUrl: `flowers.png`,
            photographer: `James Rames`,
            dimensions: {
                widthPX: 300,
                heightPX: 400,
            },
            published: true,
        };

        const originalPhotographDocumentsWithoutKeys: Omit<
            DatabaseDocument<DTO<Photograph>>,
            '_key'
        >[] = [dtoForPhotographToCheckManually];

        const originalPhotographDocuments = originalPhotographDocumentsWithoutKeys.map(
            (partialDto, index) => ({
                ...partialDto,
                _key: buildId(ResourceType.photograph, index),
            })
        );

        beforeEach(async () => {
            // We use the `TestRepositoryProvider` for test teardown only
            await testRepositoryProvider.testTeardown();

            await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.terms)
                .createMany(originalTermDocuments);

            await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .createMany(originalPhotographDocuments);
        });

        const migrationUnderTest = new RemoveBaseDigitalAssetUrl(baseDigitalAssetUrl);

        const idForTermToCheckManually = buildId(ResourceType.term, 0);

        const idForPhotographToCheckManually = buildId(ResourceType.photograph, 0);

        it(`should apply the appropriate updates`, async () => {
            await migrationUnderTest.up(testQueryRunner);

            const updatedTermDocuments = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.terms)
                .fetchMany()) as DatabaseDTO<DTO<Term>>[];

            expect(updatedTermDocuments.length).toBe(originalTermDocuments.length);

            const idsOfDocumentsWithoutBaseDigitalAssetUrl = updatedTermDocuments.filter(
                ({ audioFilename }) => !audioFilename.includes(baseDigitalAssetUrl)
            );

            expect(idsOfDocumentsWithoutBaseDigitalAssetUrl).toEqual([]);

            const { audioFilename } = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.terms)
                .fetchById(idForTermToCheckManually)) as unknown as DatabaseDocument<DTO<Term>>;

            expect(audioFilename).toBe(`https://www.mymedia.org/downloads/bogus.wav`);

            const { imageUrl } = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .fetchById(idForPhotographToCheckManually)) as unknown as DatabaseDocument<
                DTO<Photograph>
            >;

            expect(imageUrl).toBe(`https://www.mymedia.org/downloads/flowers.png`);

            const updatedPhotographDocuments = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .fetchMany()) as DatabaseDTO<DTO<Photograph>>[];

            expect(updatedPhotographDocuments.length).toBe(originalPhotographDocuments.length);

            const idsOfPhotographDocumentsWithoutBaseDigitalAssetUrl =
                updatedPhotographDocuments.filter(
                    ({ imageUrl }) => !imageUrl.includes(baseDigitalAssetUrl)
                );

            expect(idsOfPhotographDocumentsWithoutBaseDigitalAssetUrl).toEqual([]);
        });

        it(`should be reverseable`, async () => {
            // TODO Consider adding a custom jest matcher instead
            const removeRevFromDoc = (document: { _rev: string }) => {
                const cloned = cloneToPlainObject(document);

                delete cloned['_rev'];

                return cloned;
            };

            const buildMiniSnapshot = async () => {
                const photographs = await testDatabaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.photographs)
                    .fetchMany();

                const terms = await testDatabaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.terms)
                    .fetchMany();

                return {
                    [ArangoCollectionId.photographs]: photographs.map((photograph) =>
                        removeRevFromDoc(photograph as unknown as { _rev: string })
                    ),
                    [ArangoCollectionId.terms]: terms.map((term) =>
                        removeRevFromDoc(term as unknown as { _rev: string })
                    ),
                };
            };

            const snapshotBefore = await buildMiniSnapshot();

            await migrationUnderTest.up(testQueryRunner);

            await migrationUnderTest.down(testQueryRunner);

            const snapshotAfter = await buildMiniSnapshot();

            expect(snapshotBefore).toEqual(snapshotAfter);
        });
    });
});
