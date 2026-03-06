import { ISpatialFeatureProperties, LanguageCode } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString, URL } from '@coscrad/data-types';
import { isNonEmptyObject, isNullOrUndefined } from '@coscrad/validation-constraints';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import BaseDomainModel from '../../../base-domain-model.entity';
import { CannotReplaceTraditionalNameError, SpatialFeatureMustHaveANameError } from '../../errors';

@CoscradDataExample<SpatialFeatureProperties>({
    example: {
        description: 'this is a big lake',
        traditionalName: buildMultilingualTextWithSingleItem('Big Lake'),
    },
})
export class SpatialFeatureProperties extends BaseDomainModel implements ISpatialFeatureProperties {
    @NonEmptyString({
        label: 'description',
        description: 'a description of the place',
    })
    readonly description: string;

    @URL({
        isOptional: true,
        label: 'image link',
        description: 'a full URL link to an image to display with this spatial feature',
    })
    // TODO We may want to make this a media item ID
    readonly imageUrl?: string;

    @NestedDataType(MultilingualText, {
        label: 'traditional name',
        description: 'the name this place was traditionally called by locals',
        isOptional: true,
    })
    traditionalName?: MultilingualText;

    @NestedDataType(MultilingualText, {
        label: 'contemporary name',
        description: 'a more recently introduced, typically colonial name for this place',
        isOptional: true,
    })
    contemporaryName?: MultilingualText;

    constructor(dto: DTO<SpatialFeatureProperties>) {
        super();

        if (!dto) return;

        const { description, imageUrl, traditionalName, contemporaryName } = dto;

        this.description = description;

        this.imageUrl = imageUrl;

        if (isNonEmptyObject(traditionalName)) {
            this.traditionalName = new MultilingualText(traditionalName);
        }

        if (isNonEmptyObject(contemporaryName)) {
            this.contemporaryName = new MultilingualText(contemporaryName);
        }
    }

    getName(): MultilingualText {
        if (isNonEmptyObject(this.traditionalName)) {
            return this.traditionalName;
        }

        if (isNonEmptyObject(this.contemporaryName)) {
            return this.contemporaryName;
        }

        // this shouldn't happen because it is an invariant rule that one of `traditionalName` or `contemporaryName` must be defined
        return buildMultilingualTextWithSingleItem(this.description);
    }

    addTraditionalName(
        text: string,
        languageCode: LanguageCode
    ): ResultOrError<SpatialFeatureProperties> {
        if (!isNullOrUndefined(this.traditionalName)) {
            return new CannotReplaceTraditionalNameError(
                text,
                this.traditionalName.getOriginalTextItem().text
            );
        }

        this.traditionalName = buildMultilingualTextWithSingleItem(text, languageCode);

        return this;
    }

    validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        if (!this.traditionalName && !this.contemporaryName) {
            allErrors.push(new SpatialFeatureMustHaveANameError());
        }

        return allErrors;
    }
}
