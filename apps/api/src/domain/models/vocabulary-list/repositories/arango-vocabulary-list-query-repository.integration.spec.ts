import {
    AggregateType,
    FormFieldType,
    IMultilingualTextItem,
    IValueAndDisplay,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/Environment';
import { ConsoleCoscradCliLogger } from '../../../../coscrad-cli/logging';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoRepositoryForAggregate } from '../../../../persistence/repositories/arango-repository-for-aggregate';
import {
    VocabularyListEntryViewModel,
    VocabularyListViewModel,
} from '../../../../queries/buildViewModelForResource/viewModels';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../test-data/events';
import { DTO } from '../../../../types/DTO';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import buildInstanceFactory from '../../../factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateId } from '../../../types/AggregateId';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { ArangoAudioItemQueryRepository } from '../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import idEquals from '../../shared/functional/idEquals';
import { TermCreated } from '../../term/commands';
import { ITermQueryRepository } from '../../term/queries';
import { ArangoTermQueryRepository } from '../../term/repositories';
import { CoscradContributor } from '../../user-management/contributor';
import { FullName } from '../../user-management/user/entities/user/full-name.entity';
import { FilterPropertyType, VocabularyListCreated } from '../commands';
import { IVocabularyListQueryRepository } from '../queries';
import { ArangoVocabularyListQueryRepository } from './arango-vocabulary-list-query-repository';

const vocabularyListIds = [123, 124, 125].map(buildDummyUuid);

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const buildVocabularyListEventHistory = (
    id: AggregateId,
    name: string,
    languageCodeForName: LanguageCode
) => {
    const vocabularyListCreated = new TestEventStream().andThen<VocabularyListCreated>({
        type: 'VOCABULARY_LIST_CREATED',
        payload: {
            name,
            languageCodeForName,
        },
    });

    return vocabularyListCreated.as({
        type: AggregateType.vocabularyList,
        id,
    });
};

const buildVocabularyListName = (id: AggregateId) => `vocabulary list #${id}`;

const vocabularyListViews = vocabularyListIds.map((id) => {
    const eventHistory = buildVocabularyListEventHistory(
        id,
        buildVocabularyListName(id),
        originalLanguageCode
    );

    const creationEvent = eventHistory[0] as VocabularyListCreated;

    return VocabularyListViewModel.fromVocabularyListCreated(creationEvent);
});

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

const contributorIds = [101, 102, 103].map(buildDummyUuid);

const contributorIdsAndNames = contributorIds.map((contributorId) => ({
    contributorId,
    fullName: new FullName({
        firstName: `user`,
        lastName: contributorId,
    }),
}));

const testContributors = contributorIdsAndNames.map(({ contributorId, fullName }) =>
    dummyContributor.clone({
        id: contributorId,
        fullName,
    })
);

const termId = buildDummyUuid(777);

const originalTextForTerm = 'apple';

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
    payload: {
        text: originalTextForTerm,
        languageCode: originalLanguageCode,
    },
});

const [termCreationEvent] = termCreated.as({
    type: AggregateType.term,
    id: termId,
}) as [TermCreated];

const existingTerm = TermViewModel.fromTermCreated(termCreationEvent);

const filterPropertyName = 'aspect';

// TODO checkbox test case
const filterPropertyType: FilterPropertyType = FilterPropertyType.selection;

const allowedValuesAndLabels = [
    {
        value: '1',
        label: 'progressive',
    },
    {
        value: '2',
        label: 'perfective',
    },
    {
        value: '3',
        label: 'inceptive-progressive',
    },
];

/**
 * TODO Opt back into this test once we get to the bottom
 * of the dreaded `write-write` error in Arango.
 */
