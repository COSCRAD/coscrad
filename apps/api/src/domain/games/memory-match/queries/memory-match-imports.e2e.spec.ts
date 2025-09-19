import {
    AggregateType,
    CoscradUserRole,
    HttpStatusCode,
    LanguageCode,
    MIMEType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { AdminJwtGuard } from '../../../../app/controllers/command/command.controller';
import { MockJwtAdminAuthGuard } from '../../../../authorization/mock-jwt-admin-auth-guard';
import { NotFound } from '../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../persistence/constants/persistenceConstants';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { MediaItem } from '../../../models/media-item/entities/media-item.entity';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../models/user-management/user/entities/user/coscrad-user.entity';
import { MemoryMatchModule } from '../memory-match.module';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchCardImportDto } from '../models/dtos/memory-match-card-import.dto';
import { MemoryMatchRoundCreationDto } from '../models/dtos/memory-match-round-creation.dto';
import { MemoryMatchRoundImportDto } from '../models/dtos/memory-match-round-import.dto';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

const endpointUnderTest = '/games/memory-match/import';

const NUMBER_OF_CARDS = 12;

const numberOfImagesUsedInCompleteRound = NUMBER_OF_CARDS + 1; // includes cardback image

const IMAGE_MEDIA_ITEM_ID_OFFSET = 100;

const AUDIO_MEDIA_ITEM_ID_OFFSET = 200;

const allMediaItems: MediaItem[] = [];

const validTestImageMediaItems = Array(numberOfImagesUsedInCompleteRound)
    .fill(null)
    .map((_, index) =>
        buildTestInstance(MediaItem, {
            id: buildDummyUuid(IMAGE_MEDIA_ITEM_ID_OFFSET + index),
            mimeType: MIMEType.png,
        })
    );

const testMediaItemForCardback = validTestImageMediaItems[validTestImageMediaItems.length - 1].id;

allMediaItems.push(...validTestImageMediaItems);

// there is one audio item per card
const validTestAudioMediaItems = Array(NUMBER_OF_CARDS)
    .fill(null)
    .map((_, index) =>
        buildTestInstance(MediaItem, {
            id: buildDummyUuid(AUDIO_MEDIA_ITEM_ID_OFFSET + index),
            mimeType: MIMEType.mp3,
        })
    );

/**
 * We use this to test MIME Type validation for all images and audio
 */
const pdfMediaItem = buildTestInstance(MediaItem, {
    id: buildDummyUuid(501),
    mimeType: MIMEType.pdf,
});

allMediaItems.push(...validTestAudioMediaItems, pdfMediaItem);

const validCardDtos = Array(NUMBER_OF_CARDS)
    .fill(null)
    .map((_, index) =>
        buildTestInstance(MemoryMatchCardImportDto, {
            text: `card #${index + 1}`,
            mediaItemIdForAudio: validTestAudioMediaItems[index].id,
            mediaItemIdForImage: validTestImageMediaItems[index].id,
        })
    );

const validDto = buildTestInstance(MemoryMatchRoundImportDto, {
    mediaItemIdForCardbackImage: buildDummyUuid(IMAGE_MEDIA_ITEM_ID_OFFSET + NUMBER_OF_CARDS),
    cards: validCardDtos,
});

// this is to signal that we never put a media item with this ID in the db
const missingMediaItemId = buildDummyUuid(404);

