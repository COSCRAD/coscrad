import { LanguageCode } from '@coscrad/api-interfaces';
import {
    ExternalEnum,
    MIMEType,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
} from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { isAudioMimeType } from '../../audio-visual/audio-item/entities/audio-item.entity';
import { isVideoMimeType } from '../../audio-visual/video/entities/video.entity';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../../interfaces/ITimeBoundable';
import { isPhotographMimeType } from '../../photograph/entities/photograph.entity';
import { Resource } from '../../resource.entity';
import validateTimeRangeContextForModel from '../../shared/contextValidators/validateTimeRangeContextForModel';
import newInstance from '../../shared/functional/newInstance';
import { ContributorAndRole } from '../../song/ContributorAndRole';
import { InconsistentMediaItemPropertyError } from '../errors';
import { getExtensionForMimeType } from './get-extension-for-mime-type';
import { MediaItemDimensions } from './media-item-dimensions';

@CoscradDataExample<MediaItem>({
    example: {
        id: '1',
        title: 'episode (media item 1) title (in language)',
        contributorAndRoles: [
            {
                contributorId: '2',
                role: 'host',
            },
        ],
        lengthMilliseconds: 2500,
        mimeType: MIMEType.wav,
        published: true,
        type: ResourceType.mediaItem,
    },
})
@CoscradDataExample<MediaItem>({
    example: {
        id: '2',
        title: 'video (media item 2) title (in language)',
        contributorAndRoles: [
            {
                contributorId: '2',
                role: 'host',
            },
        ],
        lengthMilliseconds: 910000,
        mimeType: MIMEType.mp4,
        published: true,
        type: ResourceType.mediaItem,
    },
})
@CoscradDataExample<MediaItem>({
    example: {
        id: '3',
        title: 'episode (media item 3) title (in language)',
        contributorAndRoles: [
            {
                contributorId: '2',
                role: 'host',
            },
        ],
        lengthMilliseconds: 2500,
        mimeType: MIMEType.mp3,
        published: true,
        type: ResourceType.mediaItem,
    },
})
@CoscradDataExample<MediaItem>({
    example: {
        id: '4',
        title: 'snow mountain',
        contributorAndRoles: [],
        mimeType: MIMEType.png,
        published: true,
        type: ResourceType.mediaItem,
    },
})
@CoscradDataExample<MediaItem>({
    example: {
        id: '5',
        title: 'Adiitsii Running',
        contributorAndRoles: [],
        mimeType: MIMEType.png,
        published: true,
        type: ResourceType.mediaItem,
    },
})
@CoscradDataExample<MediaItem>({
    example: {
        id: '6',
        title: 'Nuu Story',
        contributorAndRoles: [],
        mimeType: MIMEType.png,
        published: true,
        type: ResourceType.mediaItem,
    },
})
@CoscradDataExample<MediaItem>({
    example: {
        id: '7',
        title: 'Two Brothers Pole',
        contributorAndRoles: [],
        mimeType: MIMEType.png,
        published: true,
        type: ResourceType.mediaItem,
    },
})
@CoscradDataExample<MediaItem>({
    example: {
        id: '8',
        title: 'Mary Had a Little Lamb',
        contributorAndRoles: [],
        mimeType: MIMEType.wav,
        published: true,
        type: ResourceType.mediaItem,
    },
})
@CoscradDataExample<MediaItem>({
    example: {
        id: '9',
        title: 'No Light',
        contributorAndRoles: [],
        mimeType: MIMEType.wav,
        published: true,
        type: ResourceType.mediaItem,
    },
})
@RegisterIndexScopedCommands(['CREATE_MEDIA_ITEM'])
export class MediaItem extends Resource implements ITimeBoundable {
    readonly type = ResourceType.mediaItem;

    @NonEmptyString({
        isOptional: true,
        label: 'title (language)',
        description: 'title of the media item in the language',
    })
    readonly title?: string;

    // @NestedDataType(ContributorAndRole, {
    //     isArray: true,
    //     label: 'contributions',
    //     description: 'acknowledgement of those who worked on creating and producing the media item',
    // })
    // @deprecated Remove this property in favor of edge connections to a Contributor resource
    readonly contributorAndRoles?: ContributorAndRole[];

    @ExternalEnum(
        {
            labelsAndValues: Object.entries(MIMEType).map(([label, value]) => ({ label, value })),
            enumLabel: 'MIME type',
            enumName: 'MIMEType',
        },
        {
            label: 'MIME type',
            description: 'technical specification of the format of the media item',
        }
    )
    readonly mimeType: MIMEType;

    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: 'length of the media item in milliseconds',
        isOptional: true,
    })
    // This only applies to audio and video files.
    readonly lengthMilliseconds?: number;

    @NestedDataType(MediaItemDimensions, {
        label: 'dimensions',
        description: 'the width and height of the media item',
        isOptional: true,
    })
    readonly dimensions?: MediaItemDimensions;

    constructor(dto: DTO<MediaItem>) {
        super(dto);

        // This should only happen within the validation flow
        if (!dto) return;

        const {
            title,
            contributorAndRoles,
            mimeType,
            lengthMilliseconds,
            dimensions: dimensionsDto,
        } = dto;

        this.title = title;

        this.contributorAndRoles = Array.isArray(contributorAndRoles)
            ? contributorAndRoles.map(newInstance(ContributorAndRole))
            : null;

        this.mimeType = mimeType;

        this.lengthMilliseconds = lengthMilliseconds;

        if (!isNullOrUndefined(dimensionsDto))
            this.dimensions = new MediaItemDimensions(dimensionsDto);
    }

    getName(): MultilingualText {
        // TODO [migration] change `title` to `MultilingualText`
        return buildMultilingualTextWithSingleItem(this.title, LanguageCode.Chilcotin);
    }

    getFilePath(): string {
        return `${this.title}.${getExtensionForMimeType(this.mimeType)}`;
    }

    protected validateComplexInvariants(): InternalError[] {
        if (
            !isAudioMimeType(this.mimeType) &&
            !isVideoMimeType(this.mimeType) &&
            !isNullOrUndefined(this.lengthMilliseconds)
        ) {
            return [new InconsistentMediaItemPropertyError(`lengthMilliseconds`, this.mimeType)];
        }

        if (!isPhotographMimeType(this.mimeType) && !isNullOrUndefined(this.dimensions)) {
            return [new InconsistentMediaItemPropertyError('dimensions', this.mimeType)];
        }

        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
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
}
