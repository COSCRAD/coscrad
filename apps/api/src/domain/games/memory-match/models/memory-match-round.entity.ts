import { LanguageCode } from '@coscrad/api-interfaces';
import {
    BooleanDataType,
    NestedDataType,
    NonNegativeFiniteNumber,
    UUID,
} from '@coscrad/data-types';
import {
    isBoolean,
    isNonEmptyObject,
    isNonEmptyString,
    isNullOrUndefined,
} from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';

import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import validateSimpleInvariants from '../../../domainModelValidators/utilities/validateSimpleInvariants';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { AggregateId } from '../../../types/AggregateId';
import { MEMORY_MATCH_ROUND } from '../constants';
import {
    CannotExceedMemoryMatchRoundCapacityError,
    CannotOverwriteAudioForMemoryMatchCardError,
    CannotOverwriteCardbackImageForMemoryMatchRoundError,
    CannotOverwriteImageForMemoryMatchCardError,
    CannotOverwriteTextForMemoryMatchCardError,
    DuplicateSequeneceNumberForCardsError,
    FailedToRepublishMemoryMatchRoundError,
    FailedToUnpublishDraftMemoryMatchRoundError,
    FailedToUpdateMissingMemoryMatchCardError,
    InsufficientNumberOfCardsForPublicationError,
    MemoryMatchRoundCapacityReachedError,
    MemoryRoundIsNotReadyForPublicationError,
    MissingCardbackErrorForMemoryMatchRound,
} from '../errors';
import { CannotRemoveUnknownCardFromMemoryMatchRoundError } from '../errors/cannot-remove-unknown-card-from-memory-match-round.error';
import { FailedToRemoveCardFromPublishedMemoryMatchRoundError } from '../errors/FailedToRemoveCardFromPublishedMemoryMatchRoundError';
import { MemoryMatchRoundCreationDto } from './dtos/memory-match-round-creation.dto';
import { MemoryMatchCard } from './memory-match-card.entity';

// TODO make this configurable
const NUMBER_OF_PAIRS_IN_A_ROUND = 12;

interface MediaItemReference {
    type: 'IMAGE' | 'AUDIO';
    id: AggregateId;
}

@CoscradDataExample<MemoryMatchRound>({
    example: {
        id: buildDummyUuid(2),
        cardBackImageId: buildDummyUuid(3),
        cards: [],
        name: buildMultilingualTextWithSingleItem('test memory match round name'),
        description: buildMultilingualTextWithSingleItem('the best memory match round ever!'),
        compiledBy: [],
        contributors: [],
        size: NUMBER_OF_PAIRS_IN_A_ROUND,
        isPublished: false,
    },
})
export class MemoryMatchRound {
    @UUID({
        label: 'round ID',
        description: 'A unique system identifier for this memory match round',
    })
    id: AggregateId;

    @UUID({
        label: 'the back image for a card',
        description: 'A image for the back of a card',
        isOptional: true,
    })
    cardBackImageId?: AggregateId;

