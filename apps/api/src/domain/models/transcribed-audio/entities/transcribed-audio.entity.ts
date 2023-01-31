import {
    MIMEType,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    ReferenceTo,
} from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import { DTO } from '../../../../types/DTO';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import InvalidExternalReferenceByAggregateError from '../../categories/errors/InvalidExternalReferenceByAggregateError';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { Resource } from '../../resource.entity';
import validateTimeRangeContextForModel from '../../shared/contextValidators/validateTimeRangeContextForModel';
import { InvalidMIMETypeForTranscriptMediaError } from '../commands/errors';
import { TranscriptItem } from './MediaTimeRange';

class TranscriptParticipant extends BaseDomainModel {
    @NonEmptyString({
        label: 'speaker label',
        description: 'a label (e.g., initials) for this speaker',
    })
    readonly label: string;

    @NonEmptyString({
        label: 'id',
        description: "the participant's id, for now their name",
    })
    // This should eventually point to a "Person" model
    // For now we'll simply put the Participant's name here
    readonly id: AggregateId;

    constructor({ label, id }: DTO<TranscriptParticipant>) {
        super();

        this.label = label;

        this.id = id;
    }
}

export type CoscradTimeStamp = number;

export type CoscradText = string;

@RegisterIndexScopedCommands([])
export class Transcript<T extends CoscradText = string> extends Resource {
    readonly type = ResourceType.transcribedAudio;

    /**
     * TODO Make this multi-lingual text
     */
    @NonEmptyString({
        label: 'name',
        description: 'the name of the transcript',
    })
    readonly name: string;

    // TODO Validate that there are not duplicate IDs here
    participants: TranscriptParticipant[];

    @NestedDataType(TranscriptItem, {
        isArray: true,
        label: 'items',
        description: 'time stamps with text and speaker labels',
    })
    // TODO rename this, as it includes the data as well
    items: TranscriptItem<T>[];

    // TODO Make this UUID
    @NonEmptyString({
        label: 'media item ID',
        description: `ID of the transcript's media item`,
    })
    /**
     * During creation, we ensure that the media item ID is for an audio
     * or video file (and not a photograph, for example).
     */
    @ReferenceTo(AggregateType.mediaItem)
    mediaItemId: AggregateId;

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
    lengthMilliseconds: CoscradTimeStamp;

    constructor(dto: DTO<Transcript<T>>) {
        super(dto);

        if (!dto) return;

        const { items, name, participants, mediaItemId, lengthMilliseconds } = dto;

        this.name = name;

        this.mediaItemId = mediaItemId;

        this.lengthMilliseconds = lengthMilliseconds;

        this.participants = Array.isArray(participants)
            ? participants.map((p) => new TranscriptParticipant(p))
            : null;

        this.items = Array.isArray(items) ? items.map((item) => new TranscriptItem(item)) : null;
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

        if (!this.isMIMETypeAllowedForTranscript(mimeType))
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
    }

    validateTimeRangeContext(timeRangeContext: TimeRangeContext): Valid | InternalError {
        return validateTimeRangeContextForModel(this, timeRangeContext);
    }

    getTimeBounds(): [number, number] {
        return [0, this.lengthMilliseconds];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    private isMIMETypeAllowedForTranscript(mimeType: MIMEType): boolean {
        return [MIMEType.mp3, MIMEType.mp4].includes(mimeType);
    }
}
