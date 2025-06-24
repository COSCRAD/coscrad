import {
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    IEdgeConnectionContext,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
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
    ConnectionRecordForResourceViewModel,
    TagViewModel,
} from '../../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { EventSourcedTagRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { DigitalTextViewModel } from '../../../../queries/digital-text';
import { TestEventStream } from '../../../../test-data/events';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextFromBilingualText } from '../../../common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildInstanceFactory from '../../../factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { EventSourcedAudioItemViewModel } from '../../audio-visual/audio-item/queries';
import { IAudioItemQueryRepository } from '../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { EdgeConnection } from '../../context/edge-connection.entity';
import { PhotographViewModel } from '../../photograph/queries/photograph.view-model';
import { ArangoPhotographQueryRepository } from '../../photograph/repositories';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import { Tag } from '../../tag/tag.entity';
import { ContributionSummary, CoscradContributor } from '../../user-management';
import { DigitalTextCreated, DigitalTextPageImportRecord } from '../commands';
import DigitalTextPage from '../entities/digital-text-page.entity';
import { ArangoDigitalTextQueryRepository } from './arango-digital-text-query-repository';
import { IDigitalTextQueryRepository } from './digital-text-query-repository.interface';

const digitalTextIds = [1, 2, 3].map(buildDummyUuid);

const contributorIds = [101, 102, 103].map(buildDummyUuid);

const testContributors = contributorIds.map((id, index) =>
    buildTestInstance(CoscradContributor, {
        id,
        fullName: {
            firstName: 'Contributor',
            lastName: `Number-${index + 101}`,
        },
    })
);

