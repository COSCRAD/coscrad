import { isDeepStrictEqual } from 'util';
import createTestModule from '../../../app/controllers/__tests__/createTestModule';
import { CoscradEventFactory } from '../../../domain/common';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { Photograph } from '../../../domain/models/photograph/entities/photograph.entity';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { ResourceType } from '../../../domain/types/ResourceType';
import { isNullOrUndefined } from '../../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { DynamicDataTypeFinderService } from '../../../validation';
import { ArangoConnectionProvider } from '../../database/arango-connection.provider';
import { ArangoQueryRunner } from '../../database/arango-query-runner';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../database/database.provider';
import {
    ArangoDatabaseDocument,
    ArangoDocumentForAggregateRoot,
} from '../../database/utilities/mapEntityDTOToDatabaseDocument';
import TestRepositoryProvider from '../../repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../repositories/__tests__/generateDatabaseNameForTestSuite';
import {
    BASE_DIGITAL_ASSET_URL,
    RemoveBaseDigitalAssetUrl,
} from './remove-base-digital-asset-url.migration';

const baseDigitalAssetUrl = `https://www.mymedia.org/downloads/`;

process.env[BASE_DIGITAL_ASSET_URL] = baseDigitalAssetUrl;

type OldPhotograph = Omit<Photograph, 'imageUrl'> & { filename?: string };

/**
 * Migrations are a vestige of when we used a state-based approach to persisting
 * the domain state.
 *
 * This migration has been applied to all databases. We keep this test for
 * posterity.
 */
