import { ITranscript } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { isNumberWithinRange } from '@coscrad/validation-constraints';
import { isDeepStrictEqual } from 'util';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../../../lib/types/not-found';
import { DTO } from '../../../../../types/DTO';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid, isValid } from '../../../../domainModelValidators/Valid';
import BaseDomainModel from '../../../base-domain-model.entity';
import {
    ConflictingLineItemsError,
    DuplicateTranscriptParticipantError,
    DuplicateTranscriptParticipantInitialsError,
    DuplicateTranscriptParticipantNameError,
} from '../../audio-item/errors';
import {
    CannotAddInconsistentLineItemError,
    FailedToImportLineItemsToTranscriptError,
    InvalidTranscriptError,
} from '../commands/transcripts/errors';
import { LineItemTranslation } from '../methods/import-translations-for-transcript';
import {
    CannotTranslateEmptyTranscriptError,
    FailedToImportTranslationsToTranscriptError,
    LineItemNotFoundForTranslationError,
} from '../transcript-errors';
import { TranscriptParticipantInitialsNotRegisteredError } from '../transcript-errors/transcript-participant-initials-not-registered.error';
import { TranscriptItem } from './transcript-item.entity';
import { TranscriptParticipant } from './transcript-participant';
export class Transcript extends BaseDomainModel implements ITranscript {
    // TODO Validate that there are not duplicate IDs here
    @NestedDataType(TranscriptParticipant, {
        isArray: true,
        // i.e. can be empty
        isOptional: true,
        label: 'participants',
        description: 'a list of participants and their initials',
    })
    participants: TranscriptParticipant[];

    @NestedDataType(TranscriptItem, {
        isArray: true,
        // i.e. can be empty
        isOptional: true,
        label: 'items',
        description: 'time stamps with text and speaker labels',
    })
    items: TranscriptItem[];

    // Should we configure allowed languages at the top level?

    constructor(dto: DTO<Transcript>) {
        super();

        if (!dto) return;

        const { items, participants } = dto;

        if (Array.isArray(participants))
            this.participants = participants.map((p) => new TranscriptParticipant(p));

        if (Array.isArray(items)) this.items = items.map((item) => new TranscriptItem(item));
    }

    hasLineItem(inPointMillisecondsToFind: number, outPointMillisecondsToFind: number): boolean {
        return this.items.some(({ inPointMilliseconds, outPointMilliseconds }) =>
            isDeepStrictEqual(
                { inPointMilliseconds, outPointMilliseconds },
                {
                    inPointMilliseconds: inPointMillisecondsToFind,
                    outPointMilliseconds: outPointMillisecondsToFind,
                }
            )
        );
    }

    getLineItem(
        inPointMillisecondsToFind: number,
        outPointMillisecondsToFind: number
    ): Maybe<TranscriptItem> {
        if (!this.hasLineItem(inPointMillisecondsToFind, outPointMillisecondsToFind))
            return NotFound;

        return this.items.find((item) =>
            item.isColocatedWith({
                inPointMilliseconds: inPointMillisecondsToFind,
                outPointMilliseconds: outPointMillisecondsToFind,
            })
        );
    }

    countLineItems(): number {
        return this.items.length;
    }

    hasLineItems(): boolean {
        return this.countLineItems() > 0;
    }

    /**
     * TODO Every entity (even nested entities that are not the aggregate root)
     * should be able to validate its own invariants. This would allow us
     * to call `safeClone` on any `DomainModel`.
     *
     * For now, "simple invariants" (i.e. generalized type rules) are
     * checked in the domain model factories. But complex invariant validation
     * must be done on the aggregate root (`AudioItem` in this case).
     */
    addParticipant(participant: TranscriptParticipant): ResultOrError<this> {
        const allErrors: InternalError[] = [];

        // TODO validate that name initials are unique
        const { initials, name } = participant;

        const searchByInitialsResult = this.findParticipantByInitials(initials);

        // TODO avoid double negative
        // Is there already a participant with these initials?
        if (!isNotFound(searchByInitialsResult))
            allErrors.push(new DuplicateTranscriptParticipantInitialsError(initials));

        const searchByNameResult = this.findParticipantByName(name);

        // TODO avoid double negative
        // Is there already a participant with these initials?
        if (!isNotFound(searchByNameResult))
            allErrors.push(new DuplicateTranscriptParticipantNameError(name));

        return allErrors.length === 0
            ? this.clone({
                  // avoid shared references by cloning
                  participants: this.participants.concat(participant.clone()),
              } as DeepPartial<DTO<this>>)
            : new DuplicateTranscriptParticipantError(allErrors);
    }

    findParticipantByInitials(initials: string): Maybe<TranscriptParticipant> {
        return (
            this.participants.find((participant) => participant.initials === initials) || NotFound
        );
    }

    findParticipantByName(name: string): Maybe<TranscriptParticipant> {
        return this.participants.find((participant) => participant.name === name) || NotFound;
    }

    addLineItem(item: TranscriptItem): ResultOrError<this> {
        const lineItemErrors = this.validateLineItem(item);

        if (lineItemErrors.length > 0)
            return new CannotAddInconsistentLineItemError(item, lineItemErrors);

        // Avoid shared references to individual items by cloning
        const newItems = this.items.concat(item.clone());

        return this.clone({
            items: newItems,
        } as DeepPartial<DTO<this>>);
    }

