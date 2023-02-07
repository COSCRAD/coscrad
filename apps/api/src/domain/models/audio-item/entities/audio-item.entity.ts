import {
    MIMEType,
    NestedDataType,
    NonNegativeFiniteNumber,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { isNumberWithinRange } from '@coscrad/validation-constraints';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { MultiLingualText } from '../../../common/entities/multi-lingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import InvalidExternalReferenceByAggregateError from '../../categories/errors/InvalidExternalReferenceByAggregateError';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { Resource } from '../../resource.entity';
import validateTimeRangeContextForModel from '../../shared/contextValidators/validateTimeRangeContextForModel';
import { CREATE_AUDIO_ITEM } from '../commands';
import { InvalidMIMETypeForTranscriptMediaError } from '../commands/errors';
import { CREATE_TRANSCRIPT } from '../commands/transcripts/constants';
import { CannotOverwriteTranscriptError, TranscriptLineItemOutOfBoundsError } from '../errors';
import { CannotAddParticipantBeforeCreatingTranscriptError } from '../errors/CannotAddParticipantBeforeCreatingTranscript.error';
import { TranscriptItem } from './transcript-item.entity';
import { TranscriptParticipant } from './transcript-participant';
import { Transcript } from './transcript.entity';

export type CoscradTimeStamp = number;

export type CoscradText = string | MultiLingualText;

@RegisterIndexScopedCommands([CREATE_AUDIO_ITEM])
export class AudioItem extends Resource {
    readonly type = ResourceType.audioItem;

    @NestedDataType(MultiLingualText, {
        label: 'name',
        description: 'the name of the transcript',
    })
    readonly name: MultiLingualText;

    @NestedDataType(Transcript, {
        isOptional: true,
        label: 'items',
        description: 'time stamps with text and speaker labels',
    })
    // TODO rename this, as it includes the data as well
    readonly transcript?: Transcript;

    // TODO Make this UUID
    @UUID({
        label: 'media item ID',
        description: `ID of the transcript's media item`,
    })
    /**
     * During creation, we ensure that the media item ID is for an audio
     * or video file (and not a photograph, for example).
     */
    @ReferenceTo(AggregateType.mediaItem)
    readonly mediaItemId: AggregateId;

    // TODO ensure that items are consistent with this property
    /**
     * Note that we cache this on the model so that we can validate
     * the `items` in \ out points as part of invariant validation.
     * The alternative is to fetch the media item every time.
     *
     * Note also that we should disallow any update to a media item
     * that changes its length.
     */
    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: `the length of the transcript's media item in milliseconds`,
    })
    readonly lengthMilliseconds: CoscradTimeStamp;

    constructor(dto: DTO<AudioItem>) {
        super(dto);

        if (!dto) return;

        const { name, mediaItemId, lengthMilliseconds, transcript } = dto;

        this.name = new MultiLingualText(name);

        this.mediaItemId = mediaItemId;

        this.lengthMilliseconds = lengthMilliseconds;

        // It's a bit odd that we allow the invalid value to be set so that our validator catches this
        this.transcript = !isNullOrUndefined(transcript) ? new Transcript(transcript) : transcript;
    }

    createTranscript(): ResultOrError<AudioItem> {
        if (this.hasTranscript())
            return new CannotOverwriteTranscriptError(this.getCompositeIdentifier());

        return this.safeClone({
            transcript: new Transcript({
                items: [],
                participants: [],
            }),
        } as DeepPartial<DTO<this>>);
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

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [
            {
                type: AggregateType.mediaItem,
                id: this.mediaItemId,
            },
        ];
    }

    override validateExternalReferences({
        resources: { mediaItem: mediaItems },
    }: InMemorySnapshot): ValidationResult {
        const myMediaItem = mediaItems.find(({ id }) => id === this.mediaItemId);

        if (isNullOrUndefined(myMediaItem))
            return new InvalidExternalReferenceByAggregateError(this.getCompositeIdentifier(), [
                {
                    type: AggregateType.mediaItem,
                    id: this.mediaItemId,
                },
            ]);

        const { mimeType } = myMediaItem;

        if (!this.isMIMETypeAllowed(mimeType))
            return new InvalidExternalReferenceByAggregateError(
                this.getCompositeIdentifier(),
                [
                    {
                        type: AggregateType.mediaItem,
                        id: this.mediaItemId,
                    },
                ],
                [new InvalidMIMETypeForTranscriptMediaError(this.id, mimeType)]
            );

        return Valid;
    }

    validateTimeRangeContext(timeRangeContext: TimeRangeContext): Valid | InternalError {
        return validateTimeRangeContextForModel(this, timeRangeContext);
    }

    length() {
        return this.lengthMilliseconds;
    }

    getTimeBounds(): [number, number] {
        return [0, this.lengthMilliseconds];
    }

    hasTranscript(): boolean {
        return !isNullOrUndefined(this.transcript);
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        const availableCommandIds: string[] = [];

        if (!this.hasTranscript) availableCommandIds.push(CREATE_TRANSCRIPT);

        return availableCommandIds;
    }

    private isMIMETypeAllowed(mimeType: MIMEType): boolean {
        return [MIMEType.mp3, MIMEType.mp4].includes(mimeType);
    }
}
