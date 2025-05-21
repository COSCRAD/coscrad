import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { ConsoleCoscradCliLogger } from '../../../../coscrad-cli/logging';
import { InternalError } from '../../../../lib/errors/InternalError';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoRepositoryForAggregate } from '../../../../persistence/repositories/arango-repository-for-aggregate';
import { VocabularyListViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../test-data/events';
import { buildTestInstance } from '../../../../test-data/utilities';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextFromBilingualText } from '../../../common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildInstanceFactory from '../../../factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AudioItemCreated } from '../../audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import { EventSourcedAudioItemViewModel } from '../../audio-visual/audio-item/queries';
import { IAudioItemQueryRepository } from '../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradContributor } from '../../user-management/contributor';
import { FullName } from '../../user-management/user/entities/user/full-name.entity';
import { IVocabularyListQueryRepository } from '../../vocabulary-list/queries';
import { ArangoVocabularyListQueryRepository } from '../../vocabulary-list/repositories';
import { PromptTermCreated } from '../commands';
import { ITermQueryRepository } from '../queries/term-query-repository.interface';
import { ArangoTermQueryRepository } from './arango-term-query-repository';

describe(`ArangoTermQueryRepository`, () => {
    let testQueryRepository: ITermQueryRepository;

    let vocabularyListQueryRepository: IVocabularyListQueryRepository;

    let audioItemQueryRepository: IAudioItemQueryRepository;

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

        // TODO Use the DI system so this is more extensible to keep test maintenance lower
        audioItemQueryRepository = new ArangoAudioItemQueryRepository(connectionProvider);

        testQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            audioItemQueryRepository,
            new ConsoleCoscradCliLogger()
        );

        vocabularyListQueryRepository = new ArangoVocabularyListQueryRepository(
            connectionProvider,
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

    afterAll(async () => {
        databaseProvider.close();
    });

    const termIds = [1, 2, 3].map(buildDummyUuid);

    const buildTermText = (id: string) => `term ${id}`;

    const termText = buildTermText(termIds[0]);

    const originalLanguageCode = LanguageCode.Chilcotin;

    const translationLanguageCode = LanguageCode.English;

    const textTranslation = 'foobar';

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

    const promptTermView = TermViewModel.fromPromptTermCreated(
        new TestEventStream()
            .andThen<PromptTermCreated>({
                type: 'PROMPT_TERM_CREATED',
            })
            .as({
                type: AggregateType.term,
                id: buildDummyUuid(876),
            })[0] as PromptTermCreated
    );

    const termViews: TermViewModel[] = termIds.map((id) =>
        TermViewModel.fromDto({
            id,
            contributions: [],
            name: buildMultilingualTextWithSingleItem(buildTermText(id), originalLanguageCode),
            actions: [
                'TRANSLATE_TERM',
                'ADD_AUDIO_FOR_TERM',
                'TAG_RESOURCE',
                'CREATE_NOTE_ABOUT_RESOURCE',
                'CONNECT_RESOURCES_WITH_NOTE',
                'PUBLISH_RESOURCE',
                'GRANT_RESOURCE_READ_ACCESS_TO_USER',
            ],
            isPublished: false,
            accessControlList: new AccessControlList(),
            vocabularyLists: [],
        })
    );

    describe(`fetchById`, () => {
        const targetTermId = termIds[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(termViews[0]);
        });

        describe(`when there is a term with the given ID`, () => {
            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(targetTermId);

                expect(result).not.toBe(NotFound);

                const { name } = result as TermViewModel;

                const foundOriginalTextForTerm = name.items.find(
                    ({ languageCode }) => languageCode === originalLanguageCode
                ).text;

                expect(foundOriginalTextForTerm).toBe(termText);
            });
        });

        describe(`when there is no term with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('BOGUS_123');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            for (const term of termViews) {
                await testQueryRepository.create(term);
            }
        });

        it(`should return the expected term views`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result).toHaveLength(termViews.length);
        });
    });

    describe(`count`, () => {
        describe(`when there are term views in the database`, () => {
            beforeEach(async () => {
                await databaseProvider.clearViews();

                for (const term of termViews) {
                    await testQueryRepository.create(term);
                }
            });

            it(`should return the expected result`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(termViews.length);
            });
        });

        describe(`when the database collection is empty`, () => {
            beforeEach(async () => {
                await databaseProvider.clearViews();

                // no terms are added here
            });

            it(`should return 0`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(0);
            });
        });
    });

    describe(`translate`, () => {
        const targetTerm = termViews[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetTerm);
        });

        it(`should append the expected multilingual text item`, async () => {
            const targetTranslationRole = MultilingualTextItemRole.freeTranslation;

            await testQueryRepository.translate(targetTerm.id, {
                text: textTranslation,
                languageCode: translationLanguageCode,
                role: targetTranslationRole,
            });

            const updatedTerm = await testQueryRepository.fetchById(targetTerm.id);

            if (isNotFound(updatedTerm)) {
                expect(updatedTerm).not.toBe(NotFound);

                throw new InternalError('test failed');
            }

            const updatedName = new MultilingualText(updatedTerm.name); // we want an instance (not a DTO) for the query methods

            const searchResultForTranslation = updatedName.getTranslation(translationLanguageCode);

            expect(searchResultForTranslation).not.toBe(NotFound);

            const foundTranslation = searchResultForTranslation as MultilingualTextItem;

            expect(foundTranslation.text).toBe(textTranslation);

            expect(foundTranslation.role).toBe(targetTranslationRole);

            /**
             * Currently, you can translate into multiple languages, but this might
             * not be what we want in the long run. We could hide the command
             * as a matter of convenience to hide the ability to translate into a third
             * langauge for now.
             */
            expect(updatedTerm.actions).toContain('TRANSLATE_TERM');
        });
    });

    describe(`elicitFromPrompt`, () => {
        const targetTerm = promptTermView;

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetTerm);
        });

        it(`should append the expected multilingual text item`, async () => {
            const targetTranslationRole = MultilingualTextItemRole.elicitedFromPrompt;

            await testQueryRepository.elicitFromPrompt(targetTerm.id, {
                text: textTranslation,
                languageCode: originalLanguageCode,
            });

            const updatedTerm = await testQueryRepository.fetchById(targetTerm.id);

            if (isNotFound(updatedTerm)) {
                expect(updatedTerm).not.toBe(NotFound);

                throw new InternalError('test failed');
            }

            const updatedName = new MultilingualText(updatedTerm.name); // we want an instance (not a DTO) for the query methods

            const searchResultForTranslation = updatedName.getTranslation(originalLanguageCode);

            expect(searchResultForTranslation).not.toBe(NotFound);

            const foundTranslation = searchResultForTranslation as MultilingualTextItem;

            expect(foundTranslation.text).toBe(textTranslation);

            expect(foundTranslation.role).toBe(targetTranslationRole);

            /**
             * Currently, you can only elicit a term from a prompt into a single
             * translation language.
             */
            expect(updatedTerm.actions).not.toContain('ELICIT_TERM_FROM_PROMPT');
        });
    });

    describe(`addAudio`, () => {
        const targetTerm = termViews[0];

        const audioItemId = buildDummyUuid(55);

        const mediaItemId = buildDummyUuid(56);

        const audioCreationEvent = new TestEventStream()
            .andThen<AudioItemCreated>({
                type: 'AUDIO_ITEM_CREATED',
                payload: {
                    mediaItemId,
                },
            })
            .as({
                type: AggregateType.audioItem,
                id: audioItemId,
            })[0] as AudioItemCreated;

        const targetAudioItemView =
            EventSourcedAudioItemViewModel.fromAudioItemCreated(audioCreationEvent);

        beforeEach(async () => {
            // clear existing term views
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetTerm);

            await audioItemQueryRepository.create(targetAudioItemView);
        });

        it(`should append the audio item`, async () => {
            await testQueryRepository.addAudio(targetTerm.id, originalLanguageCode, audioItemId);

            const updatedView = (await testQueryRepository.fetchById(
                targetTerm.id
            )) as TermViewModel;

            // TODO In the future, we should use multilingual audio for terms
            expect(updatedView.mediaItemId).toBe(mediaItemId);

            expect(updatedView.actions).not.toContain('ADD_AUDIO_FOR_TERM');
        });
    });

    describe(`allowUser`, () => {
        const targetTerm = termViews[0];

        beforeEach(async () => {
            // clear existing term views
            await databaseProvider.clearViews();

            // clear existing audio item views

            await testQueryRepository.create(targetTerm);
        });

        it(`should add the user to the ACL`, async () => {
            const userId = buildDummyUuid(456);

            await testQueryRepository.allowUser(targetTerm.id, userId);

            const updatedView = (await testQueryRepository.fetchById(
                targetTerm.id
            )) as TermViewModel;

            const updatedAcl = new AccessControlList(updatedView.accessControlList);

            const canUser = updatedAcl.canUser(userId);

            expect(canUser).toBe(true);
        });
    });

    describe(`delete`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(termViews);
        });

        it(`should remove the given term`, async () => {
            const targetTermViewId = termIds[0];

            const expectedNumberOfTermsAfterDelete = termViews.length - 1;

            await testQueryRepository.delete(targetTermViewId);

            const actualNumberOfTerms = await testQueryRepository.count();

            expect(actualNumberOfTerms).toBe(expectedNumberOfTermsAfterDelete);
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(termViews);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(termViews.length);
        });
    });

    describe(`create`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();
        });

        it(`should create the correct term view`, async () => {
            const termToCreate = termViews[0];

            // act
            await testQueryRepository.create(termToCreate);

            const searchResult = await testQueryRepository.fetchById(termToCreate.id);

            expect(searchResult).not.toBe(NotFound);

            const foundTermView = searchResult as TermViewModel;

            const name = new MultilingualText(foundTermView.name);

            expect(name.getOriginalTextItem().text).toBe(termText);
        });
    });

    describe(`createMany`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();
        });

        it(`should create the expected term views`, async () => {
            // act
            await testQueryRepository.createMany(termViews);

            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(termViews.length);
        });
    });

    describe('publish', () => {
        const targetTerm = termViews[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetTerm);
        });

        it(`should publish the given term`, async () => {
            await testQueryRepository.publish(targetTerm.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetTerm.id
            )) as TermViewModel;

            expect(updatedView.isPublished).toBe(true);

            expect(updatedView.actions).not.toContain('PUBLISH_RESOURCE');
        });
    });

    /**
     * TODO[https://www.pivotaltracker.com/story/show/188764063] support `unpublish`
     */
    describe(`attribute`, () => {
        const targetTerm = termViews[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await databaseProvider.getDatabaseForCollection('contributors').clear();

            await testQueryRepository.create(targetTerm);

            await contributorRepository.createMany(testContributors);
        });

        describe(`when there are contributor IDs on the event meta`, () => {
            it(`should add the given contributions`, async () => {
                await testQueryRepository.attribute(
                    targetTerm.id,
                    buildTestInstance(PromptTermCreated, {
                        type: 'PROMPT_TERM_CREATED',
                        meta: {
                            contributorIds: testContributors.map((c) => c.id),
                        },
                    })
                );

                const updatedView = (await testQueryRepository.fetchById(
                    targetTerm.id
                )) as TermViewModel;

                const missingAttributions = updatedView.contributions.filter(
                    (contributionRecord) =>
                        !contributorIds.some((id) => contributionRecord.contributorIds.includes(id))
                );

                expect(missingAttributions).toHaveLength(0);

                const contributionForCreationEvent = updatedView.contributions.find(
                    ({ type }) => type === 'PROMPT_TERM_CREATED'
                );

                expect(contributionForCreationEvent.statement).toMatchSnapshot();

                expect(contributionForCreationEvent.contributorIds).toEqual(
                    testContributors.map(({ id }) => id)
                );
            });
        });

        describe(`when there are no contributor IDs on the event meta`, () => {
            it(`should default the message to admin`, async () => {
                await testQueryRepository.attribute(
                    targetTerm.id,
                    buildTestInstance(PromptTermCreated, {
                        type: 'PROMPT_TERM_CREATED',
                        meta: {
                            contributorIds: [],
                        },
                    })
                );

                const updatedView = (await testQueryRepository.fetchById(
                    targetTerm.id
                )) as TermViewModel;

                const targetContribution = updatedView.contributions[0];

                expect(targetContribution.contributorIds).toHaveLength(0);

                expect(targetContribution.statement.includes('by: admin')).toBe(true);
            });
        });
    });

    describe(`indexVocabularyList`, () => {
        describe(`when the vocabulary list exists`, () => {
            const vocabularyListId = buildDummyUuid(596);

            const vocabularyListName = buildMultilingualTextFromBilingualText(
                { text: 'vl name', languageCode: LanguageCode.Chilcotin },
                { text: 'vl name (translated to English', languageCode: LanguageCode.English }
            );

            const vocabularyListView = buildTestInstance(VocabularyListViewModel, {
                id: vocabularyListId,
                name: vocabularyListName,
            });

            const targetTerm = termViews[0];

            beforeEach(async () => {
                await databaseProvider.clearViews();

                await databaseProvider.getDatabaseForCollection('contributors').clear();

                await testQueryRepository.create(targetTerm);

                await vocabularyListQueryRepository.create(vocabularyListView);
            });

            it(`should update the view with a reference to the associated vocabulary list`, async () => {
                await testQueryRepository.indexVocabularyList(targetTerm.id, vocabularyListId);

                const { vocabularyLists } = (await testQueryRepository.fetchById(
                    targetTerm.id
                )) as TermViewModel;

                expect(vocabularyLists).toHaveLength(1);

                expect(vocabularyLists[0].id).toBe(vocabularyListId);

                expect(vocabularyLists[0].name.toString()).toBe(vocabularyListName.toString());
            });
        });
    });
});
