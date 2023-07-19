import { ISpatialFeatureProperties } from '@coscrad/api-interfaces';
import { NonEmptyString, URL } from '@coscrad/data-types';
import { DTO } from '../../../../../types/DTO';
import BaseDomainModel from '../../../BaseDomainModel';

export class SpatialFeatureProperties extends BaseDomainModel implements ISpatialFeatureProperties {
    @NonEmptyString({
        label: 'name',
        description: 'a place name (in any language)',
    })
    readonly name: string;

    @NonEmptyString({
        label: 'description',
        description: 'a description of the place',
    })
    readonly description: string;

    @URL({
        label: 'image link',
        description: 'a full URL link to an image to display with this spatial feature',
    })
    readonly imageUrl: string;

    constructor(dto: DTO<SpatialFeatureProperties>) {
        super();

        if (!dto) return;

        const { name, description, imageUrl } = dto;

        this.name = name;

        this.description = description;

        this.imageUrl = imageUrl;
    }
}
