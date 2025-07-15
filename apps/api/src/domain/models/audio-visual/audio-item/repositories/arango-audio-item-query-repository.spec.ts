import {
    AggregateType,
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    IAudioItemViewModel,
    IDetailQueryResult,
    IEdgeConnectionContext,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import buildInstanceFactory from '../../../../../domain/factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { isNotFound, NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoRepositoryForAggregate } from '../../../../../persistence/repositories/arango-repository-for-aggregate';
import { NoteRecordForResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { EventSourcedTagViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { EdgeConnection } from '../../../context/edge-connection.entity';
import { AccessControlList } from '../../../shared/access-control/access-control-list.entity';
import { Tag } from '../../../tag/tag.entity';
import { CoscradContributor } from '../../../user-management';
import { TranscriptItem } from '../../shared/entities/transcript-item.entity';
import { TranscriptParticipant } from '../../shared/entities/transcript-participant';
import { Transcript } from '../../shared/entities/transcript.entity';
import { TranscriptLineItemDto, TranslationItem } from '../commands';
import { AudioItemCreated } from '../commands/create-audio-item/audio-item-created.event';
import { EventSourcedAudioItemViewModel } from '../queries';
import { IAudioItemQueryRepository } from '../queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from './arango-audio-item-query-repository';

const audioItemId = buildDummyUuid(1);

const compositeIdForSingleTerm = {
    type: AggregateType.audioItem,
    id: audioItemId,
};

const participant = new TranscriptParticipant({
    initials: 'WW',
    name: 'William Who',
});

const speakerInitials = participant.initials;

const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
    transcript: Transcript.buildEmpty(),
});

const originalLanguageCode = LanguageCode.Chilcotin;
const translationLanguageCode = LanguageCode.English;

const lineItems = [1, 2, 3, 4, 5].map((i) =>
    buildTestInstance(TranscriptLineItemDto, {
        inPointMilliseconds: 100 * i,
        outPointMilliseconds: 100 * i + 50,
        speakerInitials,
        text: `text for line item #${i}`,
        languageCode: originalLanguageCode,
    })
);

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

describe(`ArangoAudioItemQueryRepository`, () => {
    let testQueryRepository: IAudioItemQueryRepository;

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

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoAudioItemQueryRepository(connectionProvider);

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
        // is this preferred to `databaseProvider.clearViews()` ?
        await databaseProvider.getDatabaseForCollection('audioItem__VIEWS').clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    const mediaItemId = buildDummyUuid(123);

    const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
        type: 'AUDIO_ITEM_CREATED',
        payload: {
            mediaItemId,
        },
    });

    const [creationEvent] = audioItemCreated.as(compositeIdForSingleTerm) as [AudioItemCreated];

    const additionalAudioItems = [101, 102, 103].map((sequenceNumber) => {
        const creationEvent = new TestEventStream()
            .andThen<AudioItemCreated>({
                type: 'AUDIO_ITEM_CREATED',
                payload: {
                    name: `audio item number: ${sequenceNumber}`,
                    languageCodeForName: originalLanguageCode,
                },
            })
            .as({
                type: AggregateType.audioItem,
                id: buildDummyUuid(sequenceNumber),
            })[0] as AudioItemCreated;

        return EventSourcedAudioItemViewModel.fromAudioItemCreated(creationEvent);
    });

    describe(`ArangoAudioItemQueryRepository.fetchById`, () => {
        describe(`when there is an audio item with the given ID`, () => {
            beforeEach(async () => {
                await testQueryRepository.create(
                    EventSourcedAudioItemViewModel.fromAudioItemCreated(creationEvent)
                );
            });

            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(audioItemId);

                expect(result).not.toBe(NotFound);
            });
        });

        describe(`when there is no audio item with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('bogusID');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`ArangoAudioItemQueryRepository.fetchMany`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalAudioItems);
        });

        it(`should return the expected audio item views`, async () => {
            // act
            await testQueryRepository.fetchMany();

            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(additionalAudioItems.length);
        });
    });

    describe(`ArangoAudioItemQueryRepository.count`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalAudioItems);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(additionalAudioItems.length);
        });
    });

    describe(`ArangoAudioItemQueryRepository.create`, () => {
        it(`should create the expected audio item view`, async () => {
            const targetAudioItem = additionalAudioItems[0];

            await testQueryRepository.create(targetAudioItem);

            const searchResult = await testQueryRepository.fetchById(targetAudioItem.id);

            expect(searchResult).not.toBe(NotFound);

            const foundView = searchResult as EventSourcedAudioItemViewModel;

            const name = new MultilingualText(foundView.name);

            expect(name.getOriginalTextItem().text).toBe(`audio item number: 101`);
        });
    });

    describe(`ArangoAudioItemQueryRepository.delete`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalAudioItems);
        });

        it(`should delete the expected audio item`, async () => {
            const targetAudioItemId = additionalAudioItems[0].id;

            // act
            await testQueryRepository.delete(targetAudioItemId);

            const newCount = await testQueryRepository.count();

            expect(newCount).toBe(2);

            const searchResult = await testQueryRepository.fetchById(targetAudioItemId);

            expect(searchResult).toBe(NotFound);
        });
    });

    describe(`createTranscript`, () => {
        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            transcript: null,
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should create the transcript`, async () => {
            await testQueryRepository.createTranscript(targetAudioItem.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            expect(updatedView.transcript).toEqual(Transcript.buildEmpty());
        });
    });

    describe(`translateName`, () => {
        const targetAudioItem = additionalAudioItems[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should update the audio item's name`, async () => {
            const translationOfName = 'translation of audio item name';

            const role = MultilingualTextItemRole.freeTranslation;

            await testQueryRepository.translateName(targetAudioItem.id, {
                text: translationOfName,
                languageCode: translationLanguageCode,
                role,
            });

            const searchResult = await testQueryRepository.fetchById(targetAudioItem.id);

            expect(searchResult).not.toBe(NotFound);

            const updatedView = searchResult as IDetailQueryResult<IAudioItemViewModel>;

            const name = new MultilingualText(updatedView.name);

            const { role: foundTextRole, text: foundText } = name.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(foundTextRole).toBe(role);

            expect(foundText).toBe(translationOfName);
        });
    });

    describe(`publish`, () => {
        const targetAudioItem = additionalAudioItems[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should publish the audio item`, async () => {
            await testQueryRepository.publish(targetAudioItem.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`tag`, () => {
        const existingTagLabel = 'plants';

        const existingTag = buildTestInstance(EventSourcedTagViewModel, {
            id: buildDummyUuid(90),
            label: existingTagLabel,
            name: buildMultilingualTextWithSingleItem(existingTagLabel),
        });

        const newTagId = buildDummyUuid(91);

        const newTagLabel = 'animals';

        // TODO use event sourced setup?
        const newTag = buildTestInstance(Tag, {
            id: newTagId,
            label: newTagLabel,
        });

        const targetTerm = buildTestInstance(EventSourcedAudioItemViewModel, {
            tags: [existingTag],
        });

        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection(ArangoCollectionId.tags).clear();

            await databaseProvider.clearViews();

            await testQueryRepository.create(targetTerm);

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.tags)
                .create(mapEntityDTOToDatabaseDocument(newTag.toDTO()));
        });

        it(`should tag the term`, async () => {
            await testQueryRepository.tag(targetTerm.id, newTag.id);

            const { tags } = (await testQueryRepository.fetchById(
                targetTerm.id
            )) as EventSourcedAudioItemViewModel;

            expect(tags).toHaveLength(2);

            const tagSearchResult = tags.find(({ id }) => id === newTag.id);

            expect(tagSearchResult).toBeTruthy();

            const { label } = tagSearchResult;

            expect(label).toBe(newTagLabel);
        });
    });

    describe(`createNoteAbout`, () => {
        const existingNote = buildTestInstance(NoteRecordForResourceViewModel, {
            id: buildDummyUuid(299),
            note: buildMultilingualTextWithSingleItem('I am already there'),
        });

        const targetView = buildTestInstance(EventSourcedAudioItemViewModel, {
            notes: [existingNote],
        });

        const targetNote = buildTestInstance(EdgeConnection, {
            members: [
                {
                    compositeIdentifier: {
                        type: ResourceType.audioItem,
                        id: targetView.id,
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

            await testQueryRepository.create(targetView);

            /**
             * Note that there is no need to put the target note in the domain
             * database. The context is passed into the repo update method
             * from the note creation event payload.
             */
        });

        it(`should append a note to the view`, async () => {
            await testQueryRepository.createNoteAbout(targetView.id, {
                noteId: targetNote.id,
                context: targetNote.members[0].context,
                text: targetNote.note,
            });

            const { notes } = (await testQueryRepository.fetchById(
                targetView.id
            )) as EventSourcedAudioItemViewModel;

            // this includes the 1 existing note
            expect(notes).toHaveLength(2);

            // TODO should the note properity have "text?"
            const { note } = notes.find(({ id }) => id === targetNote.id);

            expect(note.toDTO()).toEqual(targetNote.note.toDTO());
        });
    });

    describe(`connectResourcesWith`, () => {
        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            connections: [],
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the connection info`, async () => {
            const generalContext: IEdgeConnectionContext = {
                type: EdgeConnectionContextType.general,
            };

            const otherCompositeIdentifier = {
                type: 'widget' as ResourceType,
                id: buildDummyUuid(67),
            };

            const noteId = buildDummyUuid(76);

            const textForNote = 'This is why the widget is relevant to the audio item';

            const languageCodeForNote = LanguageCode.Chilcotin;

            const role = EdgeConnectionMemberRole.to;

            await testQueryRepository.createConnection(targetAudioItem.id, {
                noteId,
                selfContext: generalContext,
                otherContext: generalContext,
                otherCompositeIdentifier: otherCompositeIdentifier,
                text: buildMultilingualTextWithSingleItem(textForNote, languageCodeForNote),
                role,
            });

            const { connections } = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

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
        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            // empty to start
            accessControlList: new AccessControlList(),
        });

        const testUserId = buildDummyUuid(109);

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the user to the query ACL`, async () => {
            await testQueryRepository.allowUser(targetAudioItem.id, testUserId);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            expect(updatedView.accessControlList.canUser(testUserId)).toBe(true);
        });
    });

    describe(`create transcript`, () => {
        const targetAudioItem = additionalAudioItems[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should append an empty transcript to the existing audio item`, async () => {
            await testQueryRepository.createTranscript(targetAudioItem.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            expect(updatedView.transcript).toBeTruthy();
        });
    });

    describe(`add participant`, () => {
        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            transcript: Transcript.buildEmpty(),
        });

        const participant = buildTestInstance(TranscriptParticipant, {});

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the participant`, async () => {
            await testQueryRepository.addParticipant(targetAudioItem.id, participant);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            const { name } = updatedView.transcript.findParticipantByInitials(
                participant.initials
            ) as TranscriptParticipant;

            expect(name).toBe(participant.name);
        });
    });

    describe(`add line item`, () => {
        const participant = new TranscriptParticipant({
            initials: 'JB',
            name: 'Johnny Blaze',
        });

        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            transcript: new Transcript({
                participants: [participant],
                items: [],
            }),
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the line item to an existing transcript`, async () => {
            const inPointMs = 100;

            const outPointMs = inPointMs + 300;

            const text = 'this is what was said';

            const languageCode = LanguageCode.English;

            await testQueryRepository.addLineItem(targetAudioItem.id, {
                inPointMilliseconds: inPointMs,
                outPointMilliseconds: outPointMs,
                text,
                languageCode,
                speakerInitials: participant.initials,
            });

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            const numberOfItems = updatedView.transcript.countLineItems();

            expect(numberOfItems).toBe(1);
        });
    });

    describe(`import line items`, () => {
        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it('should import the line items', async () => {
            await testQueryRepository.importLineItems(targetAudioItem.id, lineItems);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            const numberOfItems = updatedView.transcript.countLineItems();

            expect(numberOfItems).toBe(lineItems.length);

            const missingLineItems = lineItems.filter(
                ({ inPointMilliseconds, outPointMilliseconds }) =>
                    !updatedView.transcript.hasLineItem(inPointMilliseconds, outPointMilliseconds)
            );

            expect(missingLineItems).toEqual([]);
        });
    });

    describe(`translate line item`, () => {
        const originalLanguageCode = LanguageCode.Chilcotin;

        const translationLanguageCode = LanguageCode.English;

        const translationText = 'this is how to translate what was said to English';

        const inPointMilliseconds = 100;

        const outPointMilliseconds = 200;

        const participant = buildTestInstance(TranscriptParticipant);

        const targetLineItem = buildTestInstance(TranscriptItem, {
            inPointMilliseconds,
            outPointMilliseconds,
            speakerInitials: participant.initials,
            text: buildMultilingualTextWithSingleItem('original text', originalLanguageCode),
        });

        const existingTranscript = buildTestInstance(Transcript, {
            participants: [participant],
            items: [targetLineItem],
        });

        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            transcript: existingTranscript,
            lengthMilliseconds: outPointMilliseconds * 10,
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it('should translate the line item', async () => {
            await testQueryRepository.translateLineItem(targetAudioItem.id, {
                inPointMilliseconds,
                outPointMilliseconds,
                text: translationText,
                languageCode: translationLanguageCode,
            });

            const { transcript } = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            const lineItemSearchResult = transcript.getLineItem(
                inPointMilliseconds,
                outPointMilliseconds
            );

            expect(lineItemSearchResult).not.toBe(NotFound);

            const { text } = lineItemSearchResult as TranscriptItem;

            expect(text.hasTranslation()).toEqual(true);

            const { text: foundTranslationText, role } = text.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(foundTranslationText).toEqual(translationText);

            expect(role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`import line item transcripts`, () => {
        const translations = lineItems.map(
            ({ inPointMilliseconds }, index): TranslationItem => ({
                inPointMilliseconds,
                translation: `translation for lineitem #${index}`,
                languageCode: translationLanguageCode,
            })
        );

        const translationItems = lineItems.map(
            ({ inPointMilliseconds, outPointMilliseconds, text, languageCode }) =>
                buildTestInstance(TranscriptItem, {
                    inPointMilliseconds,
                    outPointMilliseconds,
                    text: buildMultilingualTextWithSingleItem(text, languageCode),
                    speakerInitials: participant.initials,
                })
        );

        const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
            transcript: buildTestInstance(Transcript, {
                items: translationItems,
            }),
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should import the translations`, async () => {
            await testQueryRepository.importTranslationsForTranscript(
                targetAudioItem.id,
                translations
            );

            const { transcript: updatedTranscript } = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedAudioItemViewModel;

            const invalidOrMissingTranslations = translations.filter(
                ({ inPointMilliseconds, translation: text, languageCode }) => {
                    const translationLineItem = updatedTranscript.items.find(
                        (updatedItem) => updatedItem.inPointMilliseconds === inPointMilliseconds
                    );

                    if (isNotFound(translationLineItem)) {
                        return true;
                    }

                    const foundTranslationItem =
                        translationLineItem.text.getTranslation(languageCode);

                    if (isNotFound(foundTranslationItem)) {
                        return true;
                    }

                    if (foundTranslationItem.text !== text) {
                        return true;
                    }

                    if (foundTranslationItem.role !== MultilingualTextItemRole.freeTranslation) {
                        return true;
                    }

                    return false;
                }
            );

            expect(invalidOrMissingTranslations).toEqual([]);
        });
    });

    describe(`attribute`, () => {
        const targetDigitalText = buildTestInstance(EventSourcedAudioItemViewModel, {
            id: buildDummyUuid(905),
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
                        .buildSingle<AudioItemCreated>({
                            type: 'AUDIO_ITEM_CREATED',
                            meta: { contributorIds },
                        })
                        .buildContributionSummary()
                );

                const updatedView = (await testQueryRepository.fetchById(
                    targetDigitalText.id
                )) as EventSourcedAudioItemViewModel;

                const missingAttributions = updatedView.contributions.filter(
                    (contributionRecord) =>
                        !contributorIds.some((id) => contributionRecord.contributorIds.includes(id))
                );

                expect(missingAttributions).toHaveLength(0);

                const contributionForCreationEvent = updatedView.contributions.find(
                    ({ type }) => type === 'AUDIO_ITEM_CREATED'
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
                        .buildSingle<AudioItemCreated>({
                            type: 'AUDIO_ITEM_CREATED',
                            meta: {
                                contributorIds: [],
                            },
                        })
                        .buildContributionSummary()
                );

                const updatedView = (await testQueryRepository.fetchById(
                    targetDigitalText.id
                )) as EventSourcedAudioItemViewModel;

                const targetContribution = updatedView.contributions[0];

                expect(targetContribution.contributorIds).toHaveLength(0);

                expect(targetContribution.statement.includes('by: (data entry) admin')).toBe(true);
            });
        });
    });
});
