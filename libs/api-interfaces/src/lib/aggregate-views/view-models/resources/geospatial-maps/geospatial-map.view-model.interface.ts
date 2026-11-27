import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { IMultilingualText } from '../common';

export interface IGeospatialMapViewModel extends IBaseResourceViewModel {
    description: IMultilingualText;

    // points: PointViewForMap[]
}
