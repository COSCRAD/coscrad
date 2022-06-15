import {
    IsEnum,
    IsNonNegativeFiniteNumber,
    IsStrictlyEqualTo,
    IsStringWithNonzeroLength,
    IsUrl,
    ValidateNested,
} from '@coscrad/validation';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import mediaItemValidator from '../../../domainModelValidators/mediaItemValidator';
import { Valid } from '../../../domainModelValidators/Valid';
import { ResourceType } from '../../../types/ResourceType';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../../interfaces/ITimeBoundable';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import validateTimeRangeContextForModel from '../../shared/contextValidators/validateTimeRangeContextForModel';
import { ContributorAndRole } from '../../song/ContributorAndRole';
import { MIMEType } from '../types/MIMEType';

export class MediaItem extends Resource implements ITimeBoundable {
    @IsStrictlyEqualTo(ResourceType.mediaItem)
    readonly type = ResourceType.mediaItem;

    @IsStringWithNonzeroLength()
    readonly title?: string;

    @IsStringWithNonzeroLength()
    readonly titleEnglish?: string;

    @ValidateNested()
    readonly contributorAndRoles: ContributorAndRole[];

    @IsUrl()
    readonly url: string;

    @IsEnum(MIMEType)
    readonly mimeType: MIMEType;

    @IsNonNegativeFiniteNumber()
    readonly lengthMilliseconds: number;

    constructor(dto: DTO<MediaItem>) {
        super(dto);

        // This should only happen within the validation flow
        if (!dto) return;

        const { title, titleEnglish, contributorAndRoles, url, mimeType, lengthMilliseconds } = dto;

        this.title = title;

        this.titleEnglish = titleEnglish;

        this.contributorAndRoles = contributorAndRoles.map(
            (contributorAndRoleDTO) => new ContributorAndRole(contributorAndRoleDTO)
        );

        this.url = url;

        this.mimeType = mimeType;

        this.lengthMilliseconds = lengthMilliseconds;
    }

    validateInvariants(): ResultOrError<typeof Valid> {
        return mediaItemValidator(this);
    }

    validateTextFieldContext(context: TextFieldContext): Valid | InternalError {
        return validateTextFieldContextForModel(this, context);
    }

    validateTimeRangeContext(timeRangeContext: TimeRangeContext): Valid | InternalError {
        return validateTimeRangeContextForModel(this, timeRangeContext);
    }

    getTimeBounds(): [number, number] {
        return [0, this.lengthMilliseconds];
    }
}
