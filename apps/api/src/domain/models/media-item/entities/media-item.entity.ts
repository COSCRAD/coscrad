import { LanguageCode } from '@coscrad/api-interfaces';
import {
    ExternalEnum,
    MIMEType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    URL,
} from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../../interfaces/ITimeBoundable';
import { Resource } from '../../resource.entity';
import validateTimeRangeContextForModel from '../../shared/contextValidators/validateTimeRangeContextForModel';
import newInstance from '../../shared/functional/newInstance';
import { ContributorAndRole } from '../../song/ContributorAndRole';
import { getExtensionForMimeType } from './getExtensionForMimeType';

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
    readonly lengthMilliseconds?: number;

    constructor(dto: DTO<MediaItem>) {
        super(dto);

        // This should only happen within the validation flow
        if (!dto) return;

        const { title, contributorAndRoles, url, mimeType, lengthMilliseconds } = dto;

        this.title = title;

        this.contributorAndRoles = Array.isArray(contributorAndRoles)
            ? contributorAndRoles.map(newInstance(ContributorAndRole))
            : null;

        this.url = url;

        this.mimeType = mimeType;

        this.lengthMilliseconds = lengthMilliseconds;
    }

    getName(): MultilingualText {
        // TODO [migration] change `title` to `MultilingualText`
        return buildMultilingualTextWithSingleItem(this.title, LanguageCode.Chilcotin);
    }

    getFilePath(): string {
        return `${this.title}.${getExtensionForMimeType(this.mimeType)}`;
    }

    protected validateComplexInvariants(): InternalError[] {
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
