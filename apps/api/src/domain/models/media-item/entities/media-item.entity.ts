import {
    CoscradEnum,
    Enum,
    MIMEType,
    NestedDataType,
    NonEmptyString,
    URL,
} from '@coscrad/data-types';
import { IsNonNegativeFiniteNumber, isStringWithNonzeroLength } from '@coscrad/validation';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import MediaItemHasNoTitleInAnyLanguageError from '../../../domainModelValidators/errors/mediaItem/MediaItemHasNoTitleInAnyLanguageError';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../../interfaces/ITimeBoundable';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import validateTimeRangeContextForModel from '../../shared/contextValidators/validateTimeRangeContextForModel';
import newInstance from '../../shared/functional/newInstance';
import { ContributorAndRole } from '../../song/ContributorAndRole';

@RegisterIndexScopedCommands(['CREATE_MEDIA_ITEM'])
export class MediaItem extends Resource implements ITimeBoundable {
    readonly type = ResourceType.mediaItem;

    @NonEmptyString({ isOptional: true })
    readonly title?: string;

    @NonEmptyString({ isOptional: true })
    readonly titleEnglish?: string;

    @NestedDataType(ContributorAndRole, { isArray: true })
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

        this.contributorAndRoles = Array.isArray(contributorAndRoles)
            ? contributorAndRoles.map(newInstance(ContributorAndRole))
            : null;

        this.url = url;

        this.mimeType = mimeType;

        this.lengthMilliseconds = lengthMilliseconds;
    }

    protected validateComplexInvariants(): InternalError[] {
        const { id, title, titleEnglish } = this;

        const allErrors: InternalError[] = [];

        if (!isStringWithNonzeroLength(title) && !isStringWithNonzeroLength(titleEnglish))
            allErrors.push(new MediaItemHasNoTitleInAnyLanguageError(id));

        return allErrors;
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
