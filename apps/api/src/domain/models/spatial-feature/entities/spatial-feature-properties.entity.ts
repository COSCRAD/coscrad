import { ISpatialFeatureProperties } from '@coscrad/api-interfaces';
import { NonEmptyString, URL } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';

export class SpatialFeatureProperties extends BaseDomainModel implements ISpatialFeatureProperties {
    @NonEmptyString()
    readonly name: string;

    @NonEmptyString()
    readonly description: string;

    @URL()
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
