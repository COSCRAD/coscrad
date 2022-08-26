import { CommandInfo } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { SpatialFeatureViewModel } from '../../../view-models/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import { Line } from '../../models/spatial-feature/entities/line.entity';
import { Point } from '../../models/spatial-feature/entities/point.entity';
import { Polygon } from '../../models/spatial-feature/entities/polygon.entity';
import { ISpatialFeature } from '../../models/spatial-feature/interfaces/spatial-feature.interface';
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
        return ([Line, Point, Polygon] as DomainModelCtor[]).flatMap(
            (Ctor) => this.commandInfoService.getCommandInfo(Ctor) || []
        );
    }
}
