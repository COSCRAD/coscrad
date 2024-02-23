import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import {
    MIMEType,
    NestedDataType,
    NonNegativeFiniteNumber,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../../lib/errors/types/ValidationResult';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import { TimeRangeContext } from '../../../context/time-range-context/time-range-context.entity';
import { Resource } from '../../../resource.entity';
import validateTimeRangeContextForModel from '../../../shared/contextValidators/validateTimeRangeContextForModel';
import { InvalidMIMETypeForAudiovisualResourceError } from '../../audio-item/commands/errors';
import { CoscradTimeStamp } from '../../audio-item/entities/audio-item.entity';
import {
    Constructor,
    ITranscribable,
    ITranscribableBase,
    Transcribable,
} from '../../shared/entities/transcribable.mixin';
import { Transcript } from '../../shared/entities/transcript.entity';
import { createTranscriptImplementation } from '../../shared/methods/create-transcript';

export const isVideoMimeType = (mimeType: MIMEType): boolean =>
    [MIMEType.mp4, MIMEType.videoOgg, MIMEType.videoWebm].includes(mimeType);

@RegisterIndexScopedCommands([`CREATE_VIDEO`])
export class VideoBase extends Resource {
    readonly type = ResourceType.video;

    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'the name of the video',
    })
    readonly name: MultilingualText;

    @NestedDataType(Transcript, {
        isOptional: true,
        label: 'items',
        description: 'time stamps with text and speaker labels',
    })
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

    constructor(dto: DTO<VideoBase>) {
        super(dto);

        if (!dto) return;

        const { name, mediaItemId, lengthMilliseconds, transcript } = dto;

        this.name = new MultilingualText(name);

        this.mediaItemId = mediaItemId;

        this.lengthMilliseconds = lengthMilliseconds;

        // It's a bit odd that we allow the invalid value to be set so that our validator catches this
        this.transcript = !isNullOrUndefined(transcript) ? new Transcript(transcript) : transcript;
    }

    getName(): MultilingualText {
        return this.name;
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const transcriptValidationResult = this.transcript?.validateComplexInvariants() || Valid;

        if (isInternalError(transcriptValidationResult)) allErrors.push(transcriptValidationResult);

        const nameValidationResult = this.name.validateComplexInvariants();

        if (isInternalError(nameValidationResult)) allErrors.push(nameValidationResult);

        return allErrors;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [
            {
                type: AggregateType.mediaItem,
                id: this.mediaItemId,
            },
        ];
    }

    createTranscript<T>(this: T) {
        return createTranscriptImplementation.apply(this);
    }

    translateName(text: string, languageCode: LanguageCode): ResultOrError<this> {
        return this.translateMultilingualTextProperty('name', {
            text,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });
    }

    override validateExternalReferences({
        resources: { mediaItem: mediaItems },
    }: InMemorySnapshot): ValidationResult {
        const myMediaItem = mediaItems.find(({ id }) => id === this.mediaItemId);

        /**
         * Note that the reference to the media item is validated via the schema
         * on video creation, so we shouldn't actually hit this.
         */
        if (isNullOrUndefined(myMediaItem))
            return new InvalidExternalReferenceByAggregateError(this.getCompositeIdentifier(), [
                {
                    type: AggregateType.mediaItem,
                    id: this.mediaItemId,
                },
            ]);

        const { mimeType } = myMediaItem;

        if (!isVideoMimeType(mimeType))
            return new InvalidExternalReferenceByAggregateError(
                this.getCompositeIdentifier(),
                [
                    {
                        type: AggregateType.mediaItem,
                        id: this.mediaItemId,
                    },
                ],
                [
                    new InvalidMIMETypeForAudiovisualResourceError(
                        this.getCompositeIdentifier(),
                        mimeType
                    ),
                ]
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

    protected getResourceSpecificAvailableCommands(): string[] {
        const availableCommandIds: string[] = [`TRANSLATE_VIDEO_NAME`];

        return availableCommandIds;
    }
}

// mixin the transcribable behaviour
export const Video = Transcribable(VideoBase as unknown as Constructor<ITranscribableBase>);

export type Video = ITranscribable & VideoBase;
