import { AggregateType, IMemoryMatchRound } from '@coscrad/api-interfaces';
import { isNonEmptyObject, isNullOrUndefined } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoscradInvalidUserInputException } from '../../../../app/controllers/response-mapping/CoscradExceptions';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { ResultOrError } from '../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import validateSimpleInvariants from '../../../domainModelValidators/utilities/validateSimpleInvariants';
import { IMediaManagementService } from '../../../interfaces';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../interfaces/id-manager.interface';
import { isAudioMimeType } from '../../../models/audio-visual/audio-item/entities/audio-item.entity';
import InvalidExternalReferenceByAggregateError from '../../../models/categories/errors/InvalidExternalReferenceByAggregateError';
import { MediaItem } from '../../../models/media-item/entities/media-item.entity';
import { MEDIA_MANGAER_INJECTION_TOKEN } from '../../../models/media-item/media-manager.interface';
import { isPhotographMimeType } from '../../../models/photograph/entities/photograph.entity';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../../types/AggregateId';
import { MEMORY_MATCH_ROUND } from '../constants';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchRoundCreationDto } from '../models/dtos/memory-match-round-creation.dto';
import { MemoryMatchRoundImportDto } from '../models/dtos/memory-match-round-import.dto';
import { MemoryMatchCard } from '../models/memory-match-card.entity';
import { MemoryMatchRound } from '../models/memory-match-round.entity';
import { MemoryMatchRoundViewModel } from '../models/memory-match-round.view-model';

export class MemoryMatchService {
    constructor(
        @Inject(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN)
        private readonly memoryMatchRepository: IMemoryMatchRepository,
        @Inject(ID_MANAGER_TOKEN)
        private readonly idManager: IIdManager,
        @Inject(MEDIA_MANGAER_INJECTION_TOKEN)
        private readonly mediaManagementService: IMediaManagementService,
        private readonly configService: ConfigService
    ) {}

    async create(
        dto: MemoryMatchRoundCreationDto
    ): Promise<AggregateId | CoscradInvalidUserInputException> {
        // TODO release the ID if not used or don't generate until you know the round is valid
        const id = await this.idManager.generate();

        const newRound = MemoryMatchRound.fromCreationDto(id, dto);

        const validationResult = newRound.validateInvariants();

        if (validationResult.length > 0) {
            return new CoscradInvalidUserInputException(
                new InternalError(
                    `Failed to create memory match round: ${dto.name}.`,
                    validationResult
                )
            );
        }

        if (newRound.hasCardback()) {
            const cardbackImage = await this.mediaManagementService.fetchById(
                newRound.cardBackImageId
            );

            if (isNotFound(cardbackImage)) {
                return new CoscradInvalidUserInputException(
                    new InvalidExternalReferenceByAggregateError(
                        {
                            type: MEMORY_MATCH_ROUND,
                            id: newRound.id,
                        },
                        [
                            {
                                type: AggregateType.mediaItem,
                                id: newRound.cardBackImageId,
                            },
                        ]
                    )
                );
            }

            if (!isPhotographMimeType(cardbackImage.mimeType)) {
                return new CoscradInvalidUserInputException(
                    new InternalError(
                        `Media item for card back must be an image. Found MIME Type: ${cardbackImage.mimeType}`
                    )
                );
            }
        }

        const creationResult = await this.memoryMatchRepository.create(newRound);

        if (isInternalError(creationResult)) {
            return new CoscradInvalidUserInputException(creationResult);
        }

        return id;
    }

    async publish(id: AggregateId): Promise<Error | AggregateId> {
        /**
         * This is to encourage the user to be intentional. The database
         * doesn't reject attempts to publish an already published
         * resource.
         */
        const searchResult = await this.memoryMatchRepository.fetchById(id);

        if (isNotFound(searchResult)) {
            return this.buildBadUserInputError(
                new InternalError(
                    `You cannot publish memory match round ${id} as there is no memory match round with that ID.`
                )
            );
        }

        const { isPublished } = searchResult;

        if (isPublished) {
            return this.buildBadUserInputError(
                new InternalError(
                    `You cannot publish memory match round ${id} as it is already published.`
                )
            );
        }

        const result = await this.memoryMatchRepository.publish(id);

        return isInternalError(result) ? this.buildBadUserInputError(result) : result;
    }

    async unpublish(id: AggregateId): Promise<Error | AggregateId> {
        const searchResult = await this.memoryMatchRepository.fetchById(id);

        if (isNotFound(searchResult)) {
            return this.buildBadUserInputError(
                new InternalError(
                    `You cannot unpublish memory match round ${id} as there is no memory match round with that ID`
                )
            );
        }

        const { isPublished } = searchResult;

        if (!isPublished) {
            return this.buildBadUserInputError(
                new InternalError(
                    `You cannot unpublish memory match round ${id} as it is not published.`
                )
            );
        }

        await this.memoryMatchRepository.unpublish(id);

        return id;
    }

