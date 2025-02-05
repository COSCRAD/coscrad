import { LanguageCode } from '@coscrad/api-interfaces';
import {
    BooleanDataType,
    ExternalEnum,
    MIMEType,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    URL,
} from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { Aggregate } from '../../aggregate.entity';
import { isAudioMimeType } from '../../audio-visual/audio-item/entities/audio-item.entity';
import { isVideoMimeType } from '../../audio-visual/video/entities/video.entity';
import { isPhotographMimeType } from '../../photograph/entities/photograph.entity';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import newInstance from '../../shared/functional/newInstance';
import { ContributorAndRole } from '../../song/ContributorAndRole';
import { InconsistentMediaItemPropertyError } from '../errors';
import { getExtensionForMimeType } from './get-extension-for-mime-type';
import { MediaItemDimensions } from './media-item-dimensions';

@RegisterIndexScopedCommands(['CREATE_MEDIA_ITEM'])
export class MediaItem extends Aggregate {
    @BooleanDataType({
        isOptional: false,
        label: 'is published',
        description: 'is this media item available to the public?',
    })
    readonly published: boolean;

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

    /**
     * TODO Soon we will want to generate URLs dynamically.
     * There should be an endpoint where you can fetch an
     * internal media item if you have access.
     */
    @URL({
        label: 'url',
        description: 'a web link to the corresponding media file',
    })
    readonly url: string;

    readonly queryAccessControlList?: AccessControlList;

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
            url,
            mimeType,
            lengthMilliseconds,
            dimensions: dimensionsDto,
        } = dto;

        this.title = title;

        this.contributorAndRoles = Array.isArray(contributorAndRoles)
            ? contributorAndRoles.map(newInstance(ContributorAndRole))
            : null;

        this.url = url;

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

    getTimeBounds(): [number, number] {
        return [0, this.lengthMilliseconds];
    }

    override getAvailableCommands(): string[] {
        throw new Error('Method not implemented.');
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
