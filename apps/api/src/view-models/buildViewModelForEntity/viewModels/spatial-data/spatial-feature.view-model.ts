import { ApiProperty } from '@nestjs/swagger';
import { GeometricFeature } from 'apps/api/src/domain/models/spatial-feature/GeometricFeature';
import { ISpatialFeature } from 'apps/api/src/domain/models/spatial-feature/ISpatialFeature';
import cloneToPlainObject from 'apps/api/src/lib/utilities/cloneToPlainObject';
import { ViewModelId } from '../types/ViewModelId';

/**
 * For now, we will have a single `SpatialFeatureViewModel` and require the
 * client to deal with discriminating the union client-side.
 */
export class SpatialFeatureViewModel {
    // TODO Maybe we should put this on an EntityViewModel base class
    @ApiProperty({
        example: '12',
        description: 'uniquely identifies a tag amongst other tags',
    })
    readonly id: ViewModelId;

    // TODO Add docs
    readonly geometry: GeometricFeature;

    constructor({ id, geometry }: ISpatialFeature) {
        this.id = id;

        this.geometry = cloneToPlainObject(geometry);
    }
}