    async fetchById(
        roundId: AggregateId,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<IMemoryMatchRound>> {
        const searchResult = await this.memoryMatchRepository.fetchById(roundId);

        // handle not found or use intercepter
        if (isNotFound(searchResult)) {
            return NotFound;
        }

        // our convention is to return not published when a user does not have access to a particular resource
        const doesUserHaveAccess = searchResult.isPublished || userWithGroups?.isAdmin() || false;

        if (!doesUserHaveAccess) {
            return NotFound;
        }

        // at this point, we have a published round
        return this.buildView(searchResult);
    }

    async fetchMany(
        userWithGroups?: CoscradUserWithGroups
    ): Promise<{ entities: IMemoryMatchRound[] }> {
        // TODO filter out unpublished round at the level of the database
        const searchResult = await this.memoryMatchRepository.fetchMany();

        return {
            // we use `flatMap` to achievev map + filter
            entities: searchResult.flatMap((domainModel) => {
                const doesUserHaveAccess =
                    domainModel.isPublished || userWithGroups?.isAdmin() || false;

                return doesUserHaveAccess ? [this.buildView(domainModel)] : [];
            }),
        };
    }

    async import(importDto: MemoryMatchRoundImportDto): Promise<ResultOrError<AggregateId>> {
        const dtoTypeValidationErrors = validateSimpleInvariants(
            MemoryMatchRoundImportDto,
            importDto
        );

        if (dtoTypeValidationErrors.length > 0) {
            return new InternalError(
                `Encountered an invalid DTO for a Memory Match Round import`,
                dtoTypeValidationErrors
            );
        }

        const {
            name,
            languageCodeForName,
            cards: cardDtos,
            contributorId,
            // TODO should the following two properties be part of a single object?
            description,
            languageCodeForDescription,
            mediaItemIdForCardbackImage,
        } = importDto;

        // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-324] check for text
        const cards = cardDtos.map(({ mediaItemIdForAudio, mediaItemIdForImage }, index) => {
            return new MemoryMatchCard({
                audioId: mediaItemIdForAudio,
                imageId: mediaItemIdForImage,
                sequenceNumber: index + 1,
            });
        });

        const id = await this.idManager.generate();

        const importedRound = MemoryMatchRound.fromDto({
            id,
            cardBackImageId: mediaItemIdForCardbackImage,
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            cards,
            description: buildMultilingualTextWithSingleItem(
                description,
                languageCodeForDescription
            ),
            compiledBy: [],
            //  TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-308] should we support multiple contributors
            contributors: [contributorId],
            // note that this is hard-wired for now. eventually, it could be configurable or passed by the user.
            size: 12,
            // an admin must explcitly publish the round
            isPublished: false,
        });

        const invariantValidationErrors = importedRound.validateInvariants();

        if (invariantValidationErrors.length > 0) {
            return new InternalError(
                `Encountered inconsistent import record for imported round: ${name}`,
                invariantValidationErrors
            );
        }

        const mediaReferenceErrors = await this.validateMediaItemReferences(importedRound);

        if (mediaReferenceErrors.length > 0) {
            return new InternalError(
                `One or more of the media items provided for use on ${formatAggregateCompositeIdentifier(
                    {
                        type: MEMORY_MATCH_ROUND,
                        id: importedRound.id,
                    }
                )} is missing or of the incorrect type`,
                mediaReferenceErrors
            );
        }

        await this.memoryMatchRepository.create(importedRound);

        return id;
    }

    // TODO should we rename `IMemoryMatchRound` to `IMemoryMatchRoundViewModel` for consistency in naming?
    // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-307] Introduce a dedicated `MemoryMatchRoundViewModel` to handle this mapping layer
    private buildView(memoryMatchRound: MemoryMatchRound): IMemoryMatchRound {
        const baseUrl = `${this.configService.get('BASE_URL')}:${this.configService.get(
            'NODE_PORT'
        )}/${this.configService.get('GLOBAL_PREFIX')}/resources/mediaItems/download`;

        const view = new MemoryMatchRoundViewModel(memoryMatchRound, {
            build: (mediaItemId: AggregateId) => {
                return `${baseUrl}/${mediaItemId}`;
            },
        });

        // remove methods
        return cloneToPlainObject(view);
    }

    private buildMediaUrl(mediaItemId: AggregateId): string {
        return `${this.configService.get('BASE_URL')}:${this.configService.get(
            'NODE_PORT'
        )}/${this.configService.get('GLOBAL_PREFIX')}/resources/mediaItems/download/${mediaItemId}`;
    }

    private async validateMediaItemReferences(
        memoryMatchRound: MemoryMatchRound
    ): Promise<InternalError[]> {
        if (!isNonEmptyObject(memoryMatchRound)) {
            return [];
        }

        const mediaReferences = memoryMatchRound.getMediaItemReferences();

        const mediaItemIds = mediaReferences.map(({ id }) => id);

        /**
         * TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-325] Optimize this to use a filter in-database
         */
        const allMediaItems = await this.mediaManagementService.fetchMany();

        const relevantMediaItems = allMediaItems.filter(({ id }) => mediaItemIds.includes(id));

        const mediaItemMap = relevantMediaItems.reduce(
            // we already know that all IDs are unique, so the logic is simple here
            (acc, mediaItem) => acc.set(mediaItem.id, mediaItem),
            new Map<AggregateId, MediaItem>()
        );

        const allErrors: InternalError[] = [];

        const { cards, cardBackImageId } = memoryMatchRound;

        if (!isNullOrUndefined(cardBackImageId)) {
            if (!mediaItemMap.has(cardBackImageId)) {
                allErrors.push(
                    new InternalError(
                        `${formatAggregateCompositeIdentifier({
                            type: AggregateType.mediaItem,
                            id: cardBackImageId,
                        })} cannot be used as the cardback image for ${formatAggregateCompositeIdentifier(
                            {
                                type: MEMORY_MATCH_ROUND,
                                id: memoryMatchRound.id,
                            }
                        )} as there is no media item with that ID`
                    )
                );
            } else {
                const { mimeType } = mediaItemMap.get(cardBackImageId);

                // should we have a separate definition of allowed MIME types for memory match artwork?
                if (!isPhotographMimeType(mimeType)) {
                    allErrors.push(
                        new InternalError(
                            `${formatAggregateCompositeIdentifier({
                                type: AggregateType.mediaItem,
                                id: cardBackImageId,
                            })} cannot be used as the cardback image for ${formatAggregateCompositeIdentifier(
                                {
                                    type: MEMORY_MATCH_ROUND,
                                    id: memoryMatchRound.id,
                                }
                            )} as it is not an image.`
                        )
                    );
                }
            }
        }

        const missingAudioItemErrorsForCards = cards.flatMap(({ audioId, sequenceNumber }) => {
            if (!mediaItemMap.has(audioId)) {
                return new InternalError(
                    `${formatAggregateCompositeIdentifier({
                        type: AggregateType.mediaItem,
                        id: audioId,
                    })} cannot be used as the audio for card ${sequenceNumber} on ${formatAggregateCompositeIdentifier(
                        {
                            type: MEMORY_MATCH_ROUND,
                            id: memoryMatchRound.id,
                        }
                    )} as there is no media item with that ID`
                );
            }

            const { mimeType } = mediaItemMap.get(audioId);

            if (!isAudioMimeType(mimeType)) {
                return new InternalError(
                    `${formatAggregateCompositeIdentifier({
                        type: AggregateType.mediaItem,
                        id: audioId,
                    })} cannot be used as the audio for card ${sequenceNumber} on ${formatAggregateCompositeIdentifier(
                        {
                            type: MEMORY_MATCH_ROUND,
                            id: memoryMatchRound.id,
                        }
                    )} as it is not an audio file. It has MIME type: ${mimeType}`
                );
            }

            return [];
        });

        if (missingAudioItemErrorsForCards.length > 0) {
            allErrors.push(...missingAudioItemErrorsForCards);
        }

        const missingImageErrorsForCards = cards.flatMap(({ imageId, sequenceNumber }) => {
            if (!mediaItemMap.has(imageId)) {
                return [
                    new InternalError(
                        `${formatAggregateCompositeIdentifier({
                            type: AggregateType.mediaItem,
                            id: imageId,
                        })} cannot be used as the image for card ${sequenceNumber} on ${formatAggregateCompositeIdentifier(
                            {
                                type: MEMORY_MATCH_ROUND,
                                id: memoryMatchRound.id,
                            }
                        )} as there is no media item with that ID`
                    ),
                ];
            }

            const { mimeType } = mediaItemMap.get(imageId);

            if (!isPhotographMimeType(mimeType)) {
                return [
                    new InternalError(
                        `${formatAggregateCompositeIdentifier({
                            type: AggregateType.mediaItem,
                            id: imageId,
                        })} cannot be used as the image for card ${sequenceNumber} on ${formatAggregateCompositeIdentifier(
                            {
                                type: MEMORY_MATCH_ROUND,
                                id: memoryMatchRound.id,
                            }
                        )} as it is not an image. It has the mime Type: ${mimeType}`
                    ),
                ];
            }

            return [];
        });

        if (missingImageErrorsForCards.length > 0) {
            allErrors.push(...missingImageErrorsForCards);
        }

        return allErrors;
    }

    private buildBadUserInputError(innerError: InternalError) {
        return new CoscradInvalidUserInputException(innerError);
    }
}
