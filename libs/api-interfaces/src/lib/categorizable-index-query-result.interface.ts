import { IBaseViewModel, WithTags } from './aggregate-views';
import { IIndexQueryResult } from './index-query-result.interface';

export type ICategorizableIndexQueryResult<UViewModel extends IBaseViewModel> = IIndexQueryResult<
    WithTags<UViewModel>
>;
