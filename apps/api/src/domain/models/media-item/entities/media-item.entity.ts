import {
    CoscradEnum,
    Enum,
    MIMEType,
    NestedDataType,
    NonEmptyString,
    URL,
} from '@coscrad/data-types';
import { IsNonNegativeFiniteNumber, IsStrictlyEqualTo } from '@coscrad/validation';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import mediaItemValidator from '../../../domainModelValidators/mediaItemValidator';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../../interfaces/ITimeBoundable';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import validateTimeRangeContextForModel from '../../shared/contextValidators/validateTimeRangeContextForModel';
import { ContributorAndRole } from '../../song/ContributorAndRole';

@RegisterIndexScopedCommands(['CREATE_MEDIA_ITEM'])
export class MediaItem extends Resource implements ITimeBoundable {
    @IsStrictlyEqualTo(ResourceType.mediaItem)
    readonly type = ResourceType.mediaItem;

    @NonEmptyString({ isOptional: true })
    readonly title?: string;

    @NonEmptyString({ isOptional: true })
    readonly titleEnglish?: string;

    @NestedDataType(ContributorAndRole)
    readonly contributorAndRoles: ContributorAndRole[];

    @URL()
    readonly url: string;

    @Enum(CoscradEnum.MIMEType)
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

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
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

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
