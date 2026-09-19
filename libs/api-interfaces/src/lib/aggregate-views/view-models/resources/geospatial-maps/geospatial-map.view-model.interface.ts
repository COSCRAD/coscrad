import { IBaseViewModel } from '../../base.view-model.interface';
import { IMultilingualText } from '../common';

export interface IGeospatialMapViewModel extends IBaseViewModel {
    description: IMultilingualText;

    // points: PointViewForMap[]
}