describe(`ArangoVocabularyListQueryRepository`, () => {
    let testQueryRepository: IVocabularyListQueryRepository;

    let termQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let contributorRepository: IRepositoryForAggregate<CoscradContributor>;

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

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoVocabularyListQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        termQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            new ArangoAudioItemQueryRepository(connectionProvider),
            new ConsoleCoscradCliLogger()
        );

        /**
         * Currently, the contributors are snapshot based (not event sourced).
         */
        contributorRepository = new ArangoRepositoryForAggregate(
            databaseProvider,
            ArangoCollectionId.contributors,
            buildInstanceFactory(CoscradContributor),
            mapDatabaseDocumentToAggregateDTO,
            mapEntityDTOToDatabaseDocument
        );
    });

    beforeEach(async () => {
        // clear existing contributors
        await databaseProvider.getDatabaseForCollection(ArangoCollectionId.contributors).clear();

        await databaseProvider.clearViews();
    });

    describe(`fetchById`, () => {
        describe(`when there is a vocabulary list with the given ID`, () => {
            const targetVocabularyListView = vocabularyListViews[0];

            beforeEach(async () => {
                await testQueryRepository.createMany(vocabularyListViews);
            });

            it(`should return the expected result`, async () => {
                // act
                const result = await testQueryRepository.fetchById(targetVocabularyListView.id);

                expect(result).not.toBe(NotFound);

                const foundView = result as VocabularyListViewModel;

                const foundName = new MultilingualText(foundView.name);

                const { text: foundTextForName, languageCode: foundLanguageCodeForName } =
                    foundName.getOriginalTextItem();

                expect(foundTextForName).toBe(buildVocabularyListName(targetVocabularyListView.id));

                expect(foundLanguageCodeForName).toBe(originalLanguageCode);
            });
        });

        describe(`when there is no vocabulary list with the given ID`, () => {
            it(`should return NotFound`, async () => {
                const result = await testQueryRepository.fetchById('bogusId');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(vocabularyListViews);
        });

        it(`should return the expected views`, async () => {
            const foundViews = await testQueryRepository.fetchMany();

            expect(foundViews).toHaveLength(vocabularyListViews.length);

            const missingViews = vocabularyListViews.filter(
                ({ id: testDataId }) => !foundViews.some(({ id }) => id === testDataId)
            );

            expect(missingViews).toEqual([]);
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(vocabularyListViews);
        });

        it(`should return the expected views`, async () => {
            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(vocabularyListViews.length);
        });
    });

    describe(`create`, () => {
        const viewToCreate = vocabularyListViews[0];

        it(`should create the expected view`, async () => {
            await testQueryRepository.create(viewToCreate);

            const searchResult = testQueryRepository.fetchById(viewToCreate.id);

            expect(searchResult).not.toBe(NotFound);

            // Should we check this in more detail?
        });
    });

    describe(`create many`, () => {
        it(`should create the expected views`, async () => {
            await testQueryRepository.createMany(vocabularyListViews);

            const numberOfViewsFound = await testQueryRepository.count();

            expect(numberOfViewsFound).toBe(vocabularyListIds.length);
        });
    });

    describe(`delete`, () => {
        const targetViewForDeleition = vocabularyListViews[1];

        beforeEach(async () => {
            await testQueryRepository.createMany(vocabularyListViews);
        });

        it(`should remove the corresponding view`, async () => {
            await testQueryRepository.delete(targetViewForDeleition.id);

            const searchResult = await testQueryRepository.fetchById(targetViewForDeleition.id);

            expect(searchResult).toBe(NotFound);

            const newcount = await testQueryRepository.count();

            // we've removed 1 document
            expect(newcount).toBe(vocabularyListViews.length - 1);
        });
    });

    describe(`publish`, () => {
        const viewToPublish = vocabularyListViews[0];

        beforeEach(async () => {
            await testQueryRepository.createMany(vocabularyListViews);
        });

        it(`should publish the given view`, async () => {
            await testQueryRepository.publish(viewToPublish.id);

            const updatedView = (await testQueryRepository.fetchById(viewToPublish.id)) as {
                isPublished: boolean;
            };

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`allowUser`, () => {
        const targetView = vocabularyListViews[0];

        const user = getValidAggregateInstanceForTest(AggregateType.user);

        beforeEach(async () => {
            await testQueryRepository.create(targetView);

            await databaseProvider.getDatabaseForCollection(ArangoCollectionId.users).clear();

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.users)
                .create(mapEntityDTOToDatabaseDocument(user));
        });

        it(`should allow the given user`, async () => {
            await testQueryRepository.allowUser(targetView.id, user.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetView.id
            )) as VocabularyListViewModel;

            const acl = new AccessControlList(updatedView.accessControlList);

            expect(acl.canUser(user.id)).toBe(true);
        });
    });

    /**
     * TODO We should remove this in favour of making the attribution atomic
     * with each update write.
     */
    describe(`attribute`, () => {
        const targetView = vocabularyListViews[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetView);

            await contributorRepository.createMany(testContributors);
        });

        it(`should add the expected attributions for contributors`, async () => {
            await testQueryRepository.attribute(
                targetView.id,
                testContributors.map(({ id }) => id)
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetView.id
            )) as VocabularyListViewModel;

            const { contributions } = updatedView;

            expect(contributions).toHaveLength(testContributors.length);

            const missingContributions = contributions.filter(
                ({ id: foundContributorId }) => !testContributors.some(idEquals(foundContributorId))
            );

            expect(missingContributions).toEqual([]);
        });
    });

    describe(`translateName`, () => {
        const targetView = vocabularyListViews[0];

        const translationText = 'name in translation langauge';

        const translationRole = MultilingualTextItemRole.freeTranslation;

        beforeEach(async () => {
            await testQueryRepository.create(targetView);

            await contributorRepository.createMany(testContributors);
        });

        it(`should translate the name for the given vocabulary list`, async () => {
            // Act
            await testQueryRepository.translateName(targetView.id, {
                text: translationText,
                languageCode: translationLanguageCode,
                role: MultilingualTextItemRole.freeTranslation,
            });

            // Assert
            const updatedView = (await testQueryRepository.fetchById(
                targetView.id
            )) as VocabularyListViewModel;

            const translationItemSearchResult = new MultilingualText(
                updatedView.name
            ).getTranslation(translationLanguageCode);

            expect(translationItemSearchResult).not.toBe(NotFound);

            const { text: foundText, role: foundRole } =
                translationItemSearchResult as IMultilingualTextItem;

            expect(foundText).toBe(translationText);

            expect(foundRole).toBe(translationRole);
        });
    });

    describe(`registerFilterProperty`, () => {
        const targetView = vocabularyListViews[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetView);

            await contributorRepository.createMany(testContributors);
        });
        describe(`when there is an existing vocabulary list`, () => {
            it(`should register the given filter property`, async () => {
                await testQueryRepository.registerFilterProperty(
                    targetView.id,
                    filterPropertyName,
                    FilterPropertyType.selection,
                    allowedValuesAndLabels
                );

                const updatedView = (await testQueryRepository.fetchById(
                    targetView.id
                )) as VocabularyListViewModel;

                const {
                    form: { fields },
                } = updatedView;

                const formFieldSearchResult = fields.find(
                    ({ name }) => name === filterPropertyName
                );

                expect(formFieldSearchResult).toBeTruthy();

                const { type: viewFormType } = formFieldSearchResult;

                expect(viewFormType).toBe(FormFieldType.staticSelect);

                const foundOptions = formFieldSearchResult.options as IValueAndDisplay<
                    string | boolean
                >[];

                expect(foundOptions).toHaveLength(allowedValuesAndLabels.length);

                const missingOptions = foundOptions.filter(
                    (option) =>
                        !allowedValuesAndLabels.some(
                            ({ value, label }) => value === option.value && label === option.display
                        )
                );

                expect(missingOptions).toEqual([]);

                /**
                 * We may want to consider an alternative option where we
                 * project the available commands off the view model. For example,
                 * we don't really want to expose "AnalyzeTerm" if no "Entries"
                 * have been added.
                 *
                 * This is why we should avoid testing this behaviour in the repository
                 * and test it only at the integration level in the event handler.
                 */
                // expect(updatedView.actions).toContain('ANALYZE_TERM_IN_VOCABULARY_LIST');
            });
        });
    });

    describe(`addTerm`, () => {
        const targetView = vocabularyListViews[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetView);

            await contributorRepository.createMany(testContributors);

            await termQueryRepository.create(existingTerm);
        });

        it(`should add the expected term`, async () => {
            await testQueryRepository.addTerm(targetView.id, existingTerm.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetView.id
            )) as VocabularyListViewModel;

            const entrySearchResult = updatedView.entries.find(
                ({ term }) => term.id === existingTerm.id
            );

            expect(entrySearchResult).toBeTruthy();

            const termText = new MultilingualText(entrySearchResult.term.name);

            const { text: foundText, languageCode: foundLanguageCode } =
                termText.getOriginalTextItem();

            expect(foundText).toBe(originalTextForTerm);

            expect(foundLanguageCode).toBe(originalLanguageCode);

            // TODO verify additional properties
        });
    });

    describe(`analyzeTerm`, () => {
        describe(`when there is an entry for an existing term, but no existing analysis (property values)`, () => {
            const targetVocabularyListId = buildDummyUuid(987);

            // TODO deal with this awkward type
            const targetViewDto: DTO<VocabularyListViewModel> = {
                id: targetVocabularyListId,
                name: buildMultilingualTextWithSingleItem(
                    'vocabulary list with existing entry',
                    LanguageCode.English
                ),
                form: {
                    fields: [
                        {
                            name: filterPropertyName,
                            label: 'who is doing the action',
                            description: 'select the subject of the verb in the paradigm',
                            constraints: [],
                            type:
                                filterPropertyType === FilterPropertyType.selection
                                    ? FormFieldType.staticSelect
                                    : FormFieldType.switch,
                            options: allowedValuesAndLabels.map(({ label, value }) => ({
                                display: label,
                                value,
                            })),
                        },
                    ],
                },
                isPublished: false,
                accessControlList: new AccessControlList(),
                contributions: [],

                entries: [
                    {
                        term: existingTerm,
                        variableValues: {},
                    },
                ].map((dto) => new VocabularyListEntryViewModel(dto)),
                actions: [],
            };

            const targetView = VocabularyListViewModel.fromDto(targetViewDto);

            beforeEach(async () => {
                await databaseProvider.clearViews();

                await testQueryRepository.create(targetView);

                await contributorRepository.createMany(testContributors);

                await termQueryRepository.create(existingTerm);
            });

            it(`should add the filter property values for the given entry`, async () => {
                const valueForProperty = allowedValuesAndLabels[0].value;

                // act
                await testQueryRepository.analyzeTerm(targetView.id, existingTerm.id, {
                    // TODO add test case where mutliple properties are analyzed
                    // TODO add test case where there are existing properties with values for this entry
                    [filterPropertyName]: valueForProperty,
                });

                const updatedView = (await testQueryRepository.fetchById(
                    targetView.id
                )) as VocabularyListViewModel;

                const targetEntry = updatedView.entries.find(
                    ({ term }) => term.id === existingTerm.id
                );

                expect(targetEntry).toBeTruthy();

                expect([...Object.entries(targetEntry.variableValues)]).toHaveLength(1);

                expect(
                    Object.entries(targetEntry.variableValues).some(
                        ([foundName, foundValue]) =>
                            foundName === filterPropertyName && foundValue === valueForProperty
                    )
                );
            });
        });

        describe(`when there is an entry for an existing term and it has some existing analysis (property values)`, () => {
            const targetVocabularyListId = buildDummyUuid(987);

            // TODO deal with this awkward type
            const targetViewDto: DTO<VocabularyListViewModel> = {
                id: targetVocabularyListId,
                name: buildMultilingualTextWithSingleItem(
                    'vocabulary list with existing entry',
                    LanguageCode.English
                ),
                form: {
                    fields: [
                        {
                            name: filterPropertyName,
                            label: 'who is doing the action',
                            description: 'select the subject of the verb in the paradigm',
                            constraints: [],
                            type:
                                filterPropertyType === FilterPropertyType.selection
                                    ? FormFieldType.staticSelect
                                    : FormFieldType.switch,
                            options: allowedValuesAndLabels.map(({ label, value }) => ({
                                display: label,
                                value,
                            })),
                        },
                    ],
                },
                isPublished: false,
                accessControlList: new AccessControlList(),
                contributions: [],

                entries: [
                    // empty
                ],
                actions: [],
            };

            const targetView = VocabularyListViewModel.fromDto(targetViewDto);

            beforeEach(async () => {
                await databaseProvider.clearViews();

                await testQueryRepository.create(targetView);

                await contributorRepository.createMany(testContributors);

                await termQueryRepository.create(existingTerm);
            });

            /**
             * We need to revisit the domain logic and make sure we are handling
             * use cases that will actually happen with the real data.
             */
            it('should merge the new property values with the old', async () => {
                const selectedFilterPropertyValue = allowedValuesAndLabels[0].value;

                await testQueryRepository.importEntries(targetView.id, [
                    {
                        termId: existingTerm.id,
                        propertyValues: {
                            [filterPropertyName]: selectedFilterPropertyValue,
                        },
                        // TODO add additional terms here
                    },
                ]);

                const updatedView = (await testQueryRepository.fetchById(
                    targetView.id
                )) as unknown as VocabularyListViewModel;

                const { entries } = updatedView;

                expect(entries).toHaveLength(1);

                const searchResult = entries.find(({ term }) => term.id == existingTerm.id);

                expect(searchResult).toBeTruthy();

                expect([...Object.keys(searchResult.variableValues)]).toHaveLength(1);

                expect(searchResult.variableValues[filterPropertyName]).toBe(
                    selectedFilterPropertyValue
                );
            });
        });
    });
});
