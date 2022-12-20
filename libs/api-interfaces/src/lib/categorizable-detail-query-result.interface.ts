import { IBaseViewModel, WithTags } from './aggregate-views';
import { IDetailQueryResult } from './detail-query-result.interface';

export type ICategorizableDetailQueryResult<UViewModel extends IBaseViewModel> = IDetailQueryResult<
    WithTags<UViewModel>
>;
