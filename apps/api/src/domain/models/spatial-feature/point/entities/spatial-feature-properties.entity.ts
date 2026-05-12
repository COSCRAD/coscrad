import {
    ISpatialFeatureProperties,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { NestedDataType, URL } from '@coscrad/data-types';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { isInternalError } from '../../../../../lib/errors/InternalError';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import BaseDomainModel from '../../../base-domain-model.entity';

@CoscradDataExample<SpatialFeatureProperties>({
    example: {
        name: buildMultilingualTextWithSingleItem('test point translation name'),
        description: buildMultilingualTextWithSingleItem('description of the translation'),
        imageUrl: 'https://www.coscrad.org/place.png',
    },
})
export class SpatialFeatureProperties extends BaseDomainModel implements ISpatialFeatureProperties {
    // TODO Make this multilingual text
    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'a place name (in any language)',
    })
    name: MultilingualText;

    @NestedDataType(MultilingualText, {
        label: 'description',
        description: 'a description of the place',
    })
    readonly description: MultilingualText;

    @URL({
        isOptional: true,
        label: 'image link',
        description: 'a full URL link to an image to display with this spatial feature',
    })
    // TODO We may want to make this a media item ID
    readonly imageUrl?: string;

    constructor(dto: DTO<SpatialFeatureProperties>) {
        super();

        if (!dto) return;

        const { name, description, imageUrl } = dto;

        this.name = new MultilingualText(name);

        this.description = new MultilingualText(description);

        this.imageUrl = imageUrl;
    }

    // @UpdateMethod()
    translateName(
        translation: string,
        languageCode: LanguageCode
    ): ResultOrError<SpatialFeatureProperties> {
        const textUpdateResult = this.name.translate({
            text: translation,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });

        if (isInternalError(textUpdateResult)) {
            return textUpdateResult;
        }

        this.name = textUpdateResult;

        return this;
    }
}