describe(`ArangoDigitalTextQueryRepository`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let testAudioRepository: IAudioItemQueryRepository;

    let connectionProvider: ArangoConnectionProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let contributorRepository: IRepositoryForAggregate<CoscradContributor>;

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

        testQueryRepository = new ArangoDigitalTextQueryRepository(connectionProvider);

        testAudioRepository = new ArangoAudioItemQueryRepository(connectionProvider);

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
        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        const digitalTextId = digitalTextIds[0];

        const pageIds = ['a', 'b', 'c'];

        const pages = pageIds.map((identifier, index) =>
            buildTestInstance(DigitalTextPage, {
                identifier,
                content: buildMultilingualTextWithSingleItem(
                    `English content for page: ${identifier}`
                ),
                photographId: buildDummyUuid(200 + index),
                audio: MultilingualAudio.buildEmpty().addAudio(
                    buildDummyUuid(210 + index),
                    LanguageCode.English
                ) as MultilingualAudio, // we are asserting that this will not fail
            })
        );

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            id: digitalTextId,
            tags: ['plants', 'animals'].map((label) =>
                buildTestInstance(EventSourcedTagRecordForResourceViewModel, {
                    label,
                })
            ),
            notes: [10, 20, 30].map((sequenceNumber) =>
                buildTestInstance(NoteRecordForResourceViewModel, {
                    id: buildDummyUuid(sequenceNumber),
                    note: buildMultilingualTextWithSingleItem(`note # ${sequenceNumber}`),
                    context: {
                        type: EdgeConnectionContextType.general,
                    },
                })
            ),
            connections: [
                buildTestInstance(ConnectionRecordForResourceViewModel, {
                    id: buildDummyUuid(40),
                    note: buildMultilingualTextWithSingleItem(
                        `this is why the texts are connected`
                    ),
                    otherCompositeIdentifier: {
                        type: ResourceType.digitalText,
                        id: buildDummyUuid(901),
                    },
                    otherContext: {
                        type: EdgeConnectionContextType.general,
                    },
                    selfContext: {
                        type: EdgeConnectionContextType.general,
                    },
                }),
            ],
            name: buildMultilingualTextFromBilingualText(
                {
                    text: 'English title',
                    languageCode: LanguageCode.English,
                },
                {
                    text: 'Chilcotin title',
                    languageCode: LanguageCode.Chilcotin,
                }
            ),
            pages,
            contributions: [
                buildTestInstance(ContributionSummary, {
                    type: 'DIGITAL_TEXT_CREATED',
                    statement: 'Digital Text Created by: Janis Deeris',
                    contributorIds: [buildDummyUuid(78)],
                }),
            ],
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetDigitalText);
        });

        describe(`when there is a digital text with the given ID`, () => {
            it(`should return the expected result`, async () => {
                const result = await testQueryRepository.fetchById(digitalTextId);

                expect(result).not.toBe(NotFound);

                /**
                 * What we really want is to make sure that all properties are
                 * being persisted \ set in the factories. It's tedious to
                 * check each property one at a time.
                 */
                expect(result).toMatchSnapshot();
            });
        });

        describe(`when there is no digital text with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('bogus-id');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        const digitalTexts = digitalTextIds.map((id) =>
            buildTestInstance(DigitalTextViewModel, {
                id,
            })
        );

        beforeEach(async () => {
            await testQueryRepository.createMany(digitalTexts);
        });

        it(`should return the expected digital texts`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result).toHaveLength(digitalTexts.length);

            const missingDigitalTexts = digitalTexts.filter(
                ({ id }) => !result.some((found) => found.id === id)
            );

            expect(missingDigitalTexts).toEqual([]);
        });
    });

    describe(`count`, () => {
        const digitalTexts = digitalTextIds.map((id) =>
            buildTestInstance(DigitalTextViewModel, { id })
        );

        beforeEach(async () => {
            await testQueryRepository.createMany(digitalTexts);
        });

        it(`should return the number of digital texts`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(digitalTexts.length);
        });
    });

    describe(`publish`, () => {
        const digitalTextId = digitalTextIds[0];

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            id: digitalTextId,
            isPublished: false,
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetDigitalText);
        });

        it(`should publish the target digital text`, async () => {
            await testQueryRepository.publish(digitalTextId);

            const updatedView = (await testQueryRepository.fetchById(
                digitalTextId
            )) as DigitalTextViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`tag`, () => {
        const existingTagLabel = 'plants';

        const existingTag: TagViewModel = {
            id: buildDummyUuid(90),
            label: existingTagLabel,
            name: buildMultilingualTextWithSingleItem(existingTagLabel),
            // TODO do we want this here?
            members: [],
        };

        const newTagId = buildDummyUuid(91);

        const newTagLabel = 'animals';

        // TODO use event sourced setup?
        const newTag = buildTestInstance(Tag, {
            id: newTagId,
            label: newTagLabel,
        });

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            tags: [existingTag],
        });

        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection(ArangoCollectionId.tags).clear();

            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.tags)
                .create(mapEntityDTOToDatabaseDocument(newTag.toDTO()));
        });

        it(`should tag the digital text`, async () => {
            await testQueryRepository.tag(targetDigitalText.id, newTag.id);

            const { tags } = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            expect(tags).toHaveLength(2);

            const tagSearchResult = tags.find(({ id }) => id === newTag.id);

            expect(tagSearchResult).toBeTruthy();

            const { label } = tagSearchResult;

            expect(label).toBe(newTagLabel);
        });
    });

    describe(`createNoteAbout`, () => {
        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            notes: [],
        });

        const targetNote = buildTestInstance(EdgeConnection, {
            members: [
                {
                    compositeIdentifier: {
                        type: ResourceType.video,
                        id: targetDigitalText.id,
                    },
                    context: { type: EdgeConnectionContextType.general },
                    role: EdgeConnectionMemberRole.self,
                },
            ],
        });

        beforeEach(async () => {
            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.edgeConnectionCollectionID)
                .clear();

            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);

            /**
             * Note that there is no need to put the target note in the domain
             * database. The context is passed into the repo update method
             * from the note creation event payload.
             */
        });

        it(`should append a note to the term`, async () => {
            await testQueryRepository.createNoteAbout(targetDigitalText.id, {
                noteId: targetNote.id,
                context: targetNote.members[0].context,
                text: targetNote.note,
            });

            const { notes } = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            expect(notes).toHaveLength(1);

            const { note } = notes[0];

            expect(note.toDTO()).toEqual(targetNote.note.toDTO());
        });
    });

    describe(`createConnection`, () => {
        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            // no connections to start
            connections: [],
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);
        });

        it(`should add the connection info`, async () => {
            const generalContext: IEdgeConnectionContext = {
                type: EdgeConnectionContextType.general,
            };

            const otherCompositeIdentifier = {
                type: 'widget' as ResourceType,
                id: buildDummyUuid(88),
            };

            const noteId = buildDummyUuid(89);

            const textForNote = 'This is why the widget is relevant to the term.';

            const languageCodeForNote = LanguageCode.Chilcotin;

            const role = EdgeConnectionMemberRole.to;

            await testQueryRepository.createConnection(targetDigitalText.id, {
                noteId,
                selfContext: generalContext,
                otherContext: generalContext,
                otherCompositeIdentifier,
                text: buildMultilingualTextWithSingleItem(textForNote, languageCodeForNote),
                role,
            });

            const { connections } = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            expect(connections).toHaveLength(1);

            const {
                selfContext,
                otherCompositeIdentifier: foundCompositeIdentifierForConnectedResource,
                otherContext,
                note,
                role: edgeConnectionMemberRole,
            } = connections[0];

            expect(selfContext).toEqual(generalContext);

            expect(otherContext).toEqual(generalContext);

            expect(foundCompositeIdentifierForConnectedResource).toEqual(otherCompositeIdentifier);

            const { languageCode: foundLanguageCode, text: foundNoteText } =
                note.getOriginalTextItem();

            expect(foundNoteText).toEqual(textForNote);

            expect(foundLanguageCode).toEqual(languageCodeForNote);

            expect(edgeConnectionMemberRole).toEqual(role);
        });
    });

    describe(`allowUser`, () => {
        const digitalTextId = digitalTextIds[0];

        const targeView = buildTestInstance(DigitalTextViewModel, {
            id: digitalTextId,
        });

        beforeEach(async () => {
            // clear existing term views
            await databaseProvider.clearViews();

            // clear existing audio item views

            await testQueryRepository.create(targeView);
        });

        it(`should add the user to the ACL`, async () => {
            const userId = buildDummyUuid(456);

            await testQueryRepository.allowUser(targeView.id, userId);

            const updatedView = (await testQueryRepository.fetchById(
                targeView.id
            )) as DigitalTextViewModel;

            const canUser = updatedView.canUser(userId);

            expect(canUser).toBe(true);
        });
    });

    describe(`attribute`, () => {
        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            id: digitalTextIds[0],
            contributions: [],
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await databaseProvider.getDatabaseForCollection('contributors').clear();

            await testQueryRepository.create(targetDigitalText);

            await contributorRepository.createMany(testContributors);
        });

        describe(`when there are contributor IDs on the event meta`, () => {
            it(`should add the given contributions`, async () => {
                await testQueryRepository.attribute(
                    targetDigitalText.id,
                    new TestEventStream()
                        .buildSingle<DigitalTextCreated>({
                            type: 'DIGITAL_TEXT_CREATED',
                            meta: { contributorIds },
                        })
                        .buildContributionSummary()
                );

                const updatedView = (await testQueryRepository.fetchById(
                    targetDigitalText.id
                )) as DigitalTextViewModel;

                const missingAttributions = updatedView.contributions.filter(
                    (contributionRecord) =>
                        !contributorIds.some((id) => contributionRecord.contributorIds.includes(id))
                );

                expect(missingAttributions).toHaveLength(0);

                const contributionForCreationEvent = updatedView.contributions.find(
                    ({ type }) => type === 'DIGITAL_TEXT_CREATED'
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
                    targetDigitalText.id,
                    new TestEventStream()
                        .buildSingle<DigitalTextCreated>({
                            type: 'DIGITAL_TEXT_CREATED',
                            meta: {
                                contributorIds: [],
                            },
                        })
                        .buildContributionSummary()
                );

                const updatedView = (await testQueryRepository.fetchById(
                    targetDigitalText.id
                )) as DigitalTextViewModel;

                const targetContribution = updatedView.contributions[0];

                expect(targetContribution.contributorIds).toHaveLength(0);

                expect(targetContribution.statement.includes('by: (data entry) admin')).toBe(true);
            });
        });
    });

    describe(`translateTitle`, () => {
        const translationLanguageCode = LanguageCode.English;

        const translateTitle = 'translation of title';

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            name: buildMultilingualTextWithSingleItem('existing title', LanguageCode.Chilcotin),
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);
        });

        it('should translate the title', async () => {
            await testQueryRepository.translateTitle(
                targetDigitalText.id,
                translateTitle,
                translationLanguageCode
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            const { name } = updatedView;

            expect(name.has(translationLanguageCode)).toBe(true);

            const translationItemSearchResult = name.getTranslation(translationLanguageCode);

            expect(translationItemSearchResult).not.toBe(NotFound);

            const { text: foundTranslationText, role: foundRole } =
                translationItemSearchResult as MultilingualTextItem;

            expect(foundTranslationText).toBe(translateTitle);

            expect(foundRole).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`addPage`, () => {
        const newPageIdentifier = '55';

        describe(`when there are no pages`, () => {
            const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
                pages: [],
            });

            beforeEach(async () => {
                await databaseProvider.clearViews();

                await testQueryRepository.create(targetDigitalText);
            });

            it('should add the page', async () => {
                await testQueryRepository.addPage(targetDigitalText.id, newPageIdentifier);

                const updatedView = (await testQueryRepository.fetchById(
                    targetDigitalText.id
                )) as DigitalTextViewModel;

                const { pages } = updatedView;

                expect(pages).toHaveLength(1);
            });
        });

        describe(`when there are already some pages`, () => {
            const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
                pages: ['a', 'b', 'c'].map(
                    (identifier) =>
                        new DigitalTextPage({
                            identifier,
                            audio: MultilingualAudio.buildEmpty(),
                        })
                ),
            });

            beforeEach(async () => {
                await databaseProvider.clearViews();

                await testQueryRepository.create(targetDigitalText);
            });

            it(`should add the new page`, async () => {
                await testQueryRepository.addPage(targetDigitalText.id, newPageIdentifier);

                const { pages } = (await testQueryRepository.fetchById(
                    targetDigitalText.id
                )) as DigitalTextViewModel;

                expect(pages).toHaveLength(targetDigitalText.pages.length + 1);
            });
        });
    });

    describe(`addContentToPage`, () => {
        const pageIdentifier = 'XII';

        const textToAdd = 'bla bla bla';

        const languageCode = LanguageCode.English;

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            pages: [
                new DigitalTextPage({
                    identifier: pageIdentifier,
                    audio: MultilingualAudio.buildEmpty(),
                }),
            ],
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);
        });

        it(`should add the content to the page`, async () => {
            await testQueryRepository.addContentToPage(
                targetDigitalText.id,
                pageIdentifier,
                textToAdd,
                languageCode
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            const targetPage = updatedView.pages.find(
                ({ identifier }) => identifier === pageIdentifier
            );

            const { content } = targetPage;

            expect(content).toBeTruthy();

            const { languageCode: foundLanguageCode, text: foundText } =
                content.getOriginalTextItem();

            expect(foundLanguageCode).toBe(languageCode);

            expect(foundText).toBe(textToAdd);
        });
    });

    describe(`translatePageContent`, () => {
        const pageIdentifier = '100';

        const originalLanguageCode = LanguageCode.English;

        const translationLanguageCode = LanguageCode.Chilcotin;

        const translationText = 'translation of content on page 100';

        const existingPageContent = buildMultilingualTextWithSingleItem(
            'existing content text',
            originalLanguageCode
        );

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            pages: [
                buildTestInstance(DigitalTextPage, {
                    identifier: pageIdentifier,
                    content: existingPageContent,
                }),
            ],
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);
        });

        it(`should translate the page's content`, async () => {
            await testQueryRepository.translatePageContent(
                targetDigitalText.id,
                pageIdentifier,
                translationText,
                translationLanguageCode
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            const targetPage = updatedView.pages.find(
                ({ identifier }) => identifier === pageIdentifier
            );

            const translationItemSearchResult =
                targetPage.content.getTranslation(translationLanguageCode);

            expect(translationItemSearchResult).not.toBe(NotFound);

            const { text: foundTranslationText, role: foundRole } =
                translationItemSearchResult as MultilingualTextItem;

            expect(foundTranslationText).toBe(translationText);

            expect(foundRole).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`addAudioToPage`, () => {
        const pageIdentifier = 'V';

        const targetLanguageCode = LanguageCode.English;

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            pages: [
                buildTestInstance(DigitalTextPage, {
                    identifier: pageIdentifier,
                    content: buildMultilingualTextWithSingleItem(
                        'existing content text',
                        targetLanguageCode
                    ),
                    audio: MultilingualAudio.buildEmpty(),
                }),
            ],
        });

        const existingAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            id: buildDummyUuid(890),
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);

            await testAudioRepository.create(existingAudioItem);
        });

        it(`should add audio to the page`, async () => {
            await testQueryRepository.addAudioToPage(
                targetDigitalText.id,
                pageIdentifier,
                existingAudioItem.id,
                targetLanguageCode
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            const targetPage = updatedView.pages.find(
                ({ identifier }) => identifier === pageIdentifier
            );

            expect(targetPage.hasAudio()).toBe(true);

            const audioItemSearchResult = targetPage.getAudioIn(targetLanguageCode);

            expect(audioItemSearchResult).not.toBe(NotFound);

            expect(audioItemSearchResult).toEqual(existingAudioItem.id);
        });
    });

    describe(`addPhotographToPage`, () => {
        const pageIdentifier = 'F2';

        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            pages: [
                buildTestInstance(DigitalTextPage, {
                    identifier: pageIdentifier,
                    content: null,
                    audio: MultilingualAudio.buildEmpty(),
                }),
            ],
        });

        const targetPhotograph = buildTestInstance(PhotographViewModel, {
            id: buildDummyUuid(999),
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);

            /**
             * At present, this is not necessary. However, we may want to add a
             * denormalized view of the photograph on the digital text, at which
             * point this becomes important.
             */
            await new ArangoPhotographQueryRepository(connectionProvider).create(targetPhotograph);
        });

        it(`should add the photograph to the page`, async () => {
            await testQueryRepository.addPhotographToPage(
                targetDigitalText.id,
                pageIdentifier,
                targetPhotograph.id
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            const { photographId } = updatedView.pages.find(
                ({ identifier }) => identifier === pageIdentifier
            );

            expect(photographId).toEqual(targetPhotograph.id);
        });
    });

    describe(`importPages`, () => {
        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            pages: [],
        });

        const audioIds = [301, 302, 303, 304, 305, 306].map(buildDummyUuid);

        const existingAudioItems = audioIds.map((id) =>
            buildTestInstance(EventSourcedAudioItemViewModel, {
                id,
                name: buildMultilingualTextWithSingleItem(`audio item: ${id}`),
            })
        );

        const photographIds = [401, 402, 403, 404, 405, 406].map(buildDummyUuid);

        const existingPhotographs = photographIds.map((id) => {
            return buildTestInstance(PhotographViewModel, {
                id,
                name: buildMultilingualTextWithSingleItem(`photograph: ${id}`),
            });
        });

        const pagesToImport: DigitalTextPageImportRecord[] = [1, 2, 3].map((sequenceNumber) => ({
            pageIdentifier: sequenceNumber.toString(),
            photographId: buildDummyUuid(200 + sequenceNumber),
            content: [
                {
                    text: 'text for Chilcotin (original language)',
                    languageCode: LanguageCode.English,
                    audioItemId: audioIds[sequenceNumber - 1],
                    photographId: photographIds[sequenceNumber - 1],
                    isOriginalLanguage: true,
                },
                {
                    text: 'text for English (translation language)',
                    languageCode: LanguageCode.English,
                    // -1 for 0-indexed + 3 to offset by the number of original audio items
                    audioItemId: audioIds[sequenceNumber + 2],
                    photographId: photographIds[sequenceNumber + 2],
                    isOriginalLanguage: false,
                },
            ],
        }));

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);

            await testAudioRepository.createMany(existingAudioItems);

            await new ArangoPhotographQueryRepository(connectionProvider).createMany(
                existingPhotographs
            );
        });

        it(`should import all page content`, async () => {
            await testQueryRepository.importPages(targetDigitalText.id, pagesToImport);

            const { pages } = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            expect(pages).toHaveLength(pagesToImport.length);
        });
    });

    describe(`addCoverPhotograph`, () => {
        const targetDigitalText = buildTestInstance(DigitalTextViewModel, {
            coverPhotograph: null,
        });

        const targetPhotograph = buildTestInstance(PhotographViewModel, {
            id: buildDummyUuid(800),
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetDigitalText);

            await new ArangoPhotographQueryRepository(connectionProvider).create(targetPhotograph);
        });

        it(`should add the cover photograph to the digital text`, async () => {
            await testQueryRepository.addCoverPhotograph(targetDigitalText.id, targetPhotograph.id);

            const { coverPhotograph } = (await testQueryRepository.fetchById(
                targetDigitalText.id
            )) as DigitalTextViewModel;

            expect(coverPhotograph).toBeTruthy();

            const { id: foundPhotographId } = coverPhotograph;

            expect(foundPhotographId).toBe(targetPhotograph.id);
        });
    });
});
