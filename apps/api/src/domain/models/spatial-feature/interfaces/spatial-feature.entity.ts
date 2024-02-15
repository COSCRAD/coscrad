import { ISpatialFeatureProperties } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { SpatialFeatureProperties } from '../point/entities/spatial-feature-properties.entity';
import { IGeometricFeature } from './geometric-feature.interface';

export abstract class SpatialFeature extends Resource {
    readonly type = ResourceType.spatialFeature;

    abstract readonly geometry: IGeometricFeature;

    readonly properties: ISpatialFeatureProperties;

    constructor(dto: DTO<SpatialFeature>) {
        super(dto);

        if (!dto) {
            return;
        }

        const { properties: propertiesDto } = dto;

        this.properties = new SpatialFeatureProperties(propertiesDto);
    }

    static fromEventHistory<TSpatialFeature extends SpatialFeature = SpatialFeature>(
        _eventStream: BaseEvent[],
        _id: AggregateId
    ): Maybe<ResultOrError<TSpatialFeature>> {
        throw new Error(`Not Implemented: fromEventHistory`);
    }
}