describe.skip(`RemoveBaseDigitalAssetUrl`, () => {
    let testDatabaseProvider: ArangoDatabaseProvider;

    let testQueryRunner: ArangoQueryRunner;

    let testRepositoryProvider: TestRepositoryProvider;

    const buildId = (resourceType: ResourceType, index: number): string => {
        if (resourceType === ResourceType.term) return buildDummyUuid(index);

        if (resourceType === ResourceType.photograph) return buildDummyUuid(100 + index);

        throw new InternalError(
            `resource type: ${resourceType} is not supported in this ID generation scheme`
        );
    };

    describe(`when there are documents (terms, vocabularyLists, and photographs) that should be updated`, () => {
        beforeAll(async () => {
            const testModule = await createTestModule({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            });

            const arangoConnectionProvider = testModule.get(ArangoConnectionProvider);

            testDatabaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

            const coscradEventFactory = testModule.get(CoscradEventFactory);

            const databaseProvider = testModule.get(ArangoDatabaseProvider);

            /**
             * It's a bit awkward that we need this because we are not working at
             * the repositories level of abstraction. However, we have added test
             * setup and teardown logic at this level for the purpose of command and
             * query integration tests. So instead of rewriting this logic on a
             * `TestDatabaseProvider`, we will just leverage this existing logic for
             * test teardown.
             */
            testRepositoryProvider = new TestRepositoryProvider(
                databaseProvider,
                coscradEventFactory,
                testModule.get(DynamicDataTypeFinderService)
            );

            testQueryRunner = new ArangoQueryRunner(testDatabaseProvider);
        });

        // TERMS
        const dtoForTermToCheckManually = {
            term: `so bogus`,
            termEnglish: `so bogus (English)`,
            audioFilename: `bogus`,
            type: ResourceType.term,
            published: true,
            contributorId: '55',
        };

        const dtoForTermWithoutAudioFilename = {
            term: `so bogus`,
            termEnglish: `so bogus (English)`,
            // audioFilename: MISSING!,
            type: ResourceType.term,
            published: true,
            contributorId: '55',
        };

        const originalTermDocumentsWithoutKeys = [
            dtoForTermToCheckManually,
            dtoForTermWithoutAudioFilename,
        ];

        const originalTermDocuments = originalTermDocumentsWithoutKeys.map((partialDto, index) => ({
            ...partialDto,
            _key: buildId(ResourceType.term, index),
        }));

        // PHOTOGRAPHS
        const dtoForPhotographToCheckManually = {
            type: ResourceType.photograph,
            filename: `flowers`,
            photographer: `James Rames`,
            dimensions: {
                widthPX: 300,
                heightPX: 400,
            },
            published: true,
        };

        const dtoForPhotographWithoutFilename = {
            type: ResourceType.photograph,
            // filename: MISSING!,
            photographer: `James Rames`,
            dimensions: {
                widthPX: 300,
                heightPX: 400,
            },
            published: true,
        };

        const originalPhotographDocumentsWithoutKeys = [
            dtoForPhotographToCheckManually,
            dtoForPhotographWithoutFilename,
        ];

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

        const migrationUnderTest = new RemoveBaseDigitalAssetUrl();

        const idForTermToCheckManually = buildId(ResourceType.term, 0);

        const idForTermWithoutAudioFilename = buildId(ResourceType.term, 1);

        const idForPhotographToCheckManually = buildId(ResourceType.photograph, 0);

        const idForPhotographWithoutFilename = buildId(ResourceType.photograph, 1);

        it(`should apply the appropriate updates`, async () => {
            await migrationUnderTest.up(testQueryRunner);

            const updatedTermDocuments = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.terms)
                .fetchMany()) as ArangoDocumentForAggregateRoot<DTO<Term>>[];

            expect(updatedTermDocuments.length).toBe(originalTermDocuments.length);

            const idsOfDocumentsWithoutBaseDigitalAssetUrl = updatedTermDocuments.filter(
                // @ts-expect-error no longer relevant
                ({ audioItemId: audioFilename }) =>
                    !isNullOrUndefined(audioFilename) &&
                    !audioFilename.includes(baseDigitalAssetUrl)
            );

            expect(idsOfDocumentsWithoutBaseDigitalAssetUrl).toEqual([]);

            // @ts-expect-error this test is not longer relevant
            const { audioItemId: audioFilename } = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.terms)
                .fetchById(idForTermToCheckManually)) as unknown as ArangoDatabaseDocument<
                DTO<Term>
            >;

            expect(audioFilename).toBe(`https://www.mymedia.org/downloads/bogus.mp3`);

            const migratedTermWithoutAudiofilename = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.terms)
                .fetchById(idForTermWithoutAudioFilename)) as unknown as ArangoDatabaseDocument<
                DTO<Term>
            >;

            // @ts-expect-error this test is no longer relevant
            expect(migratedTermWithoutAudiofilename.audioItemId).not.toBeTruthy();

            // @ts-expect-error there's no point of maintainging this any longer
            const { imageUrl } = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .fetchById(idForPhotographToCheckManually)) as unknown as ArangoDatabaseDocument<
                DTO<Photograph>
            >;

            expect(imageUrl).toBe(`https://www.mymedia.org/downloads/flowers.png`);

            const dtoForPhotographWithoutFilename = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .fetchById(idForPhotographWithoutFilename)) as unknown as ArangoDatabaseDocument<
                DTO<Photograph>
            >;

            // @ts-expect-error There's no reason to support this now
            expect(dtoForPhotographWithoutFilename.imageUrl).not.toBeTruthy();

            const updatedPhotographDocuments = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .fetchMany()) as ArangoDocumentForAggregateRoot<DTO<Photograph>>[];

            expect(updatedPhotographDocuments.length).toBe(originalPhotographDocuments.length);

            const idsOfPhotographDocumentsWithoutBaseDigitalAssetUrl =
                updatedPhotographDocuments.filter(
                    // @ts-expect-error There's no reason to support this now
                    ({ imageUrl }) =>
                        !isNullOrUndefined(imageUrl) && !imageUrl.includes(baseDigitalAssetUrl)
                );

            expect(idsOfPhotographDocumentsWithoutBaseDigitalAssetUrl).toEqual([]);

            const idsOfPhotographsWithVestigialFilenameProperty = updatedPhotographDocuments.filter(
                (newDoc) => !isNullOrUndefined((newDoc as unknown as OldPhotograph).filename)
            );

            expect(idsOfPhotographsWithVestigialFilenameProperty).toEqual([]);
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

            const { terms: termsBefore, photographs: photographsBefore } =
                await buildMiniSnapshot();

            await migrationUnderTest.up(testQueryRunner);

            await migrationUnderTest.down(testQueryRunner);

            const { terms: termsAfter, photographs: photographsAfter } = await buildMiniSnapshot();

            const doArraysContainEqualMembers = <T, U>(a: T[], b: U[]) =>
                a.length === b.length &&
                a.every((element) =>
                    b.some((elementFromB) => isDeepStrictEqual(element, elementFromB))
                );

            // TODO add a custom jest matcher for this
            // TODO can we optimize this?
            expect(doArraysContainEqualMembers(termsBefore, termsAfter)).toBe(true);

            expect(doArraysContainEqualMembers(photographsBefore, photographsAfter)).toBe(true);
        });
    });
});
