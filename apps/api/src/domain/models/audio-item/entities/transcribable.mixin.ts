import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isNullOrUndefined, isNumberWithinRange } from '@coscrad/validation-constraints';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { DeepPartial } from '../../../../types/DeepPartial';
import { ResultOrError } from '../../../../types/ResultOrError';
import { CannotAddDuplicateTranslationError } from '../../../common/entities/errors';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { ResourceCompositeIdentifier } from '../../../types/ResourceCompositeIdentifier';
import {
    ADD_LINE_ITEM_TO_TRANSCRIPT,
    ADD_PARTICIPANT_TO_TRANSCRIPT,
    CREATE_TRANSCRIPT,
} from '../commands/transcripts/constants';
import { TRANSLATE_LINE_ITEM } from '../commands/transcripts/translate-line-item/constants';
import { CannotOverwriteTranscriptError, TranscriptLineItemOutOfBoundsError } from '../errors';
import { CannotAddParticipantBeforeCreatingTranscriptError } from '../errors/CannotAddParticipantBeforeCreatingTranscript.error';
import { LineItemNotFoundError } from '../errors/line-item-not-found.error';
import { TranscriptItem } from './transcript-item.entity';
import { TranscriptParticipant } from './transcript-participant';
import { Transcript } from './transcript.entity';

/* eslint-disable-next-line */
export type Constructor<T extends {} = {}> = new (...args: any[]) => T;

export interface ITranscribableBase {
    /**
     * It's a bit disappointing that we
     */
    transcript: Transcript;

    getCompositeIdentifier(): ResourceCompositeIdentifier;

    getTimeBounds(): [number, number];

    safeClone<T>(this: T, updateDto: DeepPartial<DTO<T>>): ResultOrError<T>;

    getResourceSpecificAvailableCommands(): string[];

    validateComplexInvariants(): InternalError[];
}

export interface ITranscribable {
    createTranscript(): ResultOrError<ITranscribableBase>;

    hasTranscript(): boolean;

    addParticipantToTranscript(
        participant: TranscriptParticipant
    ): ResultOrError<ITranscribableBase>;

    addLineItemToTranscript(newItemDto: DTO<TranscriptItem>): ResultOrError<ITranscribableBase>;

    translateLineItem(
        inPointMillisecondsForTranslation: number,
        outPointMillisecondsForTranslation: number,
        translation: string,
        languageCode: LanguageCode
    ): ResultOrError<ITranscribableBase>;

    importLineItemsToTranscript(
        newItemDtos: DTO<TranscriptItem>[]
    ): ResultOrError<ITranscribableBase>;

    countTranscriptParticipants(): number;
}

