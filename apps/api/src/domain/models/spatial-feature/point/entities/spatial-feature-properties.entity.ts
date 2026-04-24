import { ISpatialFeatureProperties } from '@coscrad/api-interfaces';
import { NestedDataType, URL } from '@coscrad/data-types';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { DTO } from '../../../../../types/DTO';
import BaseDomainModel from '../../../base-domain-model.entity';

export class SpatialFeatureProperties extends BaseDomainModel implements ISpatialFeatureProperties {
    // TODO Make this multilingual text
    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'a place name (in any language)',
    })
    readonly name: MultilingualText;

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
}