describe(endpointUnderTest, () => {
    let app: INestApplication;

    let memoryMatchRepository: IMemoryMatchRepository;

    const setItUp = async (user?: CoscradUserWithGroups) => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                MemoryMatchModule,
            ],
        })
            .overrideGuard(AdminJwtGuard)
            .useValue(new MockJwtAdminAuthGuard(user))
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    // is this necessary?
                    BASE_URL: 'http://localhost',
                    NODE_PORT: 1234,
                    GLOBAL_PREFIX: 'awesome-api',
                })
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        memoryMatchRepository = app.get(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN);
    };

    beforeEach(async () => {
        const databaseProvider = app.get(ArangoDatabaseProvider);

        await databaseProvider.getDatabaseForCollection('memory_match_rounds').clear();

        await databaseProvider.getDatabaseForCollection(ArangoCollectionId.media_items).clear();

        await app
            .get(REPOSITORY_PROVIDER_TOKEN)
            .forResource(AggregateType.mediaItem)
            .createMany(allMediaItems);
    });

    describe(`when the user is a COSCRAD admin`, () => {
        beforeAll(async () => {
            const testUser = buildTestInstance(CoscradUser, {
                roles: [CoscradUserRole.superAdmin],
            });

            await setItUp(new CoscradUserWithGroups(testUser, []));
        });

        describe(`when the imported round is valid`, () => {
            it(`should return ok and persist the imported round`, async () => {
                // TODO add test for when a request body is not provided
                const res = await request(app.getHttpServer())
                    .post(endpointUnderTest)
                    .send(validDto);

                expect(res.status).toBe(HttpStatusCode.createdResource);

                const { id: newId } = res.body;

                const searchResult = await memoryMatchRepository.fetchById(newId);

                expect(searchResult).not.toBe(NotFound);

                const round = searchResult as MemoryMatchRound;

                const { cards, description, name, cardBackImageId, isPublished } = round;

                const {
                    text: descriptionTextFromDb,
                    languageCode: langaugeCodeForDescriptionFromDb,
                } = description.getOriginalTextItem();

                expect(descriptionTextFromDb).toBe(validDto.description);

                expect(langaugeCodeForDescriptionFromDb).toBe(validDto.languageCodeForDescription);

                const { text: nameTextFromDb, languageCode: languageCodeForNameFromDb } =
                    name.getOriginalTextItem();

                expect(nameTextFromDb).toBe(validDto.name);

                expect(languageCodeForNameFromDb).toBe(validDto.languageCodeForName);

                expect(cards).toHaveLength(validDto.cards.length);

                expect(cardBackImageId).toBe(validDto.mediaItemIdForCardbackImage);

                expect(isPublished).toBe(false);
            });
        });

        describe(`when the round is invalid`, () => {
            describe(`when the creation DTO has an invalid type`, () => {
                describe(`when required properties are missing`, () => {
                    const dtoWithMissingProperties = buildTestInstance(MemoryMatchRoundCreationDto);

                    delete dtoWithMissingProperties.cardBackImageId;

                    delete dtoWithMissingProperties.name;

                    delete dtoWithMissingProperties.languageCodeForName;

                    delete dtoWithMissingProperties.description;

                    delete dtoWithMissingProperties.languageCodeForDescription;

                    it(`should return the expected error response`, async () => {
                        const res = await request(app.getHttpServer())
                            .post(endpointUnderTest)
                            .send(dtoWithMissingProperties);

                        expect(res.status).toBe(HttpStatusCode.badRequest);
                    });
                });

                describe(`when the body of the request is omitted`, () => {
                    it(`should return the expected error response`, async () => {
                        const res = await request(app.getHttpServer())
                            .post(endpointUnderTest)
                            .send();

                        expect(res.status).toBe(HttpStatusCode.badRequest);

                        const {
                            body: { message },
                        } = res;

                        expect(message).toContain('must provide a round import record');
                    });
                });

                describe(`when one of the cards is empty`, () => {
                    const dtoWithEmptyCard = buildTestInstance(MemoryMatchRoundImportDto, {
                        cards: validCardDtos.map((c, index) => (index === 0 ? {} : c)),
                    });

                    it(`should return the expected error response`, async () => {
                        const res = await request(app.getHttpServer())
                            .post(endpointUnderTest)
                            .send(dtoWithEmptyCard);

                        expect(res.status).toBe(HttpStatusCode.badRequest);

                        const {
                            body: { message },
                        } = res;

                        expect(message).toContain('Property card');
                    });
                });

                describe(`when one of the cards has invalid multilingual text`, () => {
                    const invalidText = '';

                    const invalidLanguageCode = 'NaN' as LanguageCode;

                    const dtoWithCardWithInvalidText = buildTestInstance(
                        MemoryMatchRoundImportDto,
                        {
                            cards: validCardDtos.map((c, index) =>
                                index === 0
                                    ? buildTestInstance(MemoryMatchCardImportDto, {
                                          text: invalidText,
                                          languageCodeForText: invalidLanguageCode,
                                      })
                                    : c
                            ),
                        }
                    );

                    it(`should return the expected error response`, async () => {
                        const res = await request(app.getHttpServer())
                            .post(endpointUnderTest)
                            .send(dtoWithCardWithInvalidText);

                        expect(res.status).toBe(HttpStatusCode.badRequest);

                        const {
                            body: { message },
                        } = res;

                        expect(message).toContain('Property cards has failed nested validation');
                    });
                });

                describe(`when the external state is inconsistent with the request`, () => {
                    describe(`when one of the contributors does not exist`, () => {
                        // TODO Do this once we sort out the API for indicating contributions
                        // should we do this now?
                        it.todo(`should return the expected error response`);
                    });

                    describe(`when one of the media items is missing`, () => {
                        describe(`when the media item for the cardback image does not exist`, () => {
                            const invalidDto = buildTestInstance(MemoryMatchRoundImportDto, {
                                mediaItemIdForCardbackImage: missingMediaItemId,
                                cards: validCardDtos,
                            });

                            it(`should return the expected error response`, async () => {
                                const res = await request(app.getHttpServer())
                                    .post(endpointUnderTest)
                                    .send(invalidDto);

                                expect(res.status).toBe(HttpStatusCode.badRequest);

                                const {
                                    body: { message },
                                } = res;

                                expect(message).toContain('there is no media item');

                                expect(message).toContain(missingMediaItemId);
                            });
                        });

                        describe(`when the audio for one of the cards is missing`, () => {
                            const dtoWithMissingAudioForOneCard = buildTestInstance(
                                MemoryMatchRoundImportDto,
                                {
                                    mediaItemIdForCardbackImage:
                                        validDto.mediaItemIdForCardbackImage,
                                    cards: validCardDtos.map((c, index) =>
                                        index === 0
                                            ? buildTestInstance(MemoryMatchCardImportDto, {
                                                  mediaItemIdForAudio: missingMediaItemId,
                                              })
                                            : c
                                    ),
                                }
                            );

                            it(`should return the expected error response`, async () => {
                                const res = await request(app.getHttpServer())
                                    .post(endpointUnderTest)
                                    .send(dtoWithMissingAudioForOneCard);

                                expect(res.status).toBe(HttpStatusCode.badRequest);

                                const {
                                    body: { message },
                                } = res;

                                // the invalid sequence number
                                expect(message).toContain(`card 1`);

                                expect(message).toContain(`there is no media item`);

                                expect(message).toContain(missingMediaItemId);
                            });
                        });

                        describe(`when the image for one of the cards is missing`, () => {
                            const dtoWithMissingImageForOneCard = buildTestInstance(
                                MemoryMatchRoundImportDto,
                                {
                                    mediaItemIdForCardbackImage:
                                        validDto.mediaItemIdForCardbackImage,
                                    cards: validCardDtos.map((c, index) =>
                                        index === 0
                                            ? buildTestInstance(MemoryMatchCardImportDto, {
                                                  ...c,
                                                  mediaItemIdForImage: missingMediaItemId,
                                              })
                                            : c
                                    ),
                                }
                            );

                            it(`should return the expected error response`, async () => {
                                const res = await request(app.getHttpServer())
                                    .post(endpointUnderTest)
                                    .send(dtoWithMissingImageForOneCard);

                                expect(res.status).toBe(HttpStatusCode.badRequest);

                                const {
                                    body: { message },
                                } = res;

                                // the invalid sequence number
                                expect(message).toContain(`card 1`);

                                expect(message).toContain(`there is no media item`);

                                expect(message).toContain(missingMediaItemId);
                            });
                        });
                    });

                    /**
                     * TODO We can also add a single `pdfMediaItem` to the database
                     * and try to link this one to invalidate the import for
                     * each of the following cases.
                     */
                    describe(`when one of the media items is of the wrong type`, () => {
                        describe(`when the card back image has the wrong MIME Type`, () => {
                            it(`should return the expected error response`, async () => {
                                const memoryMatchImportWithBadCardbackImage = buildTestInstance(
                                    MemoryMatchRoundImportDto,
                                    {
                                        // Why do we name this prop differently than on the model?
                                        mediaItemIdForCardbackImage: pdfMediaItem.id,
                                    }
                                );

                                const res = await request(app.getHttpServer())
                                    .post(endpointUnderTest)
                                    .send(memoryMatchImportWithBadCardbackImage);

                                const {
                                    body: { message },
                                    status,
                                } = res;

                                expect(status).toBe(HttpStatusCode.badRequest);

                                expect(message).toContain(pdfMediaItem.id);

                                expect(message).toContain(`not an image`);
                            });
                        });

                        describe(`when one of the cards has an image with the wrong MIME Type`, () => {
                            it(`should return the expected error response`, async () => {
                                const invalidCardIndex = 0;

                                const invalidCard = buildTestInstance(MemoryMatchCardImportDto, {
                                    // you can't use a pdf as an image!
                                    mediaItemIdForImage: pdfMediaItem.id,
                                    // we need to make sure the audio **does** exist for this card
                                    mediaItemIdForAudio:
                                        validTestAudioMediaItems[invalidCardIndex].id,
                                });

                                const invalidCards = validCardDtos.map((card, index) =>
                                    index == invalidCardIndex
                                        ? invalidCard
                                        : cloneToPlainObject(card)
                                );

                                const roundWithInvalidCard = buildTestInstance(
                                    MemoryMatchRoundImportDto,
                                    {
                                        mediaItemIdForCardbackImage:
                                            // TODO save a reference to this above
                                            testMediaItemForCardback,
                                        cards: invalidCards,
                                    }
                                );

                                const res = await request(app.getHttpServer())
                                    .post(endpointUnderTest)
                                    .send(roundWithInvalidCard);

                                const {
                                    body: { message },
                                    status,
                                } = res;

                                expect(status).toBe(HttpStatusCode.badRequest);

                                expect(message).toContain('not an image');

                                // the invalid media item ID
                                expect(message).toContain(pdfMediaItem.id);

                                // it should reference the actual, invalid MIME type
                                expect(message).toContain(pdfMediaItem.mimeType);
                            });
                        });

                        describe(`when the audio for one of the card has the wrong MIME Type`, () => {
                            it(`should return the expected error response`, async () => {
                                const invalidCardIndex = 0;

                                const invalidCard = buildTestInstance(MemoryMatchCardImportDto, {
                                    // you can't use a pdf as audio!
                                    mediaItemIdForAudio: pdfMediaItem.id,
                                    // we need to make sure the immage **does** exist
                                    mediaItemIdForImage:
                                        validTestImageMediaItems[invalidCardIndex].id,
                                });

                                const invalidCards = validCardDtos.map((card, index) =>
                                    index === invalidCardIndex
                                        ? invalidCard
                                        : cloneToPlainObject(card)
                                );

                                const roundWithInvalidCard = buildTestInstance(
                                    MemoryMatchRoundImportDto,
                                    {
                                        mediaItemIdForCardbackImage: testMediaItemForCardback,
                                        cards: invalidCards,
                                    }
                                );

                                const res = await request(app.getHttpServer())
                                    .post(endpointUnderTest)
                                    .send(roundWithInvalidCard);

                                const {
                                    body: { message },
                                    status,
                                } = res;

                                expect(status).toBe(HttpStatusCode.badRequest);

                                expect(message).toContain('not an audio file');

                                // the invalid media item ID
                                expect(message).toContain(pdfMediaItem.id);

                                // the invalid media item's MIME type
                                expect(message).toContain(pdfMediaItem.mimeType);
                            });
                        });
                    });
                });
            });
        });
    });
});
