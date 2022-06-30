import { CommandInfo } from '../../../app/controllers/command/services/command-info-service';
import { SpatialFeatureViewModel } from '../../../view-models/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import { ISpatialFeature } from '../../models/spatial-feature/ISpatialFeature';
import { Line } from '../../models/spatial-feature/line.entity';
import { Point } from '../../models/spatial-feature/point.entity';
import { Polygon } from '../../models/spatial-feature/polygon.entity';
import { ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

export class SpatialFeatureQueryService extends BaseQueryService<
    ISpatialFeature,
    SpatialFeatureViewModel
> {
    protected readonly type = ResourceType.spatialFeature;

    buildViewModel(spatialFeatureInstance: ISpatialFeature): SpatialFeatureViewModel {
        return new SpatialFeatureViewModel(spatialFeatureInstance);
    }

    getInfoForIndexScopedCommands(): CommandInfo[] {
        return [Line, Point, Polygon].flatMap(
            (Ctor) => this.commandInfoService.getCommandInfo(Ctor) || []
        );
    }
}
