import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { Valid } from '../../../domainModelValidators/Valid';
import { resourceTypes } from '../../../types/resourceTypes';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../../interfaces/ITimeBoundable';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import validateTimeRangeContextForModel from '../../shared/contextValidators/validateTimeRangeContextForModel';
import { ContributorAndRole } from '../../song/ContributorAndRole';
import { MIMEType } from '../types/MIMETypes';

export class MediaItem extends Resource implements ITimeBoundable {
    readonly type = resourceTypes.mediaItem;

    readonly title?: string;

    readonly titleEnglish?: string;

    readonly contributorAndRoles: ContributorAndRole[];

    readonly url: string;

    readonly mimeType: MIMEType;

    readonly lengthMilliseconds: number;

    constructor(dto: DTO<MediaItem>) {
        super(dto);

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
