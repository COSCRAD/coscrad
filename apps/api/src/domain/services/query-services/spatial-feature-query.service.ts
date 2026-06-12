import { ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { SpatialFeatureViewModel } from '../../../queries/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import BaseDomainModel from '../../models/base-domain-model.entity';
import { ISpatialFeature } from '../../models/spatial-feature/interfaces/spatial-feature.interface';
import { Point } from '../../models/spatial-feature/point/entities/point.entity';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class SpatialFeatureQueryService extends ResourceQueryService<
    ISpatialFeature,
    ISpatialFeatureViewModel
> {
    protected readonly type = ResourceType.spatialFeature;

    buildViewModel(spatialFeatureInstance: ISpatialFeature): ISpatialFeatureViewModel {
        return SpatialFeatureViewModel.fromDomainModel(spatialFeatureInstance);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Point];
    }
}