    importLineItems(items: TranscriptItem[]): ResultOrError<this> {
        const lineItemErrors = items
            .map((item) => [item, this.validateLineItem(item)])
            .filter(([_, result]: [TranscriptItem, InternalError[]]) => result.length > 0)
            .map(
                ([item, errors]: [TranscriptItem, InternalError[]]) =>
                    new CannotAddInconsistentLineItemError(item, errors)
            );

        if (lineItemErrors.length > 0)
            return new FailedToImportLineItemsToTranscriptError(lineItemErrors);

        const newItems = this.items.concat(items.map((item) => item.clone()));

        return this.clone({ items: newItems } as DeepPartial<DTO<this>>);
    }

    importTranslations(translationItems: LineItemTranslation[]): ResultOrError<this> {
        if (!this.hasLineItems()) return new CannotTranslateEmptyTranscriptError();

        const itemUpdateResults = translationItems.map((item) => {
            const searchResult = this.items.find(
                ({ inPointMilliseconds }) => item.inPointMilliseconds === inPointMilliseconds
            );

            if (!searchResult) {
                const { inPointMilliseconds, text, languageCode } = item;

                return new LineItemNotFoundForTranslationError(
                    inPointMilliseconds,
                    text,
                    languageCode
                );
            }

            const { text, languageCode } = item;

            return searchResult.translate(text, languageCode);
        });

        const allErrors = itemUpdateResults.filter(isInternalError);

        const unaffectedItems = this.items.filter(
            ({ inPointMilliseconds }) =>
                !translationItems.some(
                    (translationItem) => translationItem.inPointMilliseconds === inPointMilliseconds
                )
        );

        return allErrors.length > 0
            ? new FailedToImportTranslationsToTranscriptError(allErrors)
            : this.clone({
                  items: [...unaffectedItems, ...itemUpdateResults],
              } as unknown as DeepPartial<DTO<this>>);
    }

    countParticipants(): number {
        return this.participants.length;
    }

    toString(): string {
        return this.items.map((item) => item.toString()).join('\n');
    }

    public validateComplexInvariants(): ResultOrError<Valid> {
        const lineItemInvariantValidationErrors = this.items
            .map((item) => item.validateComplexInvariants())
            .filter(isInternalError);

        if (lineItemInvariantValidationErrors.length > 0)
            return new InvalidTranscriptError(lineItemInvariantValidationErrors);

        const overlappingLineItems = this.getOverlappingLineItems();

        const overlappingLineItemErrors = overlappingLineItems.map(
            ([itemA, itemB]) => new InternalError(`item: ${itemA} overlaps with item: ${itemB}`)
        );

        return overlappingLineItemErrors.length > 0
            ? new InternalError(`Encountered an invalid transcript`, overlappingLineItemErrors)
            : Valid;
    }

    private getOverlappingLineItems(): [TranscriptItem, TranscriptItem][] {
        const sortedItems = this.items.sort(
            ({ inPointMilliseconds: inPointA }, { inPointMilliseconds: inPointB }) =>
                inPointA - inPointB
        );

        return sortedItems.reduce(
            (overlappingItemPairs: [TranscriptItem, TranscriptItem][], nextItem, index) =>
                overlappingItemPairs.concat(
                    sortedItems
                        .map((otherItem, otherIndex): [TranscriptItem, TranscriptItem] | null => {
                            if (index >= otherIndex) return null;

                            const { inPointMilliseconds: inPoint, outPointMilliseconds: outPoint } =
                                nextItem;

                            const {
                                inPointMilliseconds: otherInPoint,
                                outPointMilliseconds: otherOutPoint,
                            } = otherItem;

                            if (
                                [otherInPoint, otherOutPoint].some((n) =>
                                    isNumberWithinRange(n, [inPoint, outPoint])
                                )
                            )
                                return [nextItem, otherItem];

                            return null;
                        })
                        .filter((item) => item !== null)
                ),
            []
        );
    }

    private getConflictingItems({
        inPointMilliseconds,
        outPointMilliseconds,
    }: Pick<TranscriptItem, 'inPointMilliseconds' | 'outPointMilliseconds'>): TranscriptItem[] {
        return this.items.filter((item) =>
            item.conflictsWith({
                inPointMilliseconds: inPointMilliseconds,
                outPointMilliseconds: outPointMilliseconds,
            })
        );
    }

    private validateLineItem(newLineItem: TranscriptItem): InternalError[] {
        const allErrors: InternalError[] = [];

        const itemValidationResult = newLineItem.validateComplexInvariants();

        if (!isValid(itemValidationResult)) allErrors.push(itemValidationResult);

        const conflictingExistingItems = this.getConflictingItems(newLineItem);

        if (conflictingExistingItems.length > 0)
            allErrors.push(new ConflictingLineItemsError(newLineItem, conflictingExistingItems));

        const { speakerInitials } = newLineItem;

        const participantSearchResult = this.findParticipantByInitials(speakerInitials);

        if (isNotFound(participantSearchResult))
            allErrors.push(new TranscriptParticipantInitialsNotRegisteredError(speakerInitials));

        return allErrors;
    }
}
