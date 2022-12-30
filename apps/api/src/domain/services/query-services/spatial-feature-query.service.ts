import { ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { SpatialFeatureViewModel } from '../../../view-models/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { Line } from '../../models/spatial-feature/entities/line.entity';
import { Point } from '../../models/spatial-feature/entities/point.entity';
import { Polygon } from '../../models/spatial-feature/entities/polygon.entity';
import { ISpatialFeature } from '../../models/spatial-feature/interfaces/spatial-feature.interface';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class SpatialFeatureQueryService extends ResourceQueryService<
    ISpatialFeature,
    ISpatialFeatureViewModel
> {
    protected readonly type = ResourceType.spatialFeature;

    buildViewModel(spatialFeatureInstance: ISpatialFeature): ISpatialFeatureViewModel {
        return new SpatialFeatureViewModel(spatialFeatureInstance);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Line, Point, Polygon];
    }
}
