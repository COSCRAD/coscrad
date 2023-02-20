import { isNullOrUndefined, isNumberWithinRange } from '@coscrad/validation-constraints';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { ResourceCompositeIdentifier } from '../../../types/ResourceCompositeIdentifier';
import {
    ADD_LINE_ITEM_TO_TRANSCRIPT,
    ADD_PARTICIPANT_TO_TRANSCRIPT,
    CREATE_TRANSCRIPT,
} from '../commands/transcripts/constants';
import { CannotOverwriteTranscriptError, TranscriptLineItemOutOfBoundsError } from '../errors';
import { CannotAddParticipantBeforeCreatingTranscriptError } from '../errors/CannotAddParticipantBeforeCreatingTranscript.error';
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

            const { inPoint, outPoint } = newItem;

            if ([inPoint, outPoint].some((point) => !isNumberWithinRange(point, timeBounds)))
                return new TranscriptLineItemOutOfBoundsError(newItem, timeBounds);

            const updatedTranscript = this.transcript.addLineItem(new TranscriptItem(newItem));

            if (isInternalError(updatedTranscript)) return updatedTranscript;

            return this.safeClone({
                transcript: updatedTranscript,
            } as DeepPartial<DTO<this>>);
        }

        countTranscriptParticipants(): number {
            if (!this.hasTranscript()) return 0;

            return this.transcript.countParticipants();
        }

        /**
         * Could this be a problem if we are using several mixins? Be careful
         * when applying a second mixin to a domain class.
         */
        getResourceSpecificAvailableCommands(): string[] {
            const availableCommandIds: string[] = super.getResourceSpecificAvailableCommands();

            if (!this.hasTranscript()) availableCommandIds.push(CREATE_TRANSCRIPT);

            if (this.hasTranscript()) availableCommandIds.push(ADD_PARTICIPANT_TO_TRANSCRIPT);

            // You can't add a line item without a participant to refer to (by initials)
            if (this.countTranscriptParticipants() > 0)
                availableCommandIds.push(ADD_LINE_ITEM_TO_TRANSCRIPT);

            return availableCommandIds;
        }
    };
}