export function Transcribable<TBase extends Constructor<ITranscribableBase>>(Base: TBase) {
    return class WithTranscription extends Base implements ITranscribable {
        createTranscript(): ResultOrError<this> {
            if (this.hasTranscript())
                return new CannotOverwriteTranscriptError(this.getCompositeIdentifier());

            return this.safeClone({
                transcript: new Transcript({
                    items: [],
                    participants: [],
                }),
            } as DeepPartial<DTO<this>>);
        }

        hasTranscript(): boolean {
            return !isNullOrUndefined(this.transcript);
        }

        addParticipantToTranscript(participant: TranscriptParticipant): ResultOrError<this> {
            if (!this.hasTranscript())
                return new CannotAddParticipantBeforeCreatingTranscriptError(
                    this.getCompositeIdentifier()
                );

            const updatedTranscript = this.transcript.addParticipant(participant);

            if (isInternalError(updatedTranscript)) return updatedTranscript;

            return this.safeClone({
                transcript: updatedTranscript,
            } as DeepPartial<DTO<this>>);
        }

        addLineItemToTranscript(newItemDto: DTO<TranscriptItem>): ResultOrError<this> {
            const newItem = new TranscriptItem(newItemDto);

            const timeBounds = this.getTimeBounds();

            const { inPointMilliseconds: inPoint, outPointMilliseconds: outPoint } = newItem;

            if ([inPoint, outPoint].some((point) => !isNumberWithinRange(point, timeBounds)))
                return new TranscriptLineItemOutOfBoundsError(newItem, timeBounds);

            const updatedTranscript = this.transcript.addLineItem(new TranscriptItem(newItem));

            if (isInternalError(updatedTranscript)) return updatedTranscript;

            return this.safeClone({
                transcript: updatedTranscript,
            } as DeepPartial<DTO<this>>);
        }

        translateLineItem(
            inPointMillisecondsForTranslation: number,
            outPointMillisecondsForTranslation: number,
            translation: string,
            languageCode: LanguageCode
        ): ResultOrError<this> {
            if (
                !this.transcript.hasLineItem(
                    inPointMillisecondsForTranslation,
                    outPointMillisecondsForTranslation
                )
            )
                return new LineItemNotFoundError({
                    inPointMilliseconds: inPointMillisecondsForTranslation,
                    outPointMilliseconds: outPointMillisecondsForTranslation,
                });

            const existingLineItem = this.transcript.getLineItem(
                inPointMillisecondsForTranslation,
                outPointMillisecondsForTranslation
            ) as TranscriptItem;

            const newTextItem = new MultilingualTextItem({
                text: translation,
                languageCode,
                role: MultilingualTextItemRole.freeTranslation,
            });

            if (existingLineItem.text.has(languageCode))
                return new CannotAddDuplicateTranslationError(newTextItem, existingLineItem.text);

            const textUpdateResult = existingLineItem.text.translate(newTextItem);

            if (isInternalError(textUpdateResult)) return textUpdateResult;

            const newLineItem = existingLineItem.clone({
                text: textUpdateResult,
            });

            return this.safeClone({
                transcript: this.transcript.clone({
                    items: this.transcript.items.map((item) =>
                        item.isColocatedWith(existingLineItem) ? newLineItem : item
                    ),
                }),
            } as DeepPartial<DTO<this>>);
        }

        importLineItemsToTranscript(
            newItemDtos: DTO<TranscriptItem>[]
        ): ResultOrError<ITranscribableBase> {
            const newItems = newItemDtos.map((newItemDto) => new TranscriptItem(newItemDto));

            const outOfBoundsErrors = newItems.reduce((allErrors: InternalError[], item) => {
                const { inPointMilliseconds: inPoint, outPointMilliseconds: outPoint } = item;

                const timeBounds = this.getTimeBounds();

                return [inPoint, outPoint].some((point) => !isNumberWithinRange(point, timeBounds))
                    ? allErrors.concat(new TranscriptLineItemOutOfBoundsError(item, timeBounds))
                    : allErrors;
            }, []);

            if (outOfBoundsErrors.length > 0)
                return new InternalError(
                    `Failed to import line items as one or more items are out of bounds`,
                    outOfBoundsErrors
                );

            const transcriptUpdateResult = this.transcript.importLineItems(newItems);

            if (isInternalError(transcriptUpdateResult)) return transcriptUpdateResult;

            return this.safeClone({
                transcript: transcriptUpdateResult,
            } as DeepPartial<DTO<this>>);
        }

        countTranscriptParticipants(): number {
            if (!this.hasTranscript()) return 0;

            return this.transcript.countParticipants();
        }

        /**
         * Could this be a problem if we are using several mixins? Be careful
         * when applying a second mixin to a domain class.
         *
         * This should really be `getTranscriptCommmands` !
         */
        getResourceSpecificAvailableCommands(): string[] {
            // Doesn't this pattern defeat the purpose of the mixin?
            const availableCommandIds: string[] = super.getResourceSpecificAvailableCommands();

            if (!this.hasTranscript()) availableCommandIds.push(CREATE_TRANSCRIPT);

            if (this.hasTranscript()) availableCommandIds.push(ADD_PARTICIPANT_TO_TRANSCRIPT);

            // You can't add a line item without a participant to refer to (by initials)
            if (this.countTranscriptParticipants() > 0)
                availableCommandIds.push(ADD_LINE_ITEM_TO_TRANSCRIPT);

            if (this.hasTranscript() && this.transcript.hasLineItems())
                availableCommandIds.push(TRANSLATE_LINE_ITEM);

            return availableCommandIds;
        }
    };
}