    @NestedDataType(MemoryMatchCard, {
        label: 'cards identifier',
        description: 'Identifier for the cards',
        isArray: true,
        isOptional: true, // i.e., can be empty
    })
    cards: MemoryMatchCard[];

    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'A name for the card',
    })
    name: MultilingualText;

    @NestedDataType(MultilingualText, {
        label: 'description',
        description: 'The descripton',
    })
    description: MultilingualText;

    @UUID({
        label: 'compiled by',
        description: 'Reference to the contributors who compiled this memory match round',
        isArray: true,
        isOptional: true, // i.e., can be empty
    })
    compiledBy: AggregateId[];

    @UUID({
        label: 'contributors',
        description:
            'A reference to the contributors who provided audio, photographs, or text for this round',
        isArray: true,
        isOptional: true, // i.e., can be empty
    })
    // TODO should this be `contributions` instead?
    contributors: AggregateId[];

    // TODO This should be a counting number
    @NonNegativeFiniteNumber({
        label: 'size',
        description: 'The size',
    })
    size: number = NUMBER_OF_PAIRS_IN_A_ROUND;

    @BooleanDataType({
        label: 'is published',
        description: 'Is this memory match round published?',
    })
    isPublished: boolean;

    constructor(dto: DeepPartial<DTO<MemoryMatchRound>>) {
        if (!dto) return;

        const {
            id,
            cards,
            isPublished,
            cardBackImageId,
            contributors,
            compiledBy,
            name,
            description,
        } = dto;

        this.id = id;

        if (isBoolean(isPublished)) {
            this.isPublished = isPublished;
        }

        this.cardBackImageId = cardBackImageId;

        if (Array.isArray(cards)) {
            this.cards = cards.map((c) => new MemoryMatchCard(c));
        }

        if (Array.isArray(contributors)) {
            // shallow clone
            this.contributors = contributors.map((c) => c);
        }

        if (Array.isArray(compiledBy)) {
            // shallow clone
            this.compiledBy = compiledBy.map((c) => c);
        }

        if (isNonEmptyObject(name)) {
            this.name = new MultilingualText(name as DTO<MultilingualText>);
        }

        if (isNonEmptyObject(description)) {
            this.description = new MultilingualText(description as DTO<MultilingualText>);
        }
    }

    addCardbackImage(newMediaItemId: AggregateId): ResultOrError<MemoryMatchRound> {
        if (this.hasCardback()) {
            return new CannotOverwriteCardbackImageForMemoryMatchRoundError(
                this.id,
                this.cardBackImageId,
                newMediaItemId
            );
        }

        this.cardBackImageId = newMediaItemId;

        return this;
    }

    addCard(): ResultOrError<number> {
        const nextSequenceNumber = this.cards.length + 1;

        if (nextSequenceNumber > this.size) {
            return new MemoryMatchRoundCapacityReachedError(this.id, this.size);
        }

        this.cards.push(
            new MemoryMatchCard({
                sequenceNumber: nextSequenceNumber,
            })
        );

        return nextSequenceNumber;
    }

    addAudioForCard(
        cardSquenceNumber: number,
        mediaItemId: AggregateId
    ): ResultOrError<MemoryMatchRound> {
        if (!this.has(cardSquenceNumber)) {
            return new FailedToUpdateMissingMemoryMatchCardError(this.id, cardSquenceNumber);
        }

        const targetCard = this.get(cardSquenceNumber) as MemoryMatchCard;

        if (targetCard.hasAudio()) {
            return new CannotOverwriteAudioForMemoryMatchCardError(
                this.id,
                cardSquenceNumber,
                targetCard.audioId,
                mediaItemId
            );
        }

        targetCard.audioId = mediaItemId;

        return this;
    }

    addImageForCard(
        sequenceNumber: number,
        mediaItemIdForImage: AggregateId
    ): ResultOrError<MemoryMatchRound> {
        if (!this.has(sequenceNumber)) {
            return new FailedToUpdateMissingMemoryMatchCardError(this.id, sequenceNumber);
        }

        const targetCard = this.get(sequenceNumber) as MemoryMatchCard;

        if (targetCard.hasImage()) {
            return new CannotOverwriteImageForMemoryMatchCardError(
                this.id,
                sequenceNumber,
                targetCard.imageId,
                mediaItemIdForImage
            );
        }

        targetCard.addImage(mediaItemIdForImage);

        return this;
    }

    addTextForCard(cardSequenceNumber: number, text: string, languageCode: LanguageCode) {
        if (!this.has(cardSequenceNumber)) {
            return new FailedToUpdateMissingMemoryMatchCardError(this.id, cardSequenceNumber);
        }

        const targetCard = this.get(cardSequenceNumber) as MemoryMatchCard;

        if (!isNullOrUndefined(targetCard.text)) {
            return new CannotOverwriteTextForMemoryMatchCardError(
                this.id,
                cardSequenceNumber,
                targetCard.text,
                text,
                languageCode
            );
        }

        targetCard.addText(text, languageCode);

        return this;
    }

    publish(): ResultOrError<MemoryMatchRound> {
        if (this.isPublished) {
            return new FailedToRepublishMemoryMatchRoundError(this.id);
        }

        this.isPublished = true;

        // Can't we just call validate invariants? Can we just wrap this in?
        const publicationStatusErrors = this.validatePublicationStatus();

        if (publicationStatusErrors.length > 0) {
            return new MemoryRoundIsNotReadyForPublicationError(this.id, publicationStatusErrors);
        }

        return this;
    }

    unpublish(): ResultOrError<MemoryMatchRound> {
        if (!this.isPublished) {
            return new FailedToUnpublishDraftMemoryMatchRoundError(this.id);
        }

        this.isPublished = false;

        return this;
    }

    remove(sequenceNumber: number): ResultOrError<MemoryMatchRound> {
        if (this.isPublished) {
            return new FailedToRemoveCardFromPublishedMemoryMatchRoundError(
                this.id,
                sequenceNumber
            );
        }

        if (!this.has(sequenceNumber)) {
            return new CannotRemoveUnknownCardFromMemoryMatchRoundError(this.id, sequenceNumber);
        }

        this.cards = this.cards.filter((c) => c.sequenceNumber !== sequenceNumber);

        return this;
    }

    get(sequenceNumber: Number): Maybe<MemoryMatchCard> {
        if (!this.has(sequenceNumber)) {
            return NotFound;
        }

        return this.cards.find((card) => card.sequenceNumber === sequenceNumber);
    }

    has(sequenceNumber: Number): boolean {
        return this.cards.some((card) => card.sequenceNumber === sequenceNumber);
    }

    count(): number {
        return this.cards.length;
    }

    hasCardback(): boolean {
        return !isNullOrUndefined(this.cardBackImageId);
    }

    validateInvariants(): InternalError[] {
        const simpleValidationResult = validateSimpleInvariants(
            Object.getPrototypeOf(this).constructor,
            this
        );

        /**
         * If simple invariant validation fails, the instance is ill-formed,
         * and we would likely run into null check errors or other unexpected
         * run-time issues when attempting to validate complex invariants. So
         * we return early when simple invariant validation fails.
         *
         * TODO Share this logic with the base `Aggregate` (root) class or inherit
         * from that class.
         */
        if (simpleValidationResult.length > 0) {
            return simpleValidationResult;
        }

        const allErrors: InternalError[] = [];

        if (this.cards.length > this.size) {
            allErrors.push(
                new CannotExceedMemoryMatchRoundCapacityError(this.id, this.size, this.cards.length)
            );
        }

        const duplicates = this.cards.reduce(
            (acc, { sequenceNumber: nextSequenceNumber }) => {
                if (acc.seen.has(nextSequenceNumber)) {
                    acc.duplicates.add(nextSequenceNumber);

                    return acc;
                }

                acc.seen.add(nextSequenceNumber);

                return acc;
            },
            {
                seen: new Set<number>(),
                duplicates: new Set<number>(),
            }
        ).duplicates;

        const duplicateSequenceNumberErrors = Array.from(duplicates).map((n) => {
            return new DuplicateSequeneceNumberForCardsError(this.id, n);
        });

        duplicateSequenceNumberErrors.forEach((e) => allErrors.push(e));

        if (this.isPublished) {
            const publicationStatusErrors = this.validatePublicationStatus();

            if (publicationStatusErrors.length > 0) {
                allErrors.push(
                    new MemoryRoundIsNotReadyForPublicationError(this.id, publicationStatusErrors)
                );
            }
        }

        return allErrors;
    }

    private validatePublicationStatus(): InternalError[] {
        const publicationStatusErrors = [];

        // A published round must have an image for the back of its cards
        if (isNullOrUndefined(this.cardBackImageId)) {
            publicationStatusErrors.push(new MissingCardbackErrorForMemoryMatchRound());
        }

        if (this.count() < this.size) {
            publicationStatusErrors.push(
                new InsufficientNumberOfCardsForPublicationError(this.size, this.count())
            );
        }

        const cardPublicationErrors = this.cards.flatMap((c) => {
            const errorsForCard = c.validatePubicationStatus();

            return errorsForCard;
        });

        cardPublicationErrors.forEach((e) => {
            publicationStatusErrors.push(e);
        });

        return publicationStatusErrors;
    }

    public getMediaItemReferences(): MediaItemReference[] {
        const references: MediaItemReference[] = [];

        // TODO be sure the prop is defined before including it in the array
        const imageIds = this.cards.map(({ imageId }) => imageId);

        references.push(
            ...imageIds.map(
                (id): MediaItemReference => ({
                    type: 'IMAGE',
                    id,
                })
            )
        );

        if (isNonEmptyString(this.cardBackImageId)) {
            references.push({
                type: 'IMAGE',
                id: this.cardBackImageId,
            });
        }

        const audioIds = this.cards.map(({ audioId }) => audioId);

        references.push(
            ...audioIds.map(
                (id): MediaItemReference => ({
                    type: 'AUDIO',
                    id,
                })
            )
        );

        return references;
    }

    public getCompositeIdentifier(): { type: typeof MEMORY_MATCH_ROUND; id: AggregateId } {
        return {
            type: MEMORY_MATCH_ROUND,
            id: this.id,
        };
    }

    public static fromDto(dto: DTO<MemoryMatchRound>) {
        return new MemoryMatchRound(dto);
    }

    public static fromCreationDto(id: AggregateId, dto: MemoryMatchRoundCreationDto) {
        const {
            name,
            languageCodeForName,
            description,
            languageCodeForDescription,
            cardBackImageId,
        } = dto;

        return new MemoryMatchRound({
            id,
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            cardBackImageId,
            description: buildMultilingualTextWithSingleItem(
                description,
                languageCodeForDescription
            ),
            isPublished: false,
            contributors: [],
            compiledBy: [], // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-308] support this
            /**
             * There are no cards at creation time- you need to add them one at
             * a time. Alternatively, you can use a bulk import.
             */
            cards: [],
        });
    }

    toDTO(): DTO<MemoryMatchRound> {
        return cloneToPlainObject(this);
    }
}
